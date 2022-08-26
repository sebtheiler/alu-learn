import ProFeaturesCard from "./ProFeaturesCard";
import LinkButton from "@/atoms/LinkButton";

/**
 * Displays if a user has pro mode due to an organization partnership
 */
export default function ProFromOrganization() {
  return (
    <>
      <div className="prose mx-auto mt-20 text-center">
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
      <div className="mx-auto mt-10 max-w-lg text-left">
        <ProFeaturesCard />
      </div>
    </>
  );
}
