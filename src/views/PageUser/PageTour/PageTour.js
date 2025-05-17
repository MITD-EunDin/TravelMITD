import { useState, useEffect, useContext } from "react";
import { Grid, List, X } from "lucide-react";
import { FaClock, FaBus, FaHotel, FaStar, FaHeart, FaRegHeart, FaFilter } from "react-icons/fa";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { ToursContext } from "../../../Contexts/ToursContext";
import axios from "axios";
import { toast } from "react-toastify";
import './pagetour.scss';

export default function PageTour() {
    const { tours } = useContext(ToursContext);
    const [view, setView] = useState("grid");
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        region: [],
        country: [],
        price: [],
        duration: [],
        discount: false,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [toursPerPage] = useState(6);
    const [favorites, setFavorites] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token) {
                const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
                setFavorites(savedFavorites);
                console.log("Favorites loaded from localStorage:", savedFavorites);
                return;
            }
            try {
                const response = await axios.get("https://be-travel-mitd.onrender.com/api/favorites", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites(response.data || []);
                console.log("Favorites loaded from backend:", response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách yêu thích:", error);
                const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
                setFavorites(savedFavorites);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setToken(null);
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    navigate("/login");
                }
            }
        };
        fetchFavorites();
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            localStorage.setItem("favorites", JSON.stringify(favorites));
            console.log("Favorites saved to localStorage:", favorites);
        }
    }, [favorites, token]);

    const toggleFavorite = async (tourId) => {
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm tour vào yêu thích!");
            navigate("/login");
            return;
        }

        try {
            if (favorites.includes(tourId)) {
                await axios.delete(`https://be-travel-mitd.onrender.com/api/favorites/${tourId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites((prevFavorites) => prevFavorites.filter((id) => id !== tourId));
                toast.success("Đã xóa khỏi yêu thích!");
                console.log(`Removed favorite: ${tourId}`);
            } else {
                await axios.post("https://be-travel-mitd.onrender.com/api/favorites", { tourId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites((prevFavorites) => [...prevFavorites, tourId]);
                toast.success("Đã thêm vào yêu thích!");
                console.log(`Added favorite: ${tourId}`);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
            toast.error("Lỗi khi cập nhật yêu thích!");
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        const regions = searchParams.get("regions");
        const country = searchParams.get("country");
        const filter = searchParams.get("filter");

        if (regions) {
            const regionArray = regions
                .split(",")
                .filter((r) => ["north", "central", "south"].includes(r));
            if (regionArray.length > 0) {
                setFilters((prev) => ({
                    ...prev,
                    region: regionArray,
                    country: [],
                    price: [],
                    duration: [],
                    discount: false,
                }));
                setCurrentPage(1);
            }
        } else if (country && categoryFilter[country]) {
            setFilters((prev) => ({
                ...prev,
                country: [country],
                region: [],
                price: [],
                duration: [],
                discount: false,
            }));
            setCurrentPage(1);
        } else if (filter === "discount") {
            setFilters((prev) => ({
                ...prev,
                region: [],
                country: [],
                price: [],
                duration: [],
                discount: true,
            }));
            setCurrentPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        console.log("Tours in PageTour:", tours);
        console.log("Favorites in PageTour:", favorites);
        console.log("Token in PageTour:", token);
    }, [tours, favorites, token]);

    const categoryFilter = {
        north: (tour) => tour.region === "Miền Bắc",
        central: (tour) => tour.region === "Miền Trung",
        south: (tour) => tour.region === "Miền Nam",
        china: (tour) => tour.country === "Trung Quốc",
        korea: (tour) => tour.country === "Hàn Quốc",
        japan: (tour) => tour.country === "Nhật Bản",
        americas: (tour) => tour.country === "Mỹ",
        under2: (tour) => tour.price < 2000000,
        "2to5": (tour) => tour.price >= 2000000 && tour.price <= 5000000,
        above5: (tour) => tour.price > 5000000,
        "1day": (tour) => tour.duration === "1 ngày",
        "2days1night": (tour) => tour.duration === "2 ngày 1 đêm",
        "3days2nights": (tour) => tour.duration === "3 ngày 2 đêm",
        "4days3nights": (tour) => tour.duration === "4 ngày 3 đêm",
        over4days: (tour) => {
            const match = tour.duration.match(/^(\d+)/);
            return match && parseInt(match[1]) > 4;
        },
        discount: (tour) => tour.discount > 0,
    };

    const tourCounts = {
        domestic: tours.filter((tour) => ["Miền Bắc", "Miền Trung", "Miền Nam"].includes(tour.region)).length,
        north: tours.filter(categoryFilter.north).length,
        central: tours.filter(categoryFilter.central).length,
        south: tours.filter(categoryFilter.south).length,
        international: tours.filter((tour) => ["Trung Quốc", "Hàn Quốc", "Nhật Bản", "Mỹ"].includes(tour.country)).length,
        china: tours.filter(categoryFilter.china).length,
        korea: tours.filter(categoryFilter.korea).length,
        japan: tours.filter(categoryFilter.japan).length,
        americas: tours.filter(categoryFilter.americas).length,
        under2: tours.filter(categoryFilter.under2).length,
        "2to5": tours.filter(categoryFilter["2to5"]).length,
        above5: tours.filter(categoryFilter.above5).length,
        "1day": tours.filter(categoryFilter["1day"]).length,
        "2days1night": tours.filter(categoryFilter["2days1night"]).length,
        "3days2nights": tours.filter(categoryFilter["3days2nights"]).length,
        "4days3nights": tours.filter(categoryFilter["4days3nights"]).length,
        over4days: tours.filter(categoryFilter.over4days).length,
        discount: tours.filter(categoryFilter.discount).length,
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prevFilters) => {
            const isArray = Array.isArray(prevFilters[filterType]);
            if (isArray) {
                const newArray = prevFilters[filterType].includes(value)
                    ? prevFilters[filterType].filter((item) => item !== value)
                    : [...prevFilters[filterType], value];
                return { ...prevFilters, [filterType]: newArray };
            } else {
                return { ...prevFilters, [filterType]: !prevFilters[filterType] };
            }
        });
        setCurrentPage(1);
    };

    const filteredTours = tours
        .filter((tour) => {
            if (filters.region.length > 0) {
                return filters.region.some((region) => categoryFilter[region]?.(tour));
            }
            return true;
        })
        .filter((tour) => {
            if (filters.country.length > 0) {
                return filters.country.some((country) => categoryFilter[country]?.(tour));
            }
            return true;
        })
        .filter((tour) => {
            if (filters.price.length > 0) {
                return filters.price.some((price) => categoryFilter[price]?.(tour));
            }
            return true;
        })
        .filter((tour) => {
            if (filters.duration.length > 0) {
                return filters.duration.some((duration) => categoryFilter[duration]?.(tour));
            }
            return true;
        })
        .filter((tour) => {
            if (filters.discount) {
                return categoryFilter.discount(tour);
            }
            return true;
        })
        .filter((tour) =>
            tour.tourName?.toLowerCase().includes(search?.toLowerCase() ?? "")
        );

    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
    const totalPages = Math.ceil(filteredTours.length / toursPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    return (
        <div className="container">
            <aside className={`aside ${isFilterOpen ? 'aside-open' : ''}`}>
                <div className="aside-header">
                    <h2 className="aside-title">Danh Mục Tour</h2>
                    <button className="close-button" onClick={toggleFilter}>
                        <X size={24} />
                    </button>
                </div>
                <ul className="aside-list">
                    <li className="aside-item">Tour trong nước ({tourCounts.domestic})</li>
                    <ul className="aside-sub-list">
                        {["north", "central", "south"].map((region) => (
                            <li key={region}>
                                <label className="aside-filter">
                                    <input
                                        type="checkbox"
                                        checked={filters.region.includes(region)}
                                        onChange={() => handleFilterChange("region", region)}
                                    />
                                    {region === "north" ? "Miền Bắc" : region === "central" ? "Miền Trung" : "Miền Nam"} ({tourCounts[region]})
                                </label>
                            </li>
                        ))}
                    </ul>

                    <li className="aside-item">Tour nước ngoài ({tourCounts.international})</li>
                    <ul className="aside-sub-list">
                        {["china", "korea", "japan", "americas"].map((country) => (
                            <li key={country}>
                                <label className="aside-filter">
                                    <input
                                        type="checkbox"
                                        checked={filters.country.includes(country)}
                                        onChange={() => handleFilterChange("country", country)}
                                    />
                                    {country === "china" ? "Trung Quốc" : country === "korea" ? "Hàn Quốc" : country === "japan" ? "Nhật Bản" : "Mỹ"} ({tourCounts[country]})
                                </label>
                            </li>
                        ))}
                    </ul>

                    <li className="aside-item">Tour theo giá</li>
                    <ul className="aside-sub-list">
                        {["under2", "2to5", "above5"].map((price) => (
                            <li key={price}>
                                <label className="aside-filter">
                                    <input
                                        type="checkbox"
                                        checked={filters.price.includes(price)}
                                        onChange={() => handleFilterChange("price", price)}
                                    />
                                    {price === "under2" ? "Dưới 2 triệu" : price === "2to5" ? "2 - 5 triệu" : "Trên 5 triệu"} ({tourCounts[price]})
                                </label>
                            </li>
                        ))}
                    </ul>

                    <li className="aside-item">Tour theo số ngày</li>
                    <ul className="aside-sub-list">
                        {["1day", "2days1night", "3days2nights", "4days3nights", "over4days"].map((duration) => (
                            <li key={duration}>
                                <label className="aside-filter">
                                    <input
                                        type="checkbox"
                                        checked={filters.duration.includes(duration)}
                                        onChange={() => handleFilterChange("duration", duration)}
                                    />
                                    {duration === "1day" ? "1 ngày" : duration === "2days1night" ? "2 ngày 1 đêm" : duration === "3days2nights" ? "3 ngày 2 đêm" : duration === "4days3nights" ? "4 ngày 3 đêm" : "Trên 4 ngày"} ({tourCounts[duration]})
                                </label>
                            </li>
                        ))}
                    </ul>

                    <li>
                        <label className="aside-filter">
                            <input
                                type="checkbox"
                                checked={filters.discount}
                                onChange={() => handleFilterChange("discount", !filters.discount)}
                            />
                            Có khuyến mãi ({tourCounts.discount})
                        </label>
                    </li>
                </ul>
            </aside>

            <main className="main">
                <div className="header">
                    <button className="filter-button" onClick={toggleFilter}>
                        <FaFilter size={20} />
                        <span>Danh mục</span>
                    </button>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tour..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="view-toggle">
                        <button className="view-button" onClick={() => setView("list")}>
                            <List />
                        </button>
                        <button className="view-button" onClick={() => setView("grid")}>
                            <Grid />
                        </button>
                    </div>
                </div>

                <div className={view === "grid" ? "tours-grid" : "tours-list"}>
                    {currentTours.length === 0 ? (
                        <p className="no-tours">Không tìm thấy tour nào.</p>
                    ) : (
                        currentTours.map((tour) => (
                            <div
                                key={tour.tourId}
                                className={view === "grid" ? "tour-card" : "tour-card-list"}
                            >
                                <button
                                    className="favorite-button"
                                    onClick={() => toggleFavorite(tour.tourId)}
                                >
                                    {favorites.includes(tour.tourId) ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart className="text-gray-500" />
                                    )}
                                </button>

                                <img
                                    src={tour.images && tour.images.length > 0 ? tour.images[0] : tour.image || 'https://via.placeholder.com/150'}
                                    alt={tour.tourName}
                                    className={view === "grid" ? "tour-image" : "tour-image-list"}
                                />
                                <div className={view === "grid" ? "tour-info" : "tour-info-list"}>
                                    <h3 className="tour-title">{tour.tourName}</h3>
                                    <div className="tour-rating">
                                        {tour.averageRating > 0 ? (
                                            <>
                                                {[...Array(Math.floor(tour.averageRating))].map((_, i) => (
                                                    <FaStar key={i} />
                                                ))}
                                                {tour.averageRating % 1 >= 0.5 && (
                                                    <FaStar className="text-yellow-300" />
                                                )}
                                                <span className="text-gray-600">
                                                    ({tour.averageRating.toFixed(1)})
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-600">Chưa có đánh giá</span>
                                        )}
                                    </div>
                                    <div className="tour-details">
                                        <div className="tour-details-item">
                                            <FaClock className="text-blue-500" /> <span>{tour.duration}</span>
                                        </div>
                                        <div className="tour-details-item">
                                            <FaBus className="text-red-500" /> <span>Phương tiện: {tour.transportation}</span>
                                        </div>
                                        <div className="tour-details-item">
                                            <FaHotel className="text-yellow-500" /> <span>Chỗ ở: {tour.accommodation || "Khách sạn 3 sao"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={view === "grid" ? "tour-price" : "tour-price-list"}>
                                    {tour.price !== null && tour.price !== undefined ? (
                                        tour.discount ? (
                                            <div>
                                                <p className="line-through text-gray-400">
                                                    {(tour.price ?? 0).toLocaleString("vi-VN")} VNĐ
                                                </p>
                                                <p className="text-red-500 font-extrabold">
                                                    {(tour.newPrice ?? 0).toLocaleString("vi-VN")} VNĐ
                                                </p>
                                            </div>
                                        ) : (
                                            <p>{(tour.price ?? 0).toLocaleString("vi-VN")} VNĐ</p>
                                        )
                                    ) : (
                                        <p className="text-gray-400 italic">Chưa có giá</p>
                                    )}

                                    <Link to={`/tours/${tour.tourId}`} state={{ tour }}>
                                        <button className="tour-detail-button">
                                            Chi Tiết
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`pagination-button ${currentPage === 1 ? "pagination-button-disabled" : "pagination-button-inactive"}`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`pagination-button ${currentPage === page ? "pagination-button-active" : "pagination-button-inactive"}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`pagination-button ${currentPage === totalPages ? "pagination-button-disabled" : "pagination-button-inactive"}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}