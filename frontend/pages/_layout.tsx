import Navbar from "components/Navbar";
import type { Session } from "next-auth";
import NextNProgress from "nextjs-progressbar";
import type { Streak } from "types";

interface LayoutProps {
  session: Session;
  streak: Streak;
  children: React.ReactNode;
}

export default function Layout({ session, streak, children }: LayoutProps) {
  return (
    <>
      <NextNProgress color="#8166ee" options={{ showSpinner: false }} />
      <Navbar session={session} streak={streak} />
      {children}
    </>
  );
}
