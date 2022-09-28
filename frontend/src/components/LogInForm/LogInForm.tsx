import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import TextInput from "@/atoms/TextInput";
import { getElementsVals } from "@/helpers/getElementsVals";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const { email } = getElementsVals(e.target as HTMLFormElement, ["email"]);

  await signIn("email", { email });
};

/**
 * A form for the user to register or sign in
 */
export default function LogInForm({ type }: { type: "REGISTER" | "SIGNIN" }) {
  const [continueWithEmail, setContinueWithEmail] = useState(false);
  return (
    <>
      <Button
        variant="white"
        className="flex items-center justify-center"
        onClick={() => signIn("google")}
        block
      >
        <Image
          src="/assets/logos/google.svg"
          alt="Google Logo"
          width={25}
          height={25}
        />
        {type === "REGISTER" ? "Continue with Google" : "Sign-in with Google"}
      </Button>
      <Button
        onClick={() => setContinueWithEmail(!continueWithEmail)}
        variant="primary-outline"
        className="mt-1"
        block
      >
        {type === "REGISTER" ? "Continue with Email" : "Sign-in with Email"}
      </Button>
      {continueWithEmail && (
        <AsyncForm
          onSubmit={onRegister}
          buttonProps={{
            children: type === "REGISTER" ? "Create Account" : "Sign-in",
            block: true,
          }}
        >
          <hr className="my-3" />
          <TextInput
            label="Email"
            name="email"
            autoComplete="email"
            type="email"
            className="mb-2"
            required
          />
          {type === "REGISTER" && (
            <Checkbox
              label={
                <>
                  I accept the{" "}
                  <a
                    href="/legal/tos"
                    target="_blank"
                    className="text-blue-500"
                  >
                    terms of service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/legal/privacypolicy"
                    target="_blank"
                    className="text-blue-500"
                  >
                    privacy policy
                  </a>
                </>
              }
              id="terms-and-conditions"
              className="mb-4 ml-2"
              required
            />
          )}
        </AsyncForm>
      )}
    </>
  );
}
