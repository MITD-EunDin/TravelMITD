import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Contexts/AuthContext";
import { FaStar } from "react-icons/fa";

export function ReviewsPage() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra vai trò admin
    useEffect(() => {
        if (!user || user.scope !== "ADMIN") {
            setError("Bạn cần quyền admin để xem trang này.");
            setTimeout(() => navigate("/"), 2000); // Chuyển hướng về trang chủ
            return;
        }

        const fetchReviews = async () => {
            try {
                const response = await axios.get("https://be-travel-mitd.onrender.com/reviews/all?page=0&limit=10", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReviews(response.data.result);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi lấy đánh giá:", err);
                setError(err.response?.data?.message || "Không thể tải danh sách đánh giá.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [user, token, navigate]);

    const handleReply = (reviewId) => {
        // Logic trả lời (có thể mở modal hoặc chuyển hướng)
        alert(`Mở form trả lời cho đánh giá ${reviewId}`);
        // Ví dụ: navigate(`/admin/reviews/${reviewId}/reply`);
    };

    if (loading) {
        return <div className="p-6 text-center">Đang tải...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500 font-medium text-center">{error}</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-lg overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá & Phản hồi</h2>
                {reviews.length === 0 ? (
                    <p className="text-gray-500">Chưa có đánh giá nào.</p>
                ) : (
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="p-4 font-semibold border-b">Mã Đánh Giá</th>
                                <th className="p-4 font-semibold border-b">Mã Tour</th>
                                <th className="p-4 font-semibold border-b">Khách Hàng</th>
                                <th className="p-4 font-semibold border-b">Đánh Giá</th>
                                <th className="p-4 font-semibold border-b">Nội Dung</th>
                                <th className="p-4 font-semibold border-b">Ngày Đánh Giá</th>
                                <th className="p-4 font-semibold border-b text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-800">RV{review.id.toString().padStart(3, "0")}</td>
                                    <td className="p-4 text-gray-800">{review.tourId}</td>
                                    <td className="p-4 text-gray-800">{review.name}</td>
                                    <td className="p-4">
                                        <div className="flex text-yellow-400">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <FaStar key={i} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700 max-w-xs truncate">{review.comment}</td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                        >
                                            Trả lời
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}