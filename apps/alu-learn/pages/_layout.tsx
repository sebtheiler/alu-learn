"use client";
import Navbar from "@/components/Navbar";
import MeQuery from "graphql-operations/operations/MeQuery";
import useMeStore from "@/stores/meStore";
import useProStore from "@/stores/proStore";
import type { Query, Streak } from "@/types";
import { useQuery } from "@apollo/client";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import { useEffect } from "react";
import { useRouter } from "next/router";

const navbarDisabledOn = ["/alu-read/create-flashcards"];

interface LayoutProps {
  session: Session;
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const { data: meData, loading: meDataLoading } = useQuery<{
    me: Query["me"];
  }>(MeQuery);
  const { isPro, currentStreak, doneReviewsToday } = meData?.me ?? {};
  const { isPro: globalIsPro, setIsPro } = useProStore();
  const { setMe } = useMeStore();
  const router = useRouter();

  useEffect(() => {
    if (
      !meDataLoading &&
      globalIsPro === null &&
      (isPro === false || isPro === true)
    ) {
      setIsPro(isPro);
      setMe(meData?.me);
    }
  }, [meDataLoading, globalIsPro, isPro, setIsPro, setMe, meData?.me]);

  return (
    <>
      <NextNProgress color="#8166ee" options={{ showSpinner: false }} />
      {!navbarDisabledOn.includes(router.pathname) && (
        <Navbar
          session={session}
          status={status}
          streak={
            meData ? ({ currentStreak, doneReviewsToday } as Streak) : undefined
          }
          isPro={isPro ?? false}
        />
      )}
      {children}
    </>
  );
}
