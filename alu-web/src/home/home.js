import React, {useState, useEffect} from 'react';
import {Card, CardDeck} from 'react-bootstrap';
import {apiProfileDetail} from '../lookup';
import {errorHandler} from '../utils';
import './home.css';

export function HomeComponent(props) {
  const {username} = props;
  
  const [profile, setProfile] = useState({});
  const [profileDidSet, setProfileDidSet] = useState(false);

  useEffect(() => {
    if (profileDidSet === false) {
      setProfileDidSet(true);
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile detail for home page
          errorHandler(response, status, 3010);
        };
      });
    };
  }, [username, setProfile, profileDidSet, setProfileDidSet]);

  console.log(profile);

  return (
    <div className='text-center'>
      <h1>Home</h1>
      <CardDeck className='w-75 mx-auto'>
        <a href='/home/decks/' className='card'>
          <i className='fas fa-window-restore fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Your Decks
          </Card.Title>
        </a>
        <a href='/home/notes' className='card'>
          <i className='fas fa-edit fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Your Notes
          </Card.Title>
        </a>
      </CardDeck>
    </div>
  );
}