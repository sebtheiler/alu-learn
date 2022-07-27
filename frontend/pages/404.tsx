import LinkButton from "atoms/LinkButton";
import type { NextPage } from "next";

const NotFound: NextPage = () => {
  return (
    <div className="prose mx-auto mt-28 text-center">
      <h1>404</h1>
      <h3>Page not found</h3>
      <p>The page you are looking for does not exist.</p>
      <LinkButton href="/">Return Home</LinkButton>
    </div>
  );
};

export default NotFound;
