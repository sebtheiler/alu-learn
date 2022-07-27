import LinkButton from "atoms/LinkButton";
import Link from "next/link";

export default function ProUpgradeCancelledPage() {
  return (
    <div className="prose mx-auto mt-28 text-center">
      <h1>You&apos;ve Cancelled Your Purchase</h1>
      <p>Sorry to see you go!</p>
      <p>
        If you ever change your mind, you can upgrade to Pro{" "}
        <Link href="/pro" className="text-blue-500 no-underline">
          <a>here</a>
        </Link>
      </p>
      <LinkButton href="/home">Return Home</LinkButton>
    </div>
  );
}
