import { Row, Col } from 'react-bootstrap';
import './social-media.scss';

export default function SocialMediaComponent() {
  return (
    <div className='social-media'>
      <p className='mt-1'><strong>Follow Alu</strong></p>
      <Row className='mx-2'>
        <Col>
          <a href='https://twitter.com/' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-instagram fa-2x' />
          </a>
        </Col>
        <Col>
          <a href='https://twitter.com/' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-twitter fa-2x' />
          </a>
        </Col>
        <Col>
          <a href='https://tiktok.com' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-tiktok fa-2x' />
          </a>
        </Col>
        <Col>
          <a href='https://facebook.com' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-facebook fa-2x' />
          </a>
        </Col>
      </Row>
    </div>
  );
}