import { CredentialResponse, useGoogleOneTapLogin } from "@react-oauth/google";
import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
// import LogInModal from "components/Modal/LogInModal";
// import SignUpModal from "components/Modal/SignUpModal";
import GlobalContext from "global";
import { useContext } from "react";

const onGoogleLoginSuccess = (credResp: CredentialResponse) =>
  console.log(credResp);

export default function LoggedOut() {
  const { setSignUpModalOpen, setLogInModalOpen } =
    useContext(GlobalContext) ?? {};
  console.log("??????????????????", setSignUpModalOpen);
  useGoogleOneTapLogin({
    onSuccess: onGoogleLoginSuccess,
    onError: () => console.log("Error"),
  });

  return (
    <div className="ml-auto mr-5">
      <ButtonGroup spaced>
        <Button onClick={() => setLogInModalOpen(true)} variant="white">
          Log-in
        </Button>
        <Button onClick={() => setSignUpModalOpen(true)}>Sign-up</Button>
      </ButtonGroup>
      {/* <SignUpModal />
      <LogInModal /> */}
    </div>
  );
}
