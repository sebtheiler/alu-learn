import SignInPage from "@/pages/SignInPage";
import type { NextPage } from "lib/types";

export { getServerSideProps } from "lib/getSessionSSR";

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;
