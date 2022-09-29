import LogInForm from "@/components/LogInForm";
import SEO from "@/helpers/SEO";

export default function SignInPage() {
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
