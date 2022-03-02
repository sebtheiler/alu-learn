import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export default function ProPurchaseCancelled() {
  return (
    <Container className='text-center mt-5'>
      <h1>You've Cancelled Your Purchase</h1>
      <br />
      <p>Sorry to see you go!</p>
      <p>If you ever change your mind, you can upgrade to Pro <a href='/pro/'>here</a></p>
      <Button href='/home/'>Return Home</Button>
    </Container>
  );
}
