import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import TextInput from "atoms/TextInput";
import Modal from "components/Modal";
import { getElementsVals } from "helpers/getElementsVals";
import Image from "next/image";
import { useState } from "react";
import useGlobalModalStore from "stores/globalModalStore";

const onLogIn = async (e: React.FormEvent<HTMLFormElement>) => {
  console.log(
    getElementsVals((e.target as HTMLFormElement).elements, [
      "emailOrUsername",
      "password",
    ])
  );
};

/**
 * Renders the global log-in modal. Only instantiate in `Navbar`!
 */
export default function LogInModal() {
  const { logInModalOpen, setLogInModalOpen } = useGlobalModalStore();
  // const login = useGoogleLogin({
  //   onSuccess: (tokenResponse) => console.log(tokenResponse),
  // });
  const [loginWithEmail, setLoginWithEmail] = useState(false);

  return (
    <Modal
      open={logInModalOpen}
      close={() => setLogInModalOpen(false)}
      title="Log-in"
    >
      <Button
        // onClick={() => login()}
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
        Log-in with Google
      </Button>
      <Button
        onClick={() => setLoginWithEmail(!loginWithEmail)}
        variant="primary-outline"
        className="mt-1"
        block
      >
        Log-in with Email
      </Button>
      {loginWithEmail && (
        <AsyncForm
          onSubmit={onLogIn}
          buttonProps={{
            children: "Log-in",
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
