import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import LoadingButton from '../../decks/buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { ProPurchaseCancelled } from '.';
import { backendFetch, useAsyncState } from '../../lookup/lookup';
import { useState } from 'react';

export default function ProPurchaseSuccess() {
  const [subscriptionProduct] = useAsyncState<{ subscription: any, product: any }>(
    () => backendFetch('GET', 'accounts/stripe-get-subscription/'),
  );
  console.log(subscriptionProduct)

  return (
    <Container className='text-center mt-5'>
      <h1>Thank You!</h1>
      <h3>For Upgrading to Alu Pro!</h3>
      <br />
      <p>You've just improved your Alu experience while supporting free education!</p>
      <p>Your payment is being processed and might take a couple of minutes to complete</p>
      <p>If you ever have any questions, you can contact support at <a href='mailto:support@alulearn.com'>support@alulearn.com</a></p>
      <Button href='/home/'>Return Home</Button>
      {subscriptionProduct && subscriptionProduct.subscription.status === 'active' && <SubscriptionProduct
        subscription={subscriptionProduct.subscription}
        product={subscriptionProduct.product}
      />}
    </Container>
  );
}

function SubscriptionProduct({ subscription, product }) {
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [cancelledSubscription, setCancelledSubscription] = useState(false);

  const cancelSubscription = async () => {
    await backendFetch('POST', 'accounts/stripe-cancel-subscription/')
      .then(() => setCancelledSubscription(true))
      .then(() => setCancelModalIsOpen(false));
  }

  const reactivateSubscription = async () => {
    await backendFetch('POST', 'accounts/stripe-reactivate-subscription/')
      .then(() => window.location.reload());
  }

  if (cancelledSubscription) return <ProPurchaseCancelled />
  return (
    <div className='mt-5'>
      <hr />
      <h3>Your subscription: {product.description}</h3>
      <p>Amount: ${subscription.plan.amount/100} per {subscription.plan.interval}</p>
      <p>Billing period ends: {new Date(subscription.current_period_end * 1000).toDateString()}</p>
      {subscription.cancel_at_period_end
        ? <>
          <p><strong>
            Your subscription will be cancelled at the end of the billing period
          </strong></p>
          <LoadingButton clickFunc={reactivateSubscription} variant='success'>
            Re-activate Subscription
          </LoadingButton>
        </>
        : <Button onClick={() => setCancelModalIsOpen(true)} variant='danger'>
          Cancel Subscription
        </Button>
      }
      <Modal show={cancelModalIsOpen} onHide={() => setCancelModalIsOpen(false)}>
        <Modal.Header>
          <Modal.Title>
            Cancel Subscription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to cancel your subscription to Alu pro-mode.</p>
          <p>You will still have access to all pro features until the end of the billing period.</p>
          <p>Proceed?</p>
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton clickFunc={cancelSubscription} variant='danger'>
            Cancel Subscription
          </LoadingButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
