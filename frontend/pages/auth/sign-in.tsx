import type { NextPage } from "../../lib/types";
import SignInPage from "pages/SignInPage";

export { getServerSideProps } from "../../lib/getSessionSSR";

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;
