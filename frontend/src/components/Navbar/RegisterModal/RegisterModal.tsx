import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import { getElementsVals } from "@/helpers/getElementsVals";
import useGlobalModalStore from "@/stores/globalModalStore";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const { email } = getElementsVals(e.target as HTMLFormElement, ["email"]);

  await signIn("email", { email });
};

/**
 * Renders the global sign-up modal. Only instantiate in `Navbar`!
 */
export default function RegisterModal() {
  const { registerModalOpen, setRegisterModalOpen } = useGlobalModalStore();
  const [continueWithEmail, setContinueWithEmail] = useState(false);

  return (
    <Modal
      open={registerModalOpen}
      close={() => setRegisterModalOpen(false)}
      title="Register"
    >
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
        Continue with Google
      </Button>
      <Button
        onClick={() => setContinueWithEmail(!continueWithEmail)}
        variant="primary-outline"
        className="mt-1"
        block
      >
        Continue with Email
      </Button>
      {continueWithEmail && (
        <AsyncForm
          onSubmit={onRegister}
          buttonProps={{
            children: "Create Account",
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
          <Checkbox
            label={
              <>
                I accept the{" "}
                <a href="/legal/tos" target="_blank" className="text-blue-500">
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
        </AsyncForm>
      )}
    </Modal>
  );
}
