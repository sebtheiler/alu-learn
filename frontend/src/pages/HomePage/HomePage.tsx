import SEO from "helpers/SEO";

export default function HomePage() {
  return (
    <>
      <SEO
        title="Home"
        path="/home"
        // description=""  TODO: (SEO) set description
      />
      <div className="mt-28">
        <h1>home</h1>
      </div>
    </>
  );
}
