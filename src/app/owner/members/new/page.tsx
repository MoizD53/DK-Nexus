import { NewMemberForm } from "./NewMemberForm";
import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getOwnerGymId } from "@/lib/db/queries/owner";

export default async function NewMemberPage() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");
  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) redirect("/login");

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-2xl">
      <div className="mb-7 flex items-center gap-3">
        <Link
          href="/owner/members"
          className="text-stone-500 hover:text-stone-300 transition-colors"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">Add Member</h1>
          <p className="text-sm text-stone-400 mt-0.5">Create a new member account</p>
        </div>
      </div>
      <NewMemberForm />
    </div>
  );
}
