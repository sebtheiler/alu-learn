import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import LoadingButton from '../../decks/buttons/LoadingButton';
import Row from 'react-bootstrap/Row';
import { ProPurchaseSuccess } from '.';
import { backendFetch, useAsyncState } from '../../lookup/lookup';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useState } from 'react';

type StrBool = 'True' | 'False';
export default function ProUpgrade(props: { isPro: StrBool, isAnonymous: StrBool }) {
  const isPro = props.isPro === 'True';
  const isAnonymous = props.isAnonymous === 'True';

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
          {isAnonymous
            ? <Button href='/?showLoginRequired=true'>Upgrade</Button>
            : <LoadingButton clickFunc={purchase('monthly')}>Upgrade</LoadingButton>
          }
        </Col>
        <Col>
          <h1>$30/yr</h1>
          <p>Save over 15%</p>
          <ul>
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
          {isAnonymous
            ? <Button href='/?showLoginRequired=true'>Upgrade</Button>
            : <LoadingButton clickFunc={purchase('yearly')}>Upgrade</LoadingButton>
          }
        </Col>
      </Row>
    </Container>
  );
}
