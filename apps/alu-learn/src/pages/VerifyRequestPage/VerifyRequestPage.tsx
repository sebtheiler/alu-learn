import SEO from "@/helpers/SEO";

/**
 * A page that displays while the user is clicking the "magic link"
 * in their inbox
 */
export default function VerifyRequestPage() {
  return (
    <>
      <SEO
        title="Verify Request"
        path="verify-request"
        description="Verify your email at Alu Learn"
      />
      <div className="mt-48 text-center">
        <h1 className="text-4xl font-bold mb-2">Check your email</h1>
        <p>A sign in link has been sent to your email address</p>
        <p className="mt-3 text-gray-500 text-sm italic">
          Try checking your spam folder if you didn&apos;t receive it
        </p>
      </div>
    </>
  );
}
