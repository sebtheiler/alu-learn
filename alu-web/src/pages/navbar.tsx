import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import { NavbarPopup } from './navbar-popup';
import { NotificationComponent } from '../profiles/notifications';
import { apiProfileLogout } from '../lookup';
import { errorHandler } from '../utils';
import './navbar.scss';

export default function NavbarComponent(props) {
  const firstName = props.firstName ? props.firstName : '';
  const username = props.username ? props.username : '';
  const currentStreak = parseInt(props.currentStreak);
  const doneReviewsToday = props.doneReviewsToday === 'True';
  const showUpdateModal = props.showUpdateModal === 'True';

  const logoutHandler = event => {
    event.preventDefault();
    apiProfileLogout((response, status) => {
      if (status === 200) {
        window.location.href = '/login/';
      } else {
        // Error logging-out user
        errorHandler(response, status, 3012);
      }
    });
  }

  const congratulationsMessage = (() => {
    if (doneReviewsToday) return null;

    let text: string;
    switch (currentStreak) {
      case 10:
        text = 'Congratulations on a 10 day streak!';
        break;
      case 30:
        text = 'Congratulations on a month-long streak!';
        break;
      case 42:
        text = 'The answer to life, the universe, and everything';
        break;
      case 50:
        text = 'Half-way to 100 days!  Congratulations!';
        break;
      case 80:
        text = 'Around the world in 80 decks (of flashcards)';
        break;
      case 100:
        text = 'CONGRATULATIONS ON 100 DAYS OF ALU!!!';
        break;
      case 111:
        text = 'You are eleventy-one today! (or at least your streak is)';
        break;
      case 128:
        text = '2^7';
        break;
      case 200:
        text = '20 0(00) days under the flashcards';
        break;
      case 250:
        text = '250 DAYS! YOU\'RE AMAZING!';
        break;
      case 365:
        text = 'A WHOLE YEAR OF ALU!  AMAZING!'
        break;
      case 500:
        text = '500 DAYS!  HALF-WAY TO FOUR DIGITS!  YOU\'RE AMAZING!';
        break;
      case 666:
        text = 'I\'d be careful about this streak number...';
        return <span className='navbar-text'>
          <i className='fas fa-skull' />{' '}
          {text}
        </span>
      case 1000:
        text = '1000 DAYS!  4 DIGITS!  THANK YOU FOR BEING A PART OF ALU!';
        break;
      default:
        text = '';
        break;
    }
    return text && <span className='navbar-text'>
      <i className='fas fa-crown' />{' '}
      {text}
    </span>
  })();

  return (
    <Navbar bg='dark' variant='dark' expand='md' collapseOnSelect>
      <NavbarPopup showUpdateModal={showUpdateModal} firstName={firstName} />
      <Navbar.Brand href='/home/'>
        <img src='/static/logo.svg' alt="Alu's Logo" width='30' height='auto' style={{transform: 'translateY(-3px)'}} />{' '}
        Alu Learn
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='responsive-navbar-nav' />
      <Navbar.Collapse id='responsive-navbar-nav'>
        <Nav className='mr-auto'>
          <Navbar.Text className='mr-3'>
            Good {(new Date()).getHours() < 12 ? 'morning' : 'evening'}{firstName ? ` ${firstName}` : ''}!
          </Navbar.Text>
          <Nav.Link href='/explore/'>
            <i className='fa fa-compass'></i>{' '}
            Explore
          </Nav.Link>
          <Nav.Link href='/changelog/'>
            <i className='fa fa-book'></i>{' '}
            Changelog
          </Nav.Link>
          {congratulationsMessage}
        </Nav>
        <Nav className='ml-auto'>
          {username && <Nav.Link className='mr-2' style={{ width: '57px', height: '57px', cursor: 'default' }}>
            <NotificationComponent username={username} isPopup />
          </Nav.Link>}
          {username ?
            <>
              <Nav.Link
                className='mr-2'
                style={{
                  width: '57px',
                  height: '57px',
                  cursor: 'default',
                  color: doneReviewsToday ? '#fd9626' : '#e5e5e5',
                }}
              >
                <i className='fas fa-fire-alt fa-2x' />
                <span
                  className='streak-number'
                  style={{
                    background: doneReviewsToday ? '#fd9626' : '#e5e5e5',
                    color: doneReviewsToday ? 'white' : '#36474f',
                    fontSize: currentStreak < 100 ? '15px' : '12px',
                  }}
                >
                  {currentStreak}
                </span>
              </Nav.Link>
              <NavDropdown
                title={
                  <i className='fas fa-user-circle text-light fa-2x'></i>
                }
                id='profile-dropdown'
                style={{width: '57px', height: '57px'}}
                alignRight
              >
                <NavDropdown.Item href='/profile/' id='profile-option'>
                  <i className='fas fa-user-circle'></i>{' '}
                  Your Profile
                </NavDropdown.Item>
                <NavDropdown.Item href='/settings/' id='settings-option'>
                  <i className='fas fa-cogs'></i>{' '}
                  Settings
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item href='/help/' id='help-option'>
                  <i className='fas fa-info-circle'></i>{' '}
                  Help and Tutorials
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logoutHandler} id='logout-option'>
                  <i className='fas fa-sign-out-alt'></i>{' '}
                  Log-out
                </NavDropdown.Item>
                <NavDropdown.Item href='/contactus/' id='contact-option'>
                  <i className='far fa-envelope'></i>{' '}
                  Contact us
                </NavDropdown.Item>
              </NavDropdown>
            </>
            :
            <>
              <Nav.Link href={window.location.pathname.length > 1
                ? `/?showLoginRequired=true&returnUrl=${window.location.href}` // anywhere but homepage
                : (window.location.href.includes('showLoginRequired')
                  ? window.location.href
                  : '/?showLoginRequired=true'
                )
              }>
                <Button
                  variant='light'
                  className='text-primary mr-1'
                >
                  Sign-up
                </Button>
              </Nav.Link>
              <Nav.Link href={`/login/`}>
                <Button
                  variant='outline-light'
                  className='text-white'
                  id='login-navbar-btn'
                >
                  Log-in
                </Button>
              </Nav.Link>
            </>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
