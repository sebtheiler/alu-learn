import LoadingButton from '../../decks/buttons/LoadingButton';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { backendFetch, useAsyncState } from '../../lookup/lookup';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { ProPurchaseSuccess } from '.';

export default function ProUpgrade(props: { isPro: 'True' | 'False' }) {
  const isPro = props.isPro === 'True';
  const [stripe, setStripe] = useState<Stripe | null>(null);
  useAsyncState<{ publishableKey: string }>(
    () => backendFetch('GET', 'accounts/stripe-config/'), [],
    publishableKey => {
      loadStripe(publishableKey.publishableKey).then(
        stripe => setStripe(stripe),
      );
    }
  );
  
  const purchase = (purchaseType: 'monthly' | 'yearly') => {
    if (!stripe) return async () => {};
    return async () => {
      await backendFetch<{ sessionId: string }>(
        'POST', 'accounts/stripe-create-checkout-session/', { purchaseType },
      ).then(
        ({ sessionId }) => stripe.redirectToCheckout({ sessionId }),
      );
    }
  }

  if (isPro) return <ProPurchaseSuccess />
  return (
    <Container className='mt-5'>
      <Row className='text-center'>
        <Col>
          <h1>Upgrade to Alu Pro</h1>
          <p>flashy description</p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <h1>$3/mo</h1>
          <ul>
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
          <LoadingButton clickFunc={purchase('monthly')}>Upgrade</LoadingButton>
        </Col>
        <Col>
          <h1>$30/yr</h1>
          <p>Save over 15%</p>
          <ul>
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
          <LoadingButton clickFunc={purchase('yearly')}>Upgrade</LoadingButton>
        </Col>
      </Row>
    </Container>
  );
}
