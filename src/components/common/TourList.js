import React from "react";
import { FaClock, FaMapMarkedAlt, FaBus, FaHotel } from "react-icons/fa";
import { Link } from "react-router-dom";

const TourList = ({ tours }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2d mt-6">
            {tours.map((tour) => (
                <div key={tour.tourId} className="border rounded-lg m-1 p-4 shadow-md bg-white group">
                    <img src={tour.images[0]} alt={tour.tourName} className="w-full h-40 object-cover rounded-md" />

                    <h2 className="text-xl font-semibold mt-2 group-hover:text-blue-500 group-hover:-translate-y-2 line-clamp-2">{tour.tourName}</h2>
                    <p className="text-gray-600 group-hover:-translate-y-2">
                        {tour.tourType === "DOMESTIC" ? "Trong nước" : "Quốc tế"}
                    </p>
                    <div className="rounded-lg w-full max-w-md flex flex-col group-hover:-translate-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col text-sm text-gray-700 gap-2">
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-blue-500" /> <span>4 ngày 3 đêm</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkedAlt className="text-green-500" /> <span>Lịch trình: {tour.tourSchedule?.departureDate || 'Chưa có lịch'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaBus className="text-red-500" /> <span>Phương tiện: Máy bay</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaHotel className="text-yellow-500" /> <span>Chỗ ở: Khách sạn</span>
                                </div>
                            </div>

                            {/* Kiểm tra xem có giá gốc không */}
                            <div className="text-md font-bold text-red-500 text-right">
                                {tour.newPrice ? (
                                    <>
                                        <p className="text-red-500 ">{tour.newPrice.toLocaleString()} VNĐ</p>
                                        <p className="text-gray-500 line-through text-sm">{tour.price.toLocaleString()} VNĐ</p>
                                    </>
                                ) : (
                                    <p>{tour.price.toLocaleString()} VNĐ</p>
                                )}
                                <Link to={`/tours/${tour.tourId}`} state={{ tour }}>
                                    <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                                        Chi Tiết
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TourList;
