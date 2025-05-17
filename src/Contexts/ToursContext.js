import { createContext, useState, useEffect } from "react";
import { getAllTours } from "../api/TourApi";
import axios from "axios";

export const ToursContext = createContext();

export const ToursProvider = ({ children }) => {
    const [tours, setTours] = useState([]);

    // Fetch tours và đánh giá khi khởi tạo
    useEffect(() => {
        const fetchToursAndReviews = async () => {
            try {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");

                // Fetch tour cố định từ API
                const tourData = await getAllTours();
                console.log("Raw API data in ToursContext:", tourData);

                if (!Array.isArray(tourData)) {
                    console.error("Dữ liệu tour không hợp lệ");
                    return;
                }

                // Khởi tạo tours với averageRating mặc định là 5.0
                const toursWithRating = tourData.map((tour) => ({
                    ...tour,
                    averageRating: 5.0,
                }));

                // Fetch đánh giá từ API cho tất cả tour
                const updatedTours = await Promise.all(
                    toursWithRating.map(async (tour) => {
                        try {
                            const response = await axios.get(
                                `http://localhost:8080/reviews/${tour.tourId}`,
                                {
                                    params: { limit: 10 },
                                    headers: {
                                        Authorization: token ? `Bearer ${token}` : undefined,
                                    },
                                }
                            );
                            const reviewData = response.data.result || [];
                            console.log(`Reviews fetched for tour ${tour.tourId}:`, reviewData);

                            // Tính averageRating
                            const averageRating = reviewData.length
                                ? (
                                    reviewData.reduce((sum, r) => sum + r.rating, 0) /
                                    reviewData.length
                                ).toFixed(1)
                                : "5.0"; // 5 sao nếu không có đánh giá
                            return {
                                ...tour,
                                averageRating: parseFloat(averageRating),
                            };
                        } catch (error) {
                            console.error(`Lỗi khi lấy đánh giá cho tour ${tour.tourId}:`, error);
                            return tour; // Giữ averageRating 5.0 nếu lỗi
                        }
                    })
                );

                setTours(updatedTours);
                console.log("Tours with ratings in ToursContext:", updatedTours);
            } catch (err) {
                console.error("Lỗi load tour:", err);
                if (err.response?.status === 401) {
                    alert("Vui lòng đăng nhập để xem danh sách tour!");
                    window.location.href = "/login";
                }
            }
        };

        fetchToursAndReviews();
    }, []); // Chỉ chạy một lần khi mount

    // Hàm cập nhật averageRating cho một tour
    const updateTourRating = (tourId, averageRating) => {
        if (!tourId) return;
        setTours((prevTours) => {
            const tour = prevTours.find((t) => t.tourId === tourId);
            if (tour && tour.averageRating === averageRating) {
                console.log("No change in averageRating for tour:", tourId, averageRating);
                return prevTours;
            }
            const newTours = prevTours.map((tour) =>
                tour.tourId === tourId ? { ...tour, averageRating } : tour
            );
            console.log("Updated averageRating for tour:", tourId, averageRating);
            console.log("Updated tours in ToursContext:", newTours);
            return newTours;
        });
    };

    // Hàm thêm đánh giá mới
    const addReview = async (tourId, reviewData) => {
        try {
            const token = localStorage.getItem("token");
            // Gửi đánh giá mới
            const response = await axios.post(`http://localhost:8080/reviews/${tourId}`, reviewData, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            console.log("Review created:", response.data.result);

            // Lấy lại danh sách đánh giá để tính averageRating mới
            const reviewsResponse = await axios.get(`http://localhost:8080/reviews/${tourId}`, {
                params: { limit: 10 },
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            const reviewList = reviewsResponse.data.result || [];
            const averageRating = reviewList.length
                ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
                : "5.0"; // 5 sao nếu không có đánh giá

            // Cập nhật averageRating
            updateTourRating(tourId, parseFloat(averageRating));
        } catch (error) {
            console.error("Lỗi khi thêm đánh giá:", error);
            throw error;
        }
    };

    return (
        <ToursContext.Provider value={{ tours, updateTourRating, addReview }}>
            {children}
        </ToursContext.Provider>
    );
};  