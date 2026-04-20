import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup | Create Your StartUP",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
