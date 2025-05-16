import { memo, useState, useRef, useEffect } from "react";
import img2 from "../../../assets/celebratetour.png";
import { User, TreePalm } from "lucide-react";

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
    <div className="">
      <div className="max-w-[1200px] w-full mx-auto bg-[#f7f7f7] py-5 px-4">
        <div className="w-full mb-8">
          <img src={img2} alt="" className="w-full" />
        </div>
        <h1 className="text-[2rem] text-[#4581BA] flex justify-center mb-5">
          Vui lòng hoàn thành mẫu
        </h1>
        <div className="max-w-[800px] mx-auto bg-white p-6 rounded-xl shadow">
          {/* Thông tin khách hàng */}
          <div className="bg-[#f9f9f9] p-5 rounded-lg mb-5 shadow">
            <div className="flex items-center font-bold text-[#555] mb-4 text-lg">
              <User className="mr-2" />
              <span>Thông tin khách hàng</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Cột 1 */}
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Họ và tên</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Email</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li ref={regionRef} className="relative flex flex-col">
                  <text className="text-[#757575] pb-1">Chọn vùng</text>
                  <span
                    onClick={handleRegionClick}
                    className="cursor-pointer p-2 border border-gray-300 rounded-md"
                  >
                    Khu vực {selectedRegion && `: ${selectedRegion}`}
                  </span>
                  {regionDropdown && (
                    <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow z-10">
                      {regions.map((region) => (
                        <li
                          key={region}
                          onClick={() => handleRegionSelect(region)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {region}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>

              {/* Cột 2 */}
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Điện thoại</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Căn cước công dân</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Địa chỉ</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
              </ul>
            </div>
          </div>

          {/* Tour yêu cầu */}
          <div className="bg-[#f9f9f9] p-5 rounded-lg shadow mb-5">
            <div className="flex items-center font-bold text-[#555] mb-4 text-lg">
              <TreePalm className="mr-2" />
              <span>Tour yêu cầu</span>
            </div>
            <div className="mb-4">
              <span className="block mb-1 text-[#666]">Mô tả</span>
              <input
                type="text"
                className="w-full h-[200px] p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Ngày khởi hành</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Số lượng người</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
              </ul>
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Ngày kết thúc</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
                <li className="flex flex-col">
                  <span className="mb-1 text-[#757575]">Số trẻ em</span>
                  <input type="text" className="p-2 w-[300px] border border-gray-300 rounded-md" />
                </li>
              </ul>
            </div>
          </div>

          <button className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white py-2 px-4 rounded-md text-lg transition">
            Gửi đi
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(DetailService);
