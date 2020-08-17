import React, {useState} from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';


export function ExploreComponent(props) {

  var settings = {
    arrows: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
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
      <Slider {...settings}
      >
        <div>
          <p>Item 1</p>
        </div>
        <div>
          <p>Item 2</p>
        </div>
        <div>
          <p>Item 3</p>
        </div>
        <div>
          <p>Item 4</p>
        </div>
        <div>
          <p>Item 5</p>
        </div>
        <div>
          <p>Item 6</p>
        </div>
      </Slider>
    </div>
  );
};