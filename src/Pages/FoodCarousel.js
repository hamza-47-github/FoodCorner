// src/FoodCarousel.js
import React from 'react';
import Slider from 'react-slick';
import { foodItems } from '../data'; // Adjust the import path as necessary
import '../FoodCarousel.css'; // Import the CSS file for styles

const FoodCarousel = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true, // Enable arrows for navigation
        autoplay: true, // Optional: enable autoplay
        autoplaySpeed: 3000, // Set the speed of autoplay
    };

    return (
        <div className="carousel-container">
            <Slider {...settings}>
                {foodItems.map((item) => (
                    <div key={item.id}>
                        <img
                            src={item.image}
                            alt={item.name}
                            className="carousel-image" // Add a class for styling
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default FoodCarousel;
