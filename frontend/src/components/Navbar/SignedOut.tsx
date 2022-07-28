// import { CredentialResponse, useGoogleOneTapLogin } from "@react-oauth/google";
import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
import RegisterModal from "components/Modal/RegisterModal";
import SignInModal from "components/Modal/SignInModal";
import useGlobalModalStore from "stores/globalModalStore";

// const onGoogleLoginSuccess = (credResp: CredentialResponse) =>
//   console.log(credResp);

export default function SignedOut() {
  const { setSignInModalOpen, setRegisterModalOpen } = useGlobalModalStore();
  // useGoogleOneTapLogin({
  //   onSuccess: onGoogleLoginSuccess,
  //   onError: () => console.log("Error"),
  // });

  return (
    <div className="ml-auto mr-5">
      <ButtonGroup spaced>
        <Button onClick={() => setSignInModalOpen(true)} variant="white">
          Sign-in
        </Button>
        <Button onClick={() => setRegisterModalOpen(true)}>Register</Button>
      </ButtonGroup>
      <RegisterModal />
      <SignInModal />
    </div>
  );
}
