import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import { ShieldCheck, Tag, Star, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import TourSection from "../../../components/common/TourSection";
import Footer from "../../../components/common/Footer";
import { getAllTours } from "../../../api/TourApi";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaStar } from "react-icons/fa";
import GallerySection from "./GallerySection";
import { ToursContext } from "../../../Contexts/ToursContext";
import RSSNews from "../RSSNews";
import ChatBox from "../../../components/chatbox";
import image1 from '../../../assets/image/image1.jpg';
import image2 from '../../../assets/image/image2.jpg';
import image3 from '../../../assets/image/image3.jpg';
import image4 from '../../../assets/image/image4.jpg';
import image5 from '../../../assets/image/image5.jpg';

import { filterDomesticTours, filterInternationalTours, filterDiscountTours } from "../../../Data/tourData";

export const Banner = () => {
    return (
        <div className="relative w-full max-w-screen-xl mx-auto ">
            <img
                src="https://danviet.mediacdn.vn/upload/3-2018/images/2018-07-30/7-tours-du-lich-tai-Viet-Nam-duoc-khach-du-lich-nuoc-ngoai-yeu-thich-nhat-4-1532915094-width640height480.jpg"
                alt="Banner"
                className="w-full h-[300px] object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white text-center p-4">
                <h1 className="text-3xl font-bold mb-2">Khám phá thế giới cùng chúng tôi</h1>
                <p className="text-lg">Dịch vụ du lịch chuyên nghiệp với những trải nghiệm tuyệt vời.</p>
                <Link to={'/tours'}>
                    <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Xem Tour Ngay
                    </button>
                </Link>
            </div>
        </div>
    )
}

export const TopDestinations = ({ tours }) => {
    // Định nghĩa các bộ lọc tương tự PageTour
    const categoryFilter = {
        north: (tour) => tour.region === "Miền Bắc",
        central: (tour) => tour.region === "Miền Trung",
        south: (tour) => tour.region === "Miền Nam",
        china: (tour) => tour.country === "Trung Quốc",
        korea: (tour) => tour.country === "Hàn Quốc",
        japan: (tour) => tour.country === "Nhật Bản",
        americas: (tour) => tour.country === "Mỹ",
    };

    // Tính số lượng tour cho mỗi danh mục
    const tourCounts = {
        domestic: tours.filter((tour) => ["Miền Bắc", "Miền Trung", "Miền Nam"].includes(tour.region)).length,
        china: tours.filter(categoryFilter.china).length,
        japan: tours.filter(categoryFilter.japan).length,
        americas: tours.filter(categoryFilter.americas).length,
        korea: tours.filter(categoryFilter.korea).length,
    };

    // Cập nhật destinations với số lượng tour thực tế
    const destinations = [
        { name: "Tour trong nước", image: image1, tours: `${tourCounts.domestic} Tours`, filter: { regions: "north,central,south" } },
        { name: "Trung Quốc", image: image2, tours: `${tourCounts.china} Tours`, filter: { country: "china" } },
        { name: "Nhật Bản", image: image3, tours: `${tourCounts.japan} Tours`, filter: { country: "japan" } },
        { name: "Mỹ", image: image4, tours: `${tourCounts.americas} Tours`, filter: { country: "americas" } },
        { name: "Hàn Quốc", image: image5, tours: `${tourCounts.korea} Tours`, filter: { country: "korea" } },
    ];
    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Điểm đến hàng đầu
                    </h2>
                    <div className="mt-4 flex justify-center">
                        <div className="w-16 h-1 bg-blue-500 rounded"></div>
                    </div>
                </div>
                <div className="space-y-8">
                    {/* Hàng trên: 2 ảnh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {destinations.slice(0, 2).map((dest, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                <Link
                                    to={{
                                        pathname: "/tours",
                                        search: dest.filter.regions
                                            ? `regions=${dest.filter.regions}`
                                            : `country=${dest.filter.country}`,
                                    }}
                                >
                                    <img
                                        src={dest.image}
                                        alt={`${dest.name} destination`}
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-4">
                                        <span className="block text-xl font-semibold text-gray-900">
                                            {dest.name}
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            {dest.tours}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                    {/* Hàng dưới: 3 ảnh */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {destinations.slice(2, 5).map((dest, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                <Link
                                    to={{
                                        pathname: "/tours",
                                        search: dest.filter.regions
                                            ? `regions=${dest.filter.regions}`
                                            : `country=${dest.filter.country}`,
                                    }}
                                >
                                    <img
                                        src={dest.image}
                                        alt={`${dest.name} destination`}
                                        className="w-full h-52 object-cover"
                                    />
                                    <div className="p-4">
                                        <span className="block text-xl font-semibold text-gray-900">
                                            {dest.name}
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            {dest.tours}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const WhyChooseUs = () => {
    return (
        <section className="max-w-screen-xl mx-auto py-12 px-6">
            <h2 className="text-3xl font-bold text-center mb-8 uppercase">
                tại sao chọn tập đoàn của chúng tôi
            </h2>
            <p className="py-8">MIT-D TOUR với thông điệp mang đam mê của chúng tôi gửi gắm đến bạn qua những chuyến đi và chất lượng luôn được đặt lên hàng đầu và mang đến cho du khách những sản phẩm hoàn hảo nhất</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Thanh toán an toàn */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center uppercase">
                    <ShieldCheck className="mx-auto mb-4 text-blue-500" size={40} />
                    <h3 className="text-xl font-semibold mb-3">Thanh toán an toàn</h3>
                    <p>Được bảo mật bởi tổ chức quốc tế</p>
                </div>

                {/* Giá tốt - nhiều ưu đãi */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <Tag className="mx-auto mb-4 text-green-500" size={40} />
                    <h3 className="text-xl font-semibold mb-3 uppercase">Giá tốt -が多く ưu đãi</h3>
                    <p>Ưu đãi và quà tặng hấp dẫn khi đặt tour online.</p>
                </div>

                {/* Thương hiệu uy tín */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <Star className="mx-auto mb-4 text-yellow-500" size={40} />
                    <h3 className="text-xl font-semibold mb-3 uppercase">Thương hiệu uy tín</h3>
                    <p>Thương hiệu lữ hành hàng đầu Việt Nam.</p>
                </div>
            </div>
        </section>
    );
};

export const TourFilter = ({ onFilterChange }) => {
    const [selected, setSelected] = useState("domestic");

    const handleFilter = (type) => {
        setSelected(type);
        onFilterChange(type); // Gọi callback để cập nhật danh sách tour
    };

    return (
        <div className="flex justify-center my-4 ">
            <div className="flex justify-center bg-gray-200 rounded-lg">
                <button
                    className={`px-4 py-2 font-semibold rounded-lg ${selected === "domestic" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                        }`}
                    onClick={() => handleFilter("domestic")}
                >
                    Tour trong nước
                </button>
                <button
                    className={`px-4 py-2 font-semibold rounded-lg ${selected === "international" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                        }`}
                    onClick={() => handleFilter("international")}
                >
                    Tour nước ngoài
                </button>
            </div>
        </div>
    );
};

const CustomerReviews = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 260;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const reviews = [
        {
            name: "Nguyễn Văn A",
            comment: "Tour tuyệt vời, dịch vụ chất lượng. Hướng dẫn viên siêu dễ thương!",
            avatar: "https://i.pravatar.cc/100?img=1",
            rating: 5
        },
        {
            name: "Trần Thị B",
            comment: "Mình rất hài lòng, sẽ giới thiệu bạn bè 🥰",
            avatar: "https://i.pravatar.cc/100?img=2",
            rating: 5
        },
        {
            name: "Phạm Văn C",
            comment: "Giá tốt, tour chất lượng. 10 điểm không có nhưng mà 9.9 😎",
            avatar: "https://i.pravatar.cc/100?img=3",
            rating: 4
        },
        {
            name: "Lê Thị D",
            comment: "Đi xong là muốn đặt tiếp luôn 😭❤️",
            avatar: "https://i.pravatar.cc/100?img=4",
            rating: 5
        },
        {
            name: "Hoàng Minh",
            comment: "Hành trình suôn sẻ, tài xế chạy êm, cảm giác an toàn.",
            avatar: "https://i.pravatar.cc/100?img=5",
            rating: 4
        },
        {
            name: "Ngọc Hân",
            comment: "Lần đầu đặt tour và mình đã không thất vọng! Dịch vụ tốt quá trời.",
            avatar: "https://i.pravatar.cc/100?img=6",
            rating: 5
        },
        {
            name: "Thành Trung",
            comment: "Hướng dẫn viên nhiệt tình, vui tính, like mạnh!",
            avatar: "https://i.pravatar.cc/100?img=7",
            rating: 5
        },
        {
            name: "Bảo Anh",
            comment: "Đi tour xong về cái là phải lên review liền. Quá đỉnh! 🔥",
            avatar: "https://i.pravatar.cc/100?img=8",
            rating: 5
        },
        {
            name: "Quốc Đạt",
            comment: "Khách sạn đẹp, lịch trình hợp lý, không mệt. Tuyệt vời!",
            avatar: "https://i.pravatar.cc/100?img=9",
            rating: 4
        },
        {
            name: "Diễm My",
            comment: "Đặt tour lúc 3h sáng mà vẫn có người hỗ trợ. Quá ưng!",
            avatar: "https://i.pravatar.cc/100?img=10",
            rating: 5
        }
    ];

    return (
        <section className="relative max-w-screen-xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-8 uppercase text-gray-800">
                khách hàng đánh giá
            </h2>

            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
            >
                <ChevronLeft size={24} />
            </button>

            <div
                ref={scrollRef}
                className="flex overflow-x-scroll space-x-4 px-2 py-4 scrollbar-hide scroll-smooth"
                style={{ scrollBehavior: "smooth" }}
            >
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="w-[250px] flex-shrink-0 bg-white rounded-2xl shadow-md p-4 text-center hover:shadow-xl transition"
                    >
                        <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-blue-400"
                        />
                        <h3 className="font-semibold text-lg text-blue-600">{review.name}</h3>
                        <div className="flex justify-center mt-2 mb-1">
                            {Array.from({ length: review.rating }, (_, i) => (
                                <FaStar key={i} className="text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-sm italic text-gray-600 mt-2">"{review.comment}"</p>
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
            >
                <ChevronRight size={24} />
            </button>
        </section>
    );
};

const MainPage = () => {
    const [filter, setFilter] = useState("domestic");
    const [allTours, setAllTours] = useState([]);
    const { tours } = useContext(ToursContext);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Gọi API khi component mount
    useEffect(() => {
        const fetchTours = async () => {
            const data = await getAllTours();
            console.log("Dữ liệu từ API:", data);
            setAllTours(data);
        };
        fetchTours();
    }, []);

    // Theo dõi sự kiện cuộn để hiển thị/ẩn nút "Quay lại đầu trang"
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const toursMemo = useMemo(() => {
        console.log("Lọc tour theo filter:", filter);
        if (filter === "domestic") {
            const result = filterDomesticTours(allTours);
            console.log("Các tour nội địa:", result);
            return result;
        }
        if (filter === "international") {
            const result = filterInternationalTours(allTours);
            console.log("Các tour quốc tế:", result);
            return result;
        }
        console.log("Tất cả các tour:", allTours);
        return allTours;
    }, [filter, allTours]);

    const discountTours = useMemo(() => {
        console.log("Lọc Tour giảm giá từ tất cả tour:", allTours);
        const result = filterDiscountTours(allTours);
        console.log("Các tour giảm giá:", result);
        return result.slice(0, 4);
    }, [allTours]);

    return (
        <div>
            <Banner />
            <TopDestinations tours={tours} />
            <div className="container max-w-screen-xl mx-auto p-4">
                {/* <TourFilter onFilterChange={setFilter} />
                <TourSection title="Các Tour Hấp Dẫn" tours={tours} /> */}
                <TourSection title="Tour Giảm Giá Hấp Dẫn 🔥" tours={discountTours} isDiscount />
                <div className="flex justify-center mt-6">
                    <Link to="/tours?filter=discount">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                            Xem thêm
                        </button>
                    </Link>
                </div>
            </div>
            <CustomerReviews />
            <section className="max-w-screen-xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Tin tức Du lịch Mới Nhất</h2>
                    <Link to="/news" className="text-blue-600 hover:underline text-lg">
                        Xem tất cả
                    </Link>
                </div>
                <RSSNews limit={4} />
            </section>
            <GallerySection />
            <WhyChooseUs />
            <Footer />
            {/* Nút Quay lại đầu trang */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 z-50"
                    title="Quay lại đầu trang"
                >
                    <ArrowUp size={24} />
                </button>
            )}
            <ChatBox/>
        </div>
    );
};

export default MainPage;