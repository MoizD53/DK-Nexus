import { db } from "../db";
import crypto from "crypto";
import { MemberProfile } from "../db/queries/member";
import { Exercise } from "../db/queries/exercises";

interface WorkoutHistory {
  workout_date: string;
  exercises: {
    exercise_id: string;
    category: string;
    primary_muscle: string;
    sets: number;
    reps: number;
    weight: number | null;
    completed: boolean;
  }[];
}

export class PersonalizationEngine {
  private member: MemberProfile;
  private history: WorkoutHistory[];
  private globalExercises: Exercise[];

  constructor(member: MemberProfile, history: WorkoutHistory[], exercises: Exercise[]) {
    this.member = member;
    this.history = history;
    this.globalExercises = exercises;
  }

  public generate(): { 
    exercises: { exercise: Exercise, sets: number, reps: number, restSeconds: number }[],
    name: string,
    explanation: string
  } {
    // 1. Analyze Recovery
    const muscleRecovery = this.analyzeRecovery();
    
    // 2. Determine Muscle Focus Based on Frequency
    const focusMuscles = this.determineMuscleFocus(muscleRecovery);
    
    // 3. Select Exercises
    const selectedExercises = this.selectExercises(focusMuscles);

    // 4. Assign Sets, Reps, Rest based on Goal & Experience
    const finalWorkout = this.assignParameters(selectedExercises);

    // 5. Generate Explanation
    const explanation = this.generateExplanation(focusMuscles);
    const name = focusMuscles.length > 2 ? "Full Body Focus" : `${focusMuscles.join(" & ")} Focus`;

    return { exercises: finalWorkout, name, explanation };
  }

  private analyzeRecovery(): Record<string, number> {
    // Default days since last trained (large number means never/fully recovered)
    const recovery: Record<string, number> = {
      "Chest": 30, "Back": 30, "Legs": 30, "Shoulders": 30, "Biceps": 30, "Triceps": 30, "Core": 30
    };

    const now = new Date();

    for (const w of this.history) {
      const workoutDate = new Date(w.workout_date);
      const daysAgo = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24));
      
      for (const ex of w.exercises) {
        // Map exercise categories/muscles to basic groups
        let group = "";
        if (ex.category === "Chest") group = "Chest";
        else if (ex.category === "Back") group = "Back";
        else if (ex.category === "Legs") group = "Legs";
        else if (ex.category === "Shoulders") group = "Shoulders";
        else if (ex.category === "Biceps") group = "Biceps";
        else if (ex.category === "Triceps") group = "Triceps";
        else if (ex.category === "Core") group = "Core";

        if (group && daysAgo < recovery[group]) {
          recovery[group] = daysAgo;
        }
      }
    }
    return recovery;
  }

  private determineMuscleFocus(recovery: Record<string, number>): string[] {
    const freq = this.member.trainingFrequency || 3;
    
    // Sort muscles by most recovered (highest days since last trained)
    const sortedMuscles = Object.entries(recovery)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    if (freq <= 3) {
      // Full Body: Pick top 3-4 distinct groups (e.g., Chest, Back, Legs)
      return sortedMuscles.filter(m => ["Chest", "Back", "Legs", "Shoulders"].includes(m)).slice(0, 3);
    } else if (freq === 4) {
      // Upper / Lower (pick top 2)
      return sortedMuscles.slice(0, 2);
    } else {
      // Focused split (1 or 2 main muscles)
      return sortedMuscles.slice(0, 1);
    }
  }

  private selectExercises(focusMuscles: string[]): Exercise[] {
    const selected: Exercise[] = [];
    const experience = this.member.experience || "Beginner";
    
    let maxExercises = 4;
    if (experience === "Intermediate") maxExercises = 5;
    if (experience === "Advanced") maxExercises = 6;

    // Determine how many exercises per muscle
    const perMuscle = Math.max(1, Math.floor(maxExercises / focusMuscles.length));

    for (const muscle of focusMuscles) {
      // Find exercises for this muscle
      const muscleExs = this.globalExercises.filter(e => e.category === muscle);
      
      // Shuffle them (or prioritize compound if we had a compound flag)
      // For simplicity, prioritize Barbell/Dumbbell for Intermediate/Advanced
      if (experience !== "Beginner") {
        muscleExs.sort((a, b) => (b.equipment === "Barbell" ? 1 : 0) - (a.equipment === "Barbell" ? 1 : 0));
      }

      // Avoid exercises used in the very last workout if possible
      const lastWorkout = this.history[0];
      let candidates = muscleExs;
      if (lastWorkout && muscleExs.length > perMuscle) {
        const lastExIds = lastWorkout.exercises.map(e => e.exercise_id);
        const filtered = muscleExs.filter(e => !lastExIds.includes(e.id));
        if (filtered.length >= perMuscle) candidates = filtered;
      }

      selected.push(...candidates.slice(0, perMuscle));
    }

    // Fill remaining slots if any
    if (selected.length === 0 && this.globalExercises.length > 0) {
      selected.push(...this.globalExercises.slice(0, maxExercises));
    }

    return selected.slice(0, maxExercises);
  }

  private assignParameters(exercises: Exercise[]) {
    const goal = this.member.goal || "General Fitness";
    const experience = this.member.experience || "Beginner";
    
    let targetSets = 3;
    let targetReps = 10;
    let restSeconds = 90;

    // Centralized Goal Configuration
    switch (goal) {
      case "Build Muscle":
        targetSets = experience === "Advanced" ? 4 : 3;
        targetReps = 10;
        restSeconds = 90;
        break;
      case "Strength":
        targetSets = 4;
        targetReps = 5;
        restSeconds = 120;
        break;
      case "Weight Loss":
        targetSets = 3;
        targetReps = 15;
        restSeconds = 60;
        break;
      case "General Fitness":
      default:
        targetSets = 3;
        targetReps = 12;
        restSeconds = 90;
        break;
    }

    return exercises.map(exercise => {
      // Conservative Progressive Overload Check
      // Look for the last time they did this exact exercise
      let finalReps = targetReps;
      
      for (const w of this.history) {
        const pastEx = w.exercises.find(e => e.exercise_id === exercise.id);
        if (pastEx) {
          if (pastEx.completed && pastEx.reps >= targetReps) {
            // They crushed it last time. Slightly increase target reps to push overload without assuming weight
            finalReps = targetReps + 1; 
          }
          break; // only look at most recent
        }
      }

      return {
        exercise,
        sets: targetSets,
        reps: finalReps,
        restSeconds
      };
    });
  }

  private generateExplanation(focusMuscles: string[]): string {
    const freq = this.member.trainingFrequency || 3;
    
    if (focusMuscles.length > 0) {
      return `Today's workout focuses on ${focusMuscles.join(" and ")} based on your recent recovery data and ${freq} day/week schedule.`;
    }
    return `Today's workout is designed for your ${this.member.goal} goal.`;
  }
}
