import LogInForm from "../LogInForm";
import Modal from "alu-ui/src/Modal";
import useGlobalModalStore from "@/stores/globalModalStore";

/**
 * Renders the global register or sign-in modal
 */
export default function LogInModal({ type }: { type: "REGISTER" | "SIGNIN" }) {
  const {
    registerModalOpen,
    signInModalOpen,
    setRegisterModalOpen,
    setSignInModalOpen,
  } = useGlobalModalStore();

  return (
    <Modal
      open={type === "REGISTER" ? registerModalOpen : signInModalOpen}
      close={() =>
        type === "REGISTER"
          ? setRegisterModalOpen(false)
          : setSignInModalOpen(false)
      }
      title={type === "REGISTER" ? "Register" : "Sign-in"}
    >
      <LogInForm type={type} />
    </Modal>
  );
}
