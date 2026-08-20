import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getTodayWorkout } from "@/lib/db/queries/workout";
import { getMemberProfile } from "@/lib/db/queries/member";
import { WorkoutPlayerClient } from "./WorkoutPlayerClient";

export default async function MemberWorkoutPage() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const [workout, profile] = await Promise.all([
    getTodayWorkout(session.userId),
    getMemberProfile(session.userId)
  ]);

  const profileComplete = !!(profile?.goal && profile?.experience && profile?.trainingFrequency);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <WorkoutPlayerClient workout={workout} profileComplete={profileComplete} />
    </div>
  );
}
