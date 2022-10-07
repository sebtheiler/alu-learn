import LogInForm from "@/components/LogInForm";
import SEO from "@/helpers/SEO";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignInPage() {
  const session = useSession();
  const router = useRouter();
  if (session.status === 'authenticated' && typeof window !== 'undefined') router.push('/home')

  return (
    <>
      <SEO
        title="Sign-in"
        path="/auth/sign-in"
        description="Sign in to Alu Learn to study thousands of free online spaced repetition flashcards for AP World, AP Psych, AP Gov, and more"
      />
      <div className="mt-28 prose mx-auto text-center">
        <h1>Sign-in</h1>
        <LogInForm type="SIGNIN" />
      </div>
    </>
  );
}
