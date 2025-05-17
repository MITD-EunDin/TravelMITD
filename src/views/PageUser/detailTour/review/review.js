import { memo, useState, useEffect, useContext, useRef } from "react";
import { FaStar, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { ToursContext } from "../../../../Contexts/ToursContext";
import { useAuth } from "../../../../Contexts/AuthContext";

const ReviewTour = ({ tour }) => {
    const { updateTourRating } = useContext(ToursContext);
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState("description");
    const [newRating, setNewRating] = useState(0); // Bắt đầu với 0 sao
    const [newComment, setNewComment] = useState("");
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const prevAverageRatingRef = useRef(null);

    // Đánh giá mặc định
    const defaultReview = {
        id: 0,
        name: "Hệ thống",
        rating: 5,
        comment: "Tour tuyệt vời, rất đáng trải nghiệm!",
        createdAt: new Date().toISOString(),
    };

    // Lấy danh sách đánh giá từ API (công khai)
    useEffect(() => {
        console.log("Tour object:", tour);
        console.log("Tour ID:", tour?.tourId);
        const fetchReviews = async () => {
            try {
                if (!tour?.tourId) {
                    throw new Error("Tour ID không hợp lệ");
                }
                const response = await axios.get(`https://be-travel-mitd.onrender.com/reviews/${tour.tourId}?limit=10`);
                const reviewData = response.data.result;
                console.log("Reviews fetched in ReviewTour:", reviewData);
                setReviews(reviewData);
                setError(null);
            } catch (error) {
                console.error("Lỗi khi lấy đánh giá:", error);
                setError(error.response?.data?.message || error.message);
            }
        };
        if (tour?.tourId) {
            fetchReviews();
        } else {
            setReviews([]);
            setError("Không có Tour ID hợp lệ để lấy đánh giá.");
        }
    }, [tour?.tourId]);

    // Tính số sao trung bình
    const displayReviews = reviews.length > 0 ? reviews : [defaultReview];
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "5.0";
    console.log("Calculated averageRating in ReviewTour:", averageRating);

    // Cập nhật averageRating chỉ khi cần thiết
    useEffect(() => {
        if (tour?.tourId && averageRating !== prevAverageRatingRef.current && averageRating !== "0.0") {
            console.log("Calling updateTourRating in ReviewTour:", tour.tourId, parseFloat(averageRating));
            updateTourRating(tour.tourId, parseFloat(averageRating));
            prevAverageRatingRef.current = averageRating;
        }
    }, [averageRating, tour?.tourId, updateTourRating]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleStarClick = (rating) => {
        setNewRating(rating);
    };

    const handleSubmitReview = async () => {
        if (!tour?.tourId) {
            alert("Không thể gửi đánh giá: Tour không hợp lệ!");
            return;
        }
        if (!user) {
            alert("Vui lòng đăng nhập để gửi đánh giá!");
            return;
        }
        if (!user.username) {
            alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!");
            return;
        }
        if (!newComment.trim()) {
            alert("Vui lòng nhập bình luận!");
            return;
        }
        if (newRating === 0) {
            alert("Vui lòng chọn số sao!");
            return;
        }
        const newReview = {
            rating: newRating,
            comment: newComment.trim(),
            name: user.username,
        };
        try {
            console.log("Submitting new review:", newReview);
            const response = await axios.post(
                `https://be-travel-mitd.onrender.com/reviews/${tour.tourId}`,
                newReview,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const savedReview = response.data.result;
            setReviews([savedReview, ...reviews]);
            setNewComment("");
            setNewRating(0);
            alert("Đánh giá đã được gửi!");
            setError(null);
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            alert("Không thể gửi đánh giá: " + (error.response?.data?.message || error.message));
            setError(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="description-tip ">
            <div className="button-describe ">
                <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "description"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    onClick={() => handleTabClick("description")}
                >
                    Mô Tả
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "itinerary"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    onClick={() => handleTabClick("itinerary")}
                >
                    Lịch Trình
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "reviews"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    onClick={() => handleTabClick("reviews")}
                >
                    Đánh Giá
                </button>
            </div>

            <div className="space-content">
                {activeTab === "description" && (
                    <div className="content-tab active p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Mô Tả Tour</h3>
                        <p className="text-gray-700">{tour?.description || "Chưa có mô tả"}</p>
                    </div>
                )}

                {activeTab === "itinerary" && (
                    <div className="content-tab active p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Lịch Trình Chi Tiết</h3>
                        <p className="text-gray-700">{tour?.itinerary || "Chưa có lịch trình"}</p>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="content-tab active p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">Đánh Giá Từ Khách Hàng</h3>
                        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}
                        <p className="text-yellow-500 font-semibold mb-4">
                            ⭐ Trung bình: {averageRating} / 5
                        </p>

                        <div className="review-list mb-6 space-y-4">
                            {displayReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="review-item flex items-start gap-4 p-4 bg-gray-50 rounded-lg shadow-sm"
                                >
                                    <FaUserCircle className="text-3xl text-gray-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{review.name}</p>
                                        <div className="flex text-yellow-400 mb-1">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <FaStar key={i} />
                                            ))}
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="review-form border-t pt-4">
                            <h4 className="text-lg font-bold mb-4">Gửi đánh giá của bạn</h4>
                            {!user && (
                                <p className="text-red-500 font-medium mb-4">
                                    Vui lòng đăng nhập để gửi đánh giá.
                                </p>
                            )}
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">
                                    Chọn số sao:
                                </label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`cursor-pointer text-2xl ${star <= newRating ? "text-yellow-400" : "text-gray-300"
                                                } ${!user ? "cursor-not-allowed" : ""}`}
                                            onClick={() => user && handleStarClick(star)}
                                        />
                                    ))}
                                    <span className="text-gray-600">
                                        {newRating > 0 ? `${newRating} sao` : "Chưa chọn"}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">
                                    Bình luận:
                                </label>
                                <textarea
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${error ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                                        } ${!user ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                    rows="4"
                                    placeholder="Nhập bình luận của bạn..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user}
                                />
                            </div>
                            <button
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${user && tour?.tourId && newRating > 0 && newComment.trim()
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={handleSubmitReview}
                                disabled={!user || !tour?.tourId || newRating === 0 || !newComment.trim()}
                            >
                                Gửi đánh giá
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ReviewTour);