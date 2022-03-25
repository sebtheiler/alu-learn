import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import LoadingButton from '../../decks/buttons/LoadingButton';
import Row from 'react-bootstrap/Row';
import { ProPurchaseSuccess } from '.';
import { backendFetch, useAsyncState } from '../../lookup/lookup';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useState } from 'react';
import './upgrade.scss';

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
          <h1>Take Studying to the Next Level</h1>
          {proTrialExpires.length > 4 && <p>
            Your free-trial of Alu Pro ends {proTrialExpires.split(',').slice(0, 2).join(',')}.{' '}
            Upgrade now to make it permanent.
          </p>}
          {isAnonymous && <p>
            Get a free week of Alu Pro when you <a href='/?showLoginRequired=true'>Sign Up</a>.{' '}
            No credit card required.
          </p>}
        </Col>
      </Row>
      <div className='pro-mode-container mt-5'>
        <Row>
          <Col className='pro-mode-basic'>
            <div className='pro-card-head'>
              <h3>Basic</h3>
              <p>Free</p>
            </div>
            <div className='pro-mode-body'>
              <ul className="fa-ul">
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Personalized spaced repetition flashcards</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Rich text formatting</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Upload custom images</li>
                <li className='xmark'><span className='fa-li'><i className='fa-solid fa-xmark'></i></span>No ads</li>
                <li className='xmark'><span className='fa-li'><i className='fa-solid fa-xmark'></i></span>Study with games</li>
                <li className='xmark'><span className='fa-li'><i className='fa-solid fa-xmark'></i></span>Identify difficult flashcards and topics</li>
                <li className='xmark'><span className='fa-li'><i className='fa-solid fa-xmark'></i></span>Unlimited flashcards</li>
              </ul>
            </div>
          </Col>
          <Col className='pro-mode-pro'>
            <div className='pro-card-head'>
              <h3>Pro</h3>
              <p>$3/mo or $30/yr</p>
            </div>
            <div className='pro-mode-body'>
              <ul className="fa-ul">
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Personalized spaced repetition flashcards</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Rich text formatting</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Upload custom images</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>No ads</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Study with games</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Identify difficult flashcards and topics</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Unlimited flashcards</li>
                <li className='check'><span className='fa-li'><i className='fa-solid fa-check'></i></span>Support Alu and free education</li>
              </ul>
            </div>
          </Col>
        </Row>
        <Row className='mt-3 text-center'>
          <div className='text-center w-100'>
            {isAnonymous ? <>
              <Button href='/?showLoginRequired=true' block>Start My Free Trial</Button>
              <p className='mt-1'>No Credit Card Required</p>
            </> : <>
              <LoadingButton clickFunc={purchase('monthly')} block>Upgrade to Pro ($3/mo)</LoadingButton>
              <LoadingButton clickFunc={purchase('yearly')} block>Upgrade to Pro ($30/yr)</LoadingButton>
            </>}
          </div>
        </Row>
      </div>
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
