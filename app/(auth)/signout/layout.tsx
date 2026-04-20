import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignOut | Create Your StartUP",
};

export default function SignOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
