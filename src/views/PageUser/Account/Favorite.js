// src/views/PageUser/Account/Favorites.jsx
import { useState, useEffect, useContext } from "react";
import { ToursContext } from "../../../Contexts/ToursContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
// import "../PageTour/style_detail.scss"; // Import CSS từ PageTour để tái sử dụng

const Favorites = () => {
    const { tours } = useContext(ToursContext);
    const [favorites, setFavorites] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const navigate = useNavigate();

    // Load danh sách yêu thích khi component mount
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token) {
                toast.error("Vui lòng đăng nhập để xem danh sách yêu thích!");
                navigate("/login");
                return;
            }
            try {
                const response = await axios.get("http://localhost:8080/api/favorites", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites(response.data || []);
                console.log("Favorites loaded from backend:", response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách yêu thích:", error);
                toast.error("Lỗi khi lấy danh sách yêu thích!");
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setToken(null);
                    navigate("/login");
                }
            }
        };
        fetchFavorites();
    }, [token, navigate]);

    // Xóa tour khỏi yêu thích
    const removeFavorite = async (tourId) => {
        try {
            await axios.delete(`http://localhost:8080/api/favorites/${tourId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites((prevFavorites) => prevFavorites.filter((id) => id !== tourId));
            toast.success("Đã xóa khỏi yêu thích!");
            console.log(`Removed favorite: ${tourId}`);
        } catch (error) {
            console.error("Lỗi khi xóa yêu thích:", error);
            toast.error("Lỗi khi xóa yêu thích!");
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                navigate("/login");
            }
        }
    };

    // Lọc danh sách tour yêu thích từ tours
    const favoriteTours = tours.filter((tour) => favorites.includes(tour.tourId));

    return (
        <div className="favorites-page">
            <h2 className="text-2xl font-bold mb-4">Danh Sách Yêu Thích</h2>
            {favoriteTours.length === 0 ? (
                <p className="text-gray-500">Bạn chưa có tour nào trong danh sách yêu thích.</p>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {favoriteTours.map((tour) => (
                        <div
                            key={tour.tourId}
                            className="p-4 rounded-lg border relative"
                        >
                            <img
                                src={tour.image}
                                alt={tour.tourName}
                                className="w-full h-40 object-cover mb-2 rounded-lg"
                            />
                            <h3 className="font-bold text-lg">{tour.tourName}</h3>
                            <p className="text-md font-bold text-red-500">
                                {tour.price.toLocaleString("vi-VN")} VNĐ
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <Link to={`/tours/${tour.tourId}`} state={{ tour }}>
                                    <button className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600">
                                        Chi Tiết
                                    </button>
                                </Link>
                                <button
                                    className="text-xl text-red-500 favorite-button"
                                    onClick={() => removeFavorite(tour.tourId)}
                                >
                                    <FaHeart />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;