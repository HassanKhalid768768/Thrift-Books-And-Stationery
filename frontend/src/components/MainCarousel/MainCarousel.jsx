import React from "react";
import banner1 from '../../assets/banner1.jpg';
import "./MainCarousel.css";

const MainCarousel = () => {
  return (
    <div className="main-carousel-container">
      <img
        className="carousel-image cursor-pointer"
        role="presentation"
        src={banner1}
        alt="Main Banner"
      />
    </div>
  );
};

export default MainCarousel;
