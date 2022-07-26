import LinkButton from "components/LinkButton";

/**
 * Renders a 404 page
 */
export default function NotFoundPage() {
  return (
    <div className="mt-28 prose mx-auto text-center">
      <h1>404</h1>
      <h3>Page not found</h3>
      <p>The page you are looking for does not exist.</p>
      <LinkButton href="/">Return Home</LinkButton>
    </div>
  );
}
