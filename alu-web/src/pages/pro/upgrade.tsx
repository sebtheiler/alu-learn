import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { backendFetch, useAsyncState } from '../../lookup/lookup';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useState } from 'react';

export default function ProUpgrade() {
  // const stripePromise = useMemo(async () => {
  //   return await backendFetch<any>('GET', 'accounts/stripe-config/')
  //     .then(result => result.json())
  //     .then(data => {
  //       const stripePromise = loadStripe(data.publishableKey);
  //       return stripePromise;
  //     });
  // }, []);
  // console.log(stripePromise)
  // const stripePromise = useApiFetch(async () => {})
  const [stripe, setStripe] = useState<Stripe | null>(null);
  useAsyncState<{ publishableKey: string }>(
    () => backendFetch('GET', 'accounts/stripe-config/'), [],
    publishableKey => {
      loadStripe(publishableKey.publishableKey).then(
        stripe => setStripe(stripe),
      );
    }
  );
  console.log(stripe);
  
  const purchase = (type: 'monthly' | 'yearly') => {
    return () => {
    }
  }

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
          <Button onClick={purchase('monthly')}>Upgrade</Button>
        </Col>
        <Col>
          <h1>$30/yr</h1>
          <p>Save over 15%</p>
          <ul>
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
          <Button onClick={purchase('yearly')}>Upgrade</Button>
        </Col>
      </Row>
    </Container>
  );
}
