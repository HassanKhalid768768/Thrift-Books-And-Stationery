import React from "react";
import { MainCarouselData } from "./MainCarouselData";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import "./MainCarousel.css";

const MainCarousel = () => {
  const items = MainCarouselData.map((item, index) => (
    <img
      key={index}
      className="carousel-image cursor-pointer"
      role="presentation"
      src={item.image}
      alt=""
    />
  ));

  return (
    <div className="main-carousel-container">
      <AliceCarousel
        items={items}
        autoPlay
        autoPlayInterval={1000}
        infinite={true}
        disableButtonsControls
        responsive={{
          0: { items: 1 },
          1024: { items: 1 },
        }}
        animationDuration={800}
        disableDotsControls
      />
    </div>
  );
};

export default MainCarousel;
