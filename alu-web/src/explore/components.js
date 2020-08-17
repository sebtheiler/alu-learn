import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './explore.css';
import Slider from 'react-slick';

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
            <a href={`/${deck.id}/`} key={`${index}-editorpicks`}>
              <div style={{color: 'black'}}>
                <h4 style={{textDecoration: 'underline'}}>
                  {deck.title}
                </h4>
                <p style={{textDecoration: 'none'}}>
                  {deck.description.substring(0, 128) + (deck.description.length > 128 ? '...' : '')}
                </p>
              </div>
            </a>
          );
        })}
      </Slider>
    </div>
  );
};