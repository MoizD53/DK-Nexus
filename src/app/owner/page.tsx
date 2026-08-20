import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ListItem } from "@/components/ui/ListItem";

const stats = [
  { label: "Total Members", value: 47, sublabel: "Enrolled at your gym" },
  { label: "Active Members", value: 31, sublabel: "Last 7 days" },
  { label: "Workouts Today", value: 18, sublabel: "In progress or done" },
  { label: "Completed", value: 12, sublabel: "Finished today" },
];

const recentMembers = [
  { name: "Arjun Sharma", joined: "Joined 2 days ago", goal: "Build Muscle" },
  { name: "Priya Mehta", joined: "Joined 5 days ago", goal: "Weight Loss" },
  { name: "Rohan Das", joined: "Joined 1 week ago", goal: "Endurance" },
  { name: "Sneha Iyer", joined: "Joined 2 weeks ago", goal: "Build Muscle" },
  { name: "Kabir Singh", joined: "Joined 3 weeks ago", goal: "General Fitness" },
];

const todayActivity = [
  { member: "Arjun Sharma", detail: "5 exercises", status: "In Progress" },
  { member: "Rohan Das", detail: "6 exercises", status: "Completed" },
  { member: "Priya Mehta", detail: "4 exercises", status: "Completed" },
  { member: "Manav Gupta", detail: "7 exercises", status: "In Progress" },
  { member: "Sneha Iyer", detail: "5 exercises", status: "Completed" },
];

export default function OwnerDashboard() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Good morning</h1>
        <p className="text-sm text-stone-400 mt-1">Development Gym · Today at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sublabel={s.sublabel} />
        ))}
      </div>

      {/* Recent Members */}
      <div className="mb-8">
        <SectionHeader title="Recent Members" subtitle="Newest enrollments" />
        <Card padding={false}>
          <div className="px-5">
            {recentMembers.map((m) => (
              <ListItem
                key={m.name}
                title={m.name}
                subtitle={m.joined}
                badge={m.goal}
                badgeVariant="amber"
                showAvatar={true}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Today's Activity */}
      <div>
        <SectionHeader title="Today's Activity" subtitle="Workout sessions" />
        <Card padding={false}>
          <div className="px-5">
            {todayActivity.map((a) => (
              <ListItem
                key={a.member + a.detail}
                title={a.member}
                subtitle={a.detail}
                badge={a.status}
                badgeVariant={a.status === "Completed" ? "green" : "amber"}
                showAvatar={true}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
