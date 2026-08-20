import { MemberShell } from "@/components/member/MemberShell";
import { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <MemberShell>{children}</MemberShell>;
}
