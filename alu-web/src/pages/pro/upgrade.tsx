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
interface ProUpgradeProps {
  isPro: StrBool;
  isProFromOrg: StrBool;
  proTrialExpires: string;
  isAnonymous: StrBool;
}
export default function ProUpgrade(props: ProUpgradeProps) {
  const isPro = props.isPro === 'True';
  const isProFromOrg = props.isProFromOrg === 'True';
  const { proTrialExpires } = props;
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

  if (isProFromOrg) return <ProFromOrganization />
  if (isPro && proTrialExpires.length <= 4) return <ProPurchaseSuccess />
  return (
    <Container className='mt-5'>
      <Row className='text-center'>
        <Col>
          <h1>Upgrade to Alu Pro</h1>
          {proTrialExpires.length > 4 && <h4>
            Your free-trial of Alu Pro ends {proTrialExpires.split(',').slice(0, 2).join(',')}.{' '}
            Upgrade now to make it permanent.
          </h4>}
          {isAnonymous && <h4>
            Get a free week of Alu Pro when you <a href='/?showLoginRequired=true'>Sign Up</a>.{' '}
            No credit card required.
          </h4>}
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

function ProFromOrganization() {
  return (
    <Container className='text-center mt-5'>
      <h1>Your Organization Has Free Access to Alu Pro!</h1>
      <br />
      <p>Because of your organization, you have free and unlimited access to Alu Pro.</p>
      <p>If you ever have any questions, you can contact support at <a href='mailto:support@alulearn.com'>support@alulearn.com</a></p>
      <Button href='/home/'>Return Home</Button>
    </Container>
  );
}
