import Navbar from '@components/Navbar';

/**
 * Storybook decorator that adds the Navbar to the top of the page.
 * Must come before `withFullContext`.
 */
export default function withNavbar(Story) {
  return (<>
    <Navbar isLoggedIn={false} />
    <Story />
  </>);
}
