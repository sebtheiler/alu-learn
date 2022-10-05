import LinkButton from "@/atoms/LinkButton";
import useProStore from "@/stores/proStore";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

interface AuthProps {
  children: React.ReactElement;
  proRequired?: boolean;
}

export default function Auth({
  children,
  proRequired = false,
}: AuthProps): React.ReactElement | null {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;
  const isPro = useProStore((state) => state.isPro);

  useEffect(() => {
    if (status === "loading") return;
    if (!isUser) signIn();
  }, [isUser, status]);

  if (isUser) {
    if (proRequired && isPro === false) {
      return (
        <div className="mt-28 text-center">
          <h1 className="font-bold text-4xl mb-3">
            Only Alu Pro Users Can Access This Page
          </h1>
          <LinkButton href="/pro">Upgrade to Pro</LinkButton>
        </div>
      );
    }
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}
