import Button from "atoms/Button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="mt-28 prose mx-auto text-center">
      <h1>Sign-in</h1>
      <Button
        variant="white"
        className="flex items-center justify-center"
        onClick={() =>
          signIn("google", {
            callbackUrl: router.query.callbackUrl as string | undefined,
          })
        }
        block
      >
        <Image
          src="/assets/logos/google.svg"
          alt="Google Logo"
          width={25}
          height={25}
        />
        Continue with Google
      </Button>
    </div>
  );
}
