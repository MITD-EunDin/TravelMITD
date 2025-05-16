// src/context/ToursContext.js
import { createContext, useState, useEffect } from "react";
import { getAllTours } from "../api/TourApi";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export const ToursContext = createContext();

export const ToursProvider = ({ children }) => {
    const [tours, setTours] = useState([]);

    // Fetch tours và đánh giá khi khởi tạo
    useEffect(() => {
        const fetchToursAndReviews = async () => {
            try {
                // Fetch tours từ API
                const tourData = await getAllTours();
                console.log("Raw API data in ToursContext:", tourData);

                if (!Array.isArray(tourData)) {
                    console.error("Dữ liệu tour không hợp lệ");
                    return;
                }

                // Khởi tạo tours với averageRating mặc định là 0
                const toursWithRating = tourData.map((tour) => ({
                    ...tour,
                    averageRating: 0,
                }));

                // Fetch đánh giá từ Firestore cho tất cả tour
                const updatedTours = await Promise.all(
                    toursWithRating.map(async (tour) => {
                        try {
                            const reviewsQuery = query(
                                collection(db, `tours/${tour.tourId}/reviews`),
                                orderBy("createdAt", "desc"),
                                limit(10)
                            );
                            const querySnapshot = await getDocs(reviewsQuery);
                            const reviewData = querySnapshot.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                            }));
                            console.log(`Reviews fetched for tour ${tour.tourId}:`, reviewData);

                            // Tính averageRating
                            const averageRating = reviewData.length
                                ? (reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length).toFixed(1)
                                : "0.0";
                            return {
                                ...tour,
                                averageRating: parseFloat(averageRating),
                            };
                        } catch (error) {
                            console.error(`Lỗi khi lấy đánh giá cho tour ${tour.tourId}:`, error);
                            return tour; // Giữ nguyên tour nếu lỗi
                        }
                    })
                );

                setTours(updatedTours);
                console.log("Tours with ratings in ToursContext:", updatedTours);
            } catch (err) {
                console.error("Lỗi load tour:", err);
            }
        };

        fetchToursAndReviews();
    }, []); // Chỉ chạy một lần khi mount

    // Hàm cập nhật averageRating cho một tour
    const updateTourRating = (tourId, averageRating) => {
        if (!tourId) return;
        setTours((prevTours) => {
            // Kiểm tra nếu averageRating không thay đổi
            const tour = prevTours.find((t) => t.tourId === tourId);
            if (tour && tour.averageRating === averageRating) {
                console.log("No change in averageRating for tour:", tourId, averageRating);
                return prevTours; // Không cập nhật state
            }
            const newTours = prevTours.map((tour) =>
                tour.tourId === tourId ? { ...tour, averageRating } : tour
            );
            console.log("Updated averageRating for tour:", tourId, averageRating);
            console.log("Updated tours in ToursContext:", newTours);
            return newTours;
        });
    };

    return (
        <ToursContext.Provider value={{ tours, updateTourRating }}>
            {children}
        </ToursContext.Provider>
    );
};