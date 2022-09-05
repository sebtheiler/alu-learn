import Navbar from "@/components/Navbar";
import MeQuery from "@/graphql/MeQuery";
import type { Query, Streak } from "@/types";
import { useQuery } from "@apollo/client";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";

interface LayoutProps {
  session: Session;
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const { data: meData } = useQuery<{ me: Query["me"] }>(MeQuery);
  const { isPro, currentStreak, doneReviewsToday } = meData?.me ?? {};

  return (
    <>
      <NextNProgress color="#8166ee" options={{ showSpinner: false }} />
      <Navbar
        session={session}
        status={status}
        streak={
          meData ? ({ currentStreak, doneReviewsToday } as Streak) : undefined
        }
        isPro={isPro ?? false}
      />
      {children}
    </>
  );
}
