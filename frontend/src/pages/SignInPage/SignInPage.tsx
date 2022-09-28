import LogInForm from "@/components/LogInForm";
import SEO from "@/helpers/SEO";

export default function SignInPage() {
  return (
    <>
      <SEO
        title="Sign-in"
        path="/auth/sign-in"
        // description=""  TODO: (SEO) set description
      />
      <div className="mt-28 prose mx-auto text-center">
        <h1>Sign-in</h1>
        <LogInForm type="SIGNIN" />
      </div>
    </>
  );
}
