import React from 'react';
import {Navbar, NavDropdown, Nav, Button, Form} from 'react-bootstrap';
import {apiProfileLogout} from '../lookup';
import './navbar.css';
import {errorHandler} from '../utils';
import {NotificationComponent} from '../profiles/notifications'

export function NavbarComponent(props) {
  const username = props.username ? props.username : '';

  const logoutHandler = (event) => {
    event.preventDefault();
    apiProfileLogout((response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error logging-out user
        errorHandler(response, status, 3012);
      };
    });
  };

  return (
    <Navbar bg='primary' variant='dark'>
      <Navbar.Brand href='/home/'>Alu Flashcards</Navbar.Brand>
      <Nav className='mr-auto'>
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
        <div class='mr-2'>
          <NotificationComponent username={username} isPopup={true} />
        </div>
        {username ?
          <>
            <NavDropdown
              title={
                <i className='fas fa-user-circle text-light fa-2x'></i>
              }
              id='profile-dropdown'
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

              <NavDropdown.Divider />
              <NavDropdown.Item href='/settings/'>
                <i className='fas fa-cog'></i>{' '}
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item onClick={logoutHandler}>
                <i className='fas fa-sign-out-alt'></i>{' '}
                Log-out
              </NavDropdown.Item>
            </NavDropdown>
          </>
          :
          <>
            <Form>
              <Button
                variant='light'
                className='text-primary mr-1'
              >
                Sign-up
              </Button>
              {/* TODO: fix colors */}
              <Button
                variant='outline-light'
                className='text-white'
              >
                Log-in
              </Button>
            </Form>
          </>
        }
      </Nav>
    </Navbar>
  );
};