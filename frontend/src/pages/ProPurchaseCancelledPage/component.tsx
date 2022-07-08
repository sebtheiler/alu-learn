import LinkButton from '@components/LinkButton';
import { Link } from "react-router-dom";

/**
 * Displays the page for after a user has cancelled their pro subscription
 */
export default function ProPurchaseCancelledPage() {
  return (
    <div className='prose mx-auto text-center mt-20'>
      <h1>You've Cancelled Your Purchase</h1>
      <p>Sorry to see you go!</p>
      <p>If you ever change your mind, you can upgrade to Pro <Link to='/pro' className='text-blue-500 no-underline'>here</Link></p>
      <LinkButton href='/home'>Return Home</LinkButton>
    </div>
  );
}