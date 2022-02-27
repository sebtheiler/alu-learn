import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export default function ProPurchaseSuccess() {
  return (
    <Container className='text-center mt-5'>
      <h1>Thank You!</h1>
      <h3>For Upgrading to Alu Pro!</h3>
      <br />
      <p>You've just improved your Alu experience while supporting free education!</p>
      <p>Your payment is being processed and might take a couple of minutes to complete</p>
      <p>If you ever have any questions, you can contact support at <a href='mailto:support@alulearn.com'>support@alulearn.com</a></p>
      <Button href='/home/'>Return Home</Button>
      {/* TODO: link to cancel subscription */}
    </Container>
  );
}
