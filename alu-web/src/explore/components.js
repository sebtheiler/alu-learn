import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './explore.css';
import Slider from 'react-slick';
import {UserLink} from '../profiles';

export function DeckSlider(props) {
  const {decks, loading} = props;

  var settings = {
    arrows: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className={props.className}>
        <p>
          Loading...
        </p>
      </div>
    );
  };

  return (
    <div className={props.className}>
      <Slider {...settings}>
        {decks.map((deck, index) => {
          return (
            <div style={{outline: 'none'}} key={`${index}-${deck.id}`}>
              <a href={`/decks/${deck.id}/`}>
                <h4 className='mb-0' style={{outline: 'none', color: 'black'}}>
                  {deck.title}
                </h4>
              </a>
              <UserLink user={deck.author} small />
              <a href={`/decks/${deck.id}/`}>
                <p className='deck-description mt-2 w-75' style={{outline: 'none', color: 'black'}}>
                  {deck.description.substring(0, 128) + (deck.description.length > 128 ? '...' : '')}
                </p>
              </a>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};