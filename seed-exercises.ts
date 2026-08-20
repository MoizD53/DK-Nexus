import { db } from "./src/lib/db";
import crypto from "crypto";

const exercises = [
  { name: "Barbell Bench Press", category: "Chest", primaryMuscle: "Pectoralis Major", secondaryMuscles: "Triceps, Anterior Deltoids", equipment: "Barbell, Bench", difficulty: "Intermediate", instructions: "1. Lie flat on bench.\n2. Grip barbell slightly wider than shoulder width.\n3. Lower bar to mid-chest with control.\n4. Press up powerfully to starting position.", commonMistakes: "Bouncing bar off chest\nFlaring elbows out too wide\nLifting glutes off the bench" },
  { name: "Incline Dumbbell Press", category: "Chest", primaryMuscle: "Upper Pectoralis Major", secondaryMuscles: "Triceps, Anterior Deltoids", equipment: "Dumbbells, Incline Bench", difficulty: "Intermediate", instructions: "1. Set bench to 30-45 degrees.\n2. Press dumbbells up over chest.\n3. Lower with control until you feel a stretch.\n4. Press back up.", commonMistakes: "Arching back too much\nGoing too heavy and sacrificing range of motion" },
  { name: "Cable Fly", category: "Chest", primaryMuscle: "Pectoralis Major", secondaryMuscles: "Anterior Deltoids", equipment: "Cable Machine", difficulty: "Beginner", instructions: "1. Stand between pulleys, grab handles.\n2. Step forward slightly.\n3. Bring hands together in a hugging motion.\n4. Squeeze chest, then slowly release.", commonMistakes: "Using too much momentum\nBending elbows excessively, turning it into a press" },
  { name: "Lat Pulldown", category: "Back", primaryMuscle: "Latissimus Dorsi", secondaryMuscles: "Biceps, Rear Deltoids", equipment: "Cable Machine", difficulty: "Beginner", instructions: "1. Sit at machine, adjust knee pads.\n2. Grip bar wide.\n3. Pull bar down to upper chest.\n4. Return with control, getting a full stretch.", commonMistakes: "Leaning back too far (turning it into a row)\nPulling behind the neck" },
  { name: "Seated Cable Row", category: "Back", primaryMuscle: "Latissimus Dorsi", secondaryMuscles: "Biceps, Rhomboids", equipment: "Cable Machine", difficulty: "Beginner", instructions: "1. Sit on machine, feet on pads.\n2. Keep back straight, pull handle to stomach.\n3. Squeeze shoulder blades together.\n4. Release with control.", commonMistakes: "Rounding the lower back\nUsing momentum to swing the weight" },
  { name: "Barbell Squat", category: "Legs", primaryMuscle: "Quadriceps", secondaryMuscles: "Glutes, Hamstrings, Core", equipment: "Barbell, Squat Rack", difficulty: "Advanced", instructions: "1. Unrack bar across upper back/traps.\n2. Break at hips and knees simultaneously.\n3. Squat below parallel (hip crease below top of knee).\n4. Drive up powerfully.", commonMistakes: "Knees caving inward (valgus)\nHeels lifting off the ground\nNot squatting deep enough" },
  { name: "Leg Press", category: "Legs", primaryMuscle: "Quadriceps", secondaryMuscles: "Glutes, Hamstrings", equipment: "Leg Press Machine", difficulty: "Beginner", instructions: "1. Sit in machine, place feet shoulder-width on sled.\n2. Unlatch safety.\n3. Lower weight with control until knees are at 90 degrees.\n4. Press back up.", commonMistakes: "Locking knees out aggressively at the top\nLetting lower back round off the pad at the bottom" },
  { name: "Leg Extension", category: "Legs", primaryMuscle: "Quadriceps", secondaryMuscles: "", equipment: "Leg Extension Machine", difficulty: "Beginner", instructions: "1. Sit on machine, adjust pad to rest on lower shins.\n2. Extend legs fully.\n3. Squeeze quads at the top.\n4. Lower slowly to starting position.", commonMistakes: "Swinging the weight up with momentum\nNot using full range of motion" },
  { name: "Dumbbell Shoulder Press", category: "Shoulders", primaryMuscle: "Anterior Deltoids", secondaryMuscles: "Lateral Deltoids, Triceps", equipment: "Dumbbells, Bench", difficulty: "Intermediate", instructions: "1. Sit on bench with back support.\n2. Press dumbbells overhead until arms are extended.\n3. Lower with control until dumbbells are near ears.\n4. Repeat.", commonMistakes: "Arching back excessively\nDoing half reps (not lowering enough)" },
  { name: "Dumbbell Curl", category: "Biceps", primaryMuscle: "Biceps Brachii", secondaryMuscles: "Brachialis", equipment: "Dumbbells", difficulty: "Beginner", instructions: "1. Stand holding dumbbells at sides, palms facing forward.\n2. Keep elbows pinned to sides, curl weights up.\n3. Squeeze biceps at the top.\n4. Lower with control.", commonMistakes: "Swinging the body to lift the weight\nDropping the weight quickly on the negative" }
];

async function seedExercises() {
  console.log("Seeding 10 exercises...");
  
  // Clear existing
  await db.execute("DELETE FROM exercises");

  for (const ex of exercises) {
    await db.execute({
      sql: `INSERT INTO exercises (
        id, name, category, primary_muscle, secondary_muscles, equipment, 
        difficulty, instructions, common_mistakes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        ex.name,
        ex.category,
        ex.primaryMuscle,
        ex.secondaryMuscles,
        ex.equipment,
        ex.difficulty,
        ex.instructions,
        ex.commonMistakes
      ]
    });
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

seedExercises().catch(console.error);
