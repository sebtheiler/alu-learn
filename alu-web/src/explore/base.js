import React, {useState, useEffect} from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import {Deck} from '../decks';
import {apiDeckSharedList} from '../lookup';


export function ExploreComponent(props) {
  const [decks, setDecks] = useState([]);
  const [decksDidSet, setDecksDidSet] = useState(false);

  useEffect(() => {
    if (decksDidSet === false) {
      apiDeckSharedList('evolvedsquid', (response, status) => {
        if (status === 200) {
          setDecks(response);
          setDecksDidSet(true);
        } else {
          console.log(response, status);
          alert('Error');
        };
      });
    };
  }, [setDecks, decksDidSet, setDecksDidSet]);

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

  return (
    <div className='text-center'>
      <Slider {...settings}>
        {decks.map((deck, index) => {
          console.log(deck, index)
          return (
            <div key={`${index}-editorpicks`}>
              <h4>{deck.title}</h4>
              <p>{deck.description.substring(0, 128) + (deck.description.length > 128 ? '...' : '')}</p>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};