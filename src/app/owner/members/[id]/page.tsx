import { getSession } from "@/lib/auth/getSession";
import { redirect, notFound } from "next/navigation";
import { getOwnerGymId, getGymMember } from "@/lib/db/queries/owner";
import { MemberDetailClient } from "./MemberDetailClient";
import Link from "next/link";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) redirect("/login");

  const { id } = await params;
  const member = await getGymMember(id, gymId);
  if (!member) notFound();

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
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white truncate">{member.name}</h1>
          <p className="text-sm text-stone-400 mt-0.5">{member.email}</p>
        </div>
      </div>
      <MemberDetailClient member={member} />
    </div>
  );
}
