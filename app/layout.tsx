import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Cloddy | Gamified Social Network",
  description: "A premium social network template with gamification features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased scroll-smooth">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
