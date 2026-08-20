import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminSettings() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-stone-400 mt-1">Platform configuration</p>
      </div>
      <Card padding={false}>
        <EmptyState
          title="Settings coming soon"
          description="Platform-level configuration options will be available in a future release."
        />
      </Card>
    </div>
  );
}
