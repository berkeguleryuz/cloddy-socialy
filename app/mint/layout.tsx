import type { ReactNode } from "react";

export default function MintLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto w-full py-12 px-4">{children}</div>
  );
}
