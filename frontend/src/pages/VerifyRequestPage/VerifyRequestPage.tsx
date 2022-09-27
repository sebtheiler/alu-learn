import SEO from "@/helpers/SEO";

/**
 * A page that displays while the user is clicking the "magic link"
 * in their inbox
 */
export default function VerifyRequestPage() {
  return (
    <>
      <SEO title="Verify Request" path="verify-request" description="" />
      <div className="mt-48 text-center">
        <h1 className="text-4xl font-bold">Check your email</h1>
        <p>A sign in link has been sent to your email address</p>
      </div>
    </>
  );
}
