import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Mini CRM prototype"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body>
        {isLoginPage ? children : <AppShell>{children}</AppShell>}
      </body>
    </html>
  );
}
