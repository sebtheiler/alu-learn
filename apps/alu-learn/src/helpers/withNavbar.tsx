import Navbar from "@/components/Navbar";

/**
 * Storybook decorator that adds the Navbar to the top of the page.
 * Must come before `withFullContext`.
 */
export default function withNavbar(Story) {
  return (
    <>
      <Navbar session={null} status="unauthenticated" isPro={false} />
      <Story />
    </>
  );
}
