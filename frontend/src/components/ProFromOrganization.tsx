import LinkButton from "components/LinkButton";
import ProFeaturesCard from "./ProFeaturesCard";

/**
 * Displays if a user has pro mode due to an organization partnership
 */
export default function ProFromOrganization() {
  return (
    <>
      <div className="prose mx-auto text-center mt-20">
        <h1>Your Organization Has Free Access to Alu Pro!</h1>
        <p>
          Because of your organization, you have free and unlimited access to
          Alu Pro.
        </p>
        <p>
          If you ever have any questions, you can contact support at{" "}
          <a
            href="mailto:support@alulearn.com"
            className="text-blue-500 no-underline"
          >
            support@alulearn.com
          </a>
        </p>
        <LinkButton href="/home">Return Home</LinkButton>
      </div>
      <div className="max-w-lg mx-auto mt-10 text-left">
        <ProFeaturesCard />
      </div>
    </>
  );
}
