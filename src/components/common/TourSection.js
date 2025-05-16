
import React, { useState } from "react";
import TourList from "./TourList";

const TourSection = ({ title, tours, isDiscount = false }) => {
    const [visibleTours, setVisibleTours] = useState(4);

    return (
        <div className="mt-10">
            <h2 className="h-20 flex items-center text-5xl font-bold text-left text-red-500 border-l-4 border-red-500 pl-4">
                {title}
            </h2>
            <TourList tours={tours.slice(0, visibleTours)} issDiscount={isDiscount} />
            {visibleTours < tours.length && (
                <div className="text-center mt-6">
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        onClick={() => setVisibleTours(visibleTours + 4)}
                    >
                        Xem Thêm Tour
                    </button>
                </div>
            )}
        </div>
    );
};

export default TourSection;
