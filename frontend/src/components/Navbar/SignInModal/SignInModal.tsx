import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import { getElementsVals } from "helpers/getElementsVals";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import useGlobalModalStore from "stores/globalModalStore";

const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  console.log(
    getElementsVals(e.target as HTMLFormElement, [
      "emailOrUsername",
      "password",
    ])
  );
};

/**
 * Renders the global log-in modal. Only instantiate in `Navbar`!
 */
export default function SignInModal() {
  const { logInModalOpen, setSignInModalOpen } = useGlobalModalStore();
  const [loginWithEmail, setLoginWithEmail] = useState(false);

  return (
    <Modal
      open={logInModalOpen}
      close={() => setSignInModalOpen(false)}
      title="Sign-in"
    >
      <Button
        onClick={() => signIn("google")}
        variant="white"
        className="flex items-center justify-center"
        block
      >
        <Image
          src="/assets/logos/google.svg"
          alt="Google Logo"
          width={25}
          height={25}
          className="absolute left-5 top-2 inline"
        />
        Sign-in with Google
      </Button>
      <Button
        onClick={() => setLoginWithEmail(!loginWithEmail)}
        variant="primary-outline"
        className="mt-1"
        block
      >
        Sign-in with Email
      </Button>
      {loginWithEmail && (
        <AsyncForm
          onSubmit={onSignIn}
          buttonProps={{
            children: "Sign-in",
            block: true,
          }}
        >
          <hr className="my-3" />
          <TextInput
            label="Email or Username"
            name="emailOrUsername"
            autoComplete="email"
            className="mb-2"
            required
          />
          <TextInput
            label="Password"
            name="password"
            autoComplete="current-password"
            type="password"
            className="mb-2"
            required
          />
        </AsyncForm>
      )}
    </Modal>
  );
}
