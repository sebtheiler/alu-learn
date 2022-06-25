import { Row, Col } from 'react-bootstrap';
import './social-media.scss';

export default function SocialMediaComponent() {
  return (
    <div className='social-media'>
      <p className='mt-1'><strong>Follow Alu</strong></p>
      <Row className='mx-2'>
        <Col xs={4}>
          <a href='https://www.instagram.com/alu_learn/' target='_blank' rel='noreferrer'>
            <img src='/static/images/instagram-logo.svg' alt='Instagram logo' style={{ width: '28px', height: '32px' }} />
          </a>
        </Col>
        <Col xs={4}>
          <a href='https://twitter.com/AluLearn' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-twitter fa-2x' />
          </a>
        </Col>
        <Col xs={4}>
          <a href='https://www.reddit.com/r/AluLearn' target='_blank' rel='noreferrer'>
            <i className='fa-brands fa-reddit fa-2x' />
          </a>
        </Col>
      </Row>
    </div>
  );
}