import { OwnerShell } from "@/components/owner/OwnerShell";
import { ReactNode } from "react";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}
