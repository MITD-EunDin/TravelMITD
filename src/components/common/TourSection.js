
import React, { useState } from "react";
import TourList from "./TourList";
import { Link } from "react-router-dom";

const TourSection = ({ title, tours, isDiscount = false }) => {
    const [visibleTours, setVisibleTours] = useState(4);

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mt-10">
                <h2 className="text-3xl md:text-5xl font-bold text-red-500 border-l-4 border-red-500 pl-4">
                    {title}
                </h2>
                <Link to="/tours?filter=discount">
                    <button className="whitespace-nowrap bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Xem thêm
                    </button>
                </Link>
            </div>

            <TourList tours={tours.slice(0, visibleTours)} issDiscount={isDiscount} />

        </div>
    );
};

export default TourSection;
