import Navbar from "components/Navbar";
import type { Session } from "next-auth";

interface LayoutProps {
  session: Session;
  children: React.ReactNode;
}

export default function Layout({ session, children }: LayoutProps) {
  const streak = {
    currentStreak: 10,
    doneReviewsToday: true,
  };

  return (
    <>
      <Navbar session={session} streak={streak} />
      {children}
    </>
  );
}
