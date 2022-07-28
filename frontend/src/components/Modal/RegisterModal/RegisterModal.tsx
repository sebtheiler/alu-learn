import { getElementsVals } from "../../../helpers/getElementsVals";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import Checkbox from "atoms/Checkbox";
import TextInput from "atoms/TextInput";
import Modal from "components/Modal";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import useGlobalModalStore from "stores/globalModalStore";

const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log(
    getElementsVals((e.target as HTMLFormElement).elements, [
      "age",
      "firstName",
      "lastName",
      "username",
      "email",
      "password",
    ])
  );
};

/**
 * Renders the global sign-up modal. Only instantiate in `Navbar`!
 */
export default function RegisterModal() {
  const { registerModalOpen, setRegisterModalOpen } = useGlobalModalStore();
  // const login = useGoogleLogin({
  //   onSuccess: (tokenResponse) => console.log(tokenResponse),
  // });

  const [continueWithEmail, setContinueWithEmail] = useState(false);
  const [age, setAge] = useState<number>(111);

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
            label="Age"
            name="age"
            type="number"
            className="mb-2"
            required
            onBlur={(e) =>
              setAge(e.target.value.length > 0 ? parseInt(e.target.value) : 111)
            }
          />
          {age >= 13 && (
            <div className="mb-2 grid grid-cols-2 gap-3">
              <TextInput
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                className=""
                required
              />
              <TextInput
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                className=""
                required
              />
            </div>
          )}
          <TextInput
            label={
              age >= 13 ? "Username" : "Username (don't use your real name!)"
            }
            name="username"
            autoComplete="username"
            className="mb-2"
            required
          />
          <TextInput
            label={age >= 13 ? "Email" : "Parent's Email"}
            name="email"
            autoComplete="email"
            type="email"
            className="mb-2"
            required
          />
          <TextInput
            label="Password"
            name="password"
            autoComplete="new-password"
            type="password"
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
