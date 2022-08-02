import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
import RegisterModal from "components/Navbar/RegisterModal";
import SignInModal from "components/Navbar/SignInModal";
import useGlobalModalStore from "stores/globalModalStore";

export default function SignedOut() {
  const { setSignInModalOpen, setRegisterModalOpen } = useGlobalModalStore();

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
