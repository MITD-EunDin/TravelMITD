import { memo, useState, useEffect } from "react";
import "./style_detail.scss";
import { Link, useLocation } from "react-router-dom";
import ReviewTour from './review/review';
import tourtravel from '../../../assets/tourtravel.png'
const DetailTour = () => {
  const location = useLocation();
  const tour = location.state?.tour;
  console.log("Tour data:", tour);

  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  // Thiết lập ảnh chính ban đầu khi tour thay đổi
  useEffect(() => {
    if (tour) {
      const images = Array.isArray(tour.images) ? tour.images : [];
      setMainImage(
        images.length > 0 ? images[0] : tour.image || 'https://via.placeholder.com/300'
      );
    }
  }, [tour]);

  const handleImageClick = (image) => {
    setMainImage(image);
    console.log("Selected image:", image);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Lấy danh sách ảnh từ tour.images, fallback về tour.image hoặc placeholder
  const tourImages = Array.isArray(tour?.images) && tour.images.length > 0
    ? tour.images
    : tour?.image
      ? [tour.image]
      : ['https://via.placeholder.com/300'];

  return (
    <div className="page-container container max-w-screen-lg mx-auto">
      <div className="grid">
        <div className="homepage-img">
          <img src={tourtravel} alt="Banner" />
        </div>
        <div className="detail-trip">
          <div className="detail-1">
            <img src={mainImage} alt="Main tour image" className="img-parent" />
            <ul className="img-chld">
              {tourImages.map((image, index) => (
                <li
                  key={index}
                  className={mainImage === image ? 'active' : ''}
                  onClick={() => handleImageClick(image)}
                >
                  <img src={image} alt={`Tour image ${index + 1}`} />
                </li>
              ))}
            </ul>
          </div>
          <div className="detail-2">
            <h1>{tour?.tourName || 'Tour Name'}</h1>
            <ul>
              <li><span>Thời gian :</span><span>{tour?.duration || 'N/A'}</span></li>
              <li><span>Phương tiện :</span><span>{tour?.transportation || 'N/A'}</span></li>
              <li><span>Lưu trú :</span><span>{tour?.accommodation || 'N/A'}</span></li>
              <li><span>Khởi hành :</span><span>Thứ 6 hàng tuần</span></li>
            </ul>
            <div>
              <div>
                <p className="text-xl">
                  {tour.discount > 0 ? (
                    <>
                      <del className="text-gray-500">{tour.price.toLocaleString()} VNĐ</del>{' '}
                      <span className="text-3xl text-red-500 font-bold">
                        {tour.newPrice.toLocaleString()} VNĐ
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl text-red-500 font-bold">
                      {tour.price.toLocaleString()} VNĐ
                    </span>
                  )}{' '}
                  / người
                </p>
              </div>
              <Link to="/booking" className="linkto" state={{ tour }}>
                <button>Đặt tour</button>
              </Link>
            </div>
          </div>
        </div>
        <ReviewTour tour={tour} />
      </div>
    </div>
  );
};

export default memo(DetailTour);