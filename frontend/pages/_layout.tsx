import Navbar from "components/Navbar";
import type { Session } from "next-auth";
import NextNProgress from "nextjs-progressbar";

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
      <NextNProgress color="#8166ee" options={{ showSpinner: false }} />
      <Navbar session={session} streak={streak} />
      {children}
    </>
  );
}
