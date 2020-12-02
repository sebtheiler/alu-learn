import React from 'react';
import {Navbar, NavDropdown, Nav, Button} from 'react-bootstrap';
import {apiProfileLogout} from '../lookup';
import './navbar.css';
import {errorHandler} from '../utils';
import {NotificationComponent} from '../profiles/notifications'

export function NavbarComponent(props) {
  const firstName = props.firstName ? props.firstName : '';
  const username = props.username ? props.username : '';
  const currentStreak = parseInt(props.currentStreak);
  const doneReviewsToday = props.doneReviewsToday === 'True';

  const logoutHandler = (event) => {
    event.preventDefault();
    apiProfileLogout((response, status) => {
      if (status === 200) {
        window.location.href = '/login/';
      } else {
        // Error logging-out user
        errorHandler(response, status, 3012);
      };
    });
  };

  return (
    <Navbar bg='primary' variant='dark' expand='md' collapseOnSelect>
      <Navbar.Brand href='/home/'>
        <img src='/static/logo.svg' alt="Alu's Logo" width='30' height='auto' style={{transform: 'translateY(-3px)'}} />{' '}
        Alu Flashcards
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
          <Nav.Link href='/explore/decks/search/'>
            <i className='fa fa-search'></i>{' '}
            Search
          </Nav.Link>
        </Nav>
        <Nav className='ml-auto'>
          <Nav.Link className='mr-2' style={{width: '57px', height: '57px', cursor: 'default'}}>
            <NotificationComponent username={username} isPopup={true} />
          </Nav.Link>
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
                <NavDropdown.Item href='/profile/'>
                  <i className='fas fa-user-circle'></i>{' '}
                  Your Profile
                </NavDropdown.Item>
                <NavDropdown.Item href='/home/decks/'>
                  <i className='fas fa-window-restore'></i>{' '}
                  Decks
                </NavDropdown.Item>
                <NavDropdown.Item href='/home/notes/'>
                  <i className='fas fa-edit'></i>{' '}
                  Notes
                </NavDropdown.Item>
                <NavDropdown.Item href='/home/manual-sr/'>
                  <i className='fas fa-clock'></i>{' '}
                  Tasks
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item href='/settings/'>
                  <i className='fas fa-cog'></i>{' '}
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Item href='/help/'>
                  <i className='fas fa-info-circle'></i>{' '}
                  Help and Tutorials
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logoutHandler}>
                  <i className='fas fa-sign-out-alt'></i>{' '}
                  Log-out
                </NavDropdown.Item>
                <NavDropdown.Item href='/contactus/'>
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
};