import SignInPage from "@/pages/SignInPage";
import type { NextPage } from "types";

export { getServerSideProps } from "helpers/getSessionSSR";

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;
