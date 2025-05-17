import { memo, useState, useRef, useEffect } from "react";
import { User, TreePalm } from "lucide-react";

import "./style_dtservice.scss";

const DetailService = () => {
  const [regionDropdown, setRegionDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const regionRef = useRef(null);

  const regions = ["Miền Bắc", "Miền Trung", "Miền Nam"];

  const handleRegionClick = () => {
    setRegionDropdown(!regionDropdown);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setRegionDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setRegionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [regionRef]);

  return (
    <div className="page-container">
      <div className="grid">
        <div className="homepage-img">
          <img src={""} alt="" />
        </div>
        <h1>Vui lòng hoàn thành mẫu</h1>
        <div className="from-container">
          <div className="form-1">
            <div className="form-section-title">
              <User />
              <span>Thông tin khách hàng</span>
            </div>
            <div className="form-fields gap-4">
              <ul className="input-column">
                <li>
                  <span>Họ và tên</span>
                  <input type="text" />
                </li>
                <li>
                  <span>Email</span>
                  <input type="text" />
                </li>
                <li ref={regionRef} className="region-dropdown">
                  <text>Chọn vùng</text>
                  <span onClick={handleRegionClick}>
                    Khu vực {selectedRegion && `: ${selectedRegion}`}
                  </span>
                  {regionDropdown && (
                    <ul className="region-list">
                      {regions.map((region) => (
                        <li
                          key={region}
                          onClick={() => handleRegionSelect(region)}
                        >
                          {region}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
              <ul className="input-column">
                <li>
                  <span>Điện thoại</span>
                  <input type="text" />
                </li>
                <li>
                  <span>Căn cước công dân</span>
                  <input type="text" />
                </li>
                <li>
                  <span>Địa chỉ</span>
                  <input type="text" />
                </li>
              </ul>
            </div>
          </div>
          <div className="form-2">
            <div className="form-section-title">
              <TreePalm />
              <span>Tour yêu cầu</span>
            </div>
            <div className="form-field-2">
              <div className="form-description">
                <span>Mô tả</span>
                <input type="text" />
              </div>
              <div className="form-fields">
                <ul className="input-column">
                  <li>
                    <span>Ngày khởi hành</span>
                    <input type="text" />
                  </li>
                  <li>
                    <span>Số lượng người</span>
                    <input type="text" />
                  </li>
                </ul>
                <ul className="input-column">
                  <li>
                    <span>Ngày kết thúc</span>
                    <input type="text" />
                  </li>
                  <li>
                    <span>Số trẻ em</span>
                    <input type="text" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button className="submit-button">Gửi đi</button>
        </div>
      </div>
    </div>
  );
};

export default memo(DetailService);