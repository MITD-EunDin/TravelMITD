import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-10">
            <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột 1: Giới thiệu */}
                <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-4">MITD TRAVEL GROUP</h3>
                    <p className="text-sm">
                        04 Lệ Phi Vũ, P.Liễu Như Yên , Ninja , Đại Lục Tu Tiên Giới
                    </p>
                    <p>
                        Giấy phép đăng kí kinh doanh (Mã số thuế): 123456789 do Sở KHĐT TP Hà Nội cấp.
                    </p>
                </div>

                {/* Cột 2: Liên kết nhanh */}
                <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-4">CÁC CHI NHÁNH VĂN PHÒNG</h3>
                    <ul className="space-y-2">
                        <li>

                            <h3 className="uppercases">CHI NHÁNH TP.HCM</h3>
                            <p>ĐỊA CHỈ: 55 Đỗ Quang Đẩu, P. Phạm Ngũ Lão , Quận 1 Thành Phố Hồ Chí Minh
                            </p>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">CHI NHÁNH TP.HÀ NỘI</a>
                            <p>ĐỊA CHỈ : Số 22 ,1/122 Phú Viên, Bồ Đề , Long Biên , Thủ đô Hà Nội
                            </p>
                        </li>

                    </ul>
                </div>

                {/* Cột 3: Liên hệ */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-4">Liên hệ</h3>
                    <ul className="space-y-2 ">
                        <li className="flex items-center justify-center">
                            <Mail className="mr-2 text-blue-400" size={20} />
                            <a href="mailto:contact@example.com" className="hover:text-white">
                                contact@example.com
                            </a>
                        </li>
                        <li className="flex items-center justify-center">
                            <Phone className="mr-2 text-green-400" size={20} />
                            <span>+84 123 456 789</span>
                        </li>
                    </ul>
                    <div className="mt-8 flex justify-center space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white">
                            <Facebook size={24} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            <Instagram size={24} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white">
                            <Twitter size={24} />
                        </a>
                    </div>
                </div>
            </div>
            {/* Bản quyền */}
            <div className="mt-6 text-center text-gray-500 text-sm">
                © 2024 Công ty Du Lịch. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
