import { memo } from "react";
import "./style_introduce.scss";
import introImage from "../../../assets/introduce.png";

const Introduce = () => {
    return (
        <div className="page-container container max-w-screen-lg mx-auto">
            <div className="grid">
                <div className="homepage-img">
                    <img src={introImage} alt="Company Introduction" />
                </div>
                <div className="introduce-title">
                    <h2 className="section-heading">Giới thiệu</h2>
                    <h1 className="company-name">CÔNG TY CỔ PHẦN MIT-D TRAVEL GROUP</h1>
                    <h1 className="company-slogan">TOP 10 CÔNG TY DU LỊCH HÀNG ĐẦU VIỆT NAM</h1>
                </div>

                <div className="introduce-content">
                    <section className="company-info">
                        <h3 className="section-title">THÔNG TIN CƠ BẢN VỀ CÔNG TY</h3>
                        <ul className="info-list">
                            <li>Tên chính thức: CÔNG TY CỔ PHẦN MITD TRAVEL GROUP</li>
                            <li>Tên giao dịch đối ngoại: MITD TRAVEL GROUP JOINT STOCK COMPANY</li>
                            <li>Tên giao dịch viết tắt: VNT GROUP</li>
                            <li>Hình thức sở hữu: Cổ phần</li>
                            <li>Thành lập: Ngày 02/09/2011</li>
                            <li>Giấy phép LHQT số: GP79-747/2015/TCDL-GP LHQT</li>
                            <li>Số ĐKKD: 0311109560 được cấp bởi Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</li>
                            <li>Đăng ký lần đầu ngày 01/09/2011</li>
                            <li>Đăng ký thay đổi lần 11 ngày 22/08/2022</li>
                        </ul>
                    </section>

                    <section className="headquarters">
                        <h3 className="section-title">TRỤ SỞ CHÍNH</h3>
                        <ul className="contact-info">
                            <li>Địa chỉ: 55 Đỗ Quang Đẩu, Phường Phạm Ngũ Lão, Quận 1, Thành phố Hồ Chí Minh, Việt Nam</li>
                            <li>Hotline: 028 7307 9999</li>
                            <li>Tel: (+84) 935 746 946</li>
                            <li>Website: www.MITDtravelgroup.com.vn</li>
                            <li>Email: info@travelgroup.com.vn</li>
                        </ul>
                    </section>

                    <section className="branches">
                        <h3 className="section-title">CHI NHÁNH</h3>

                        <div className="branch-item">
                            <h4 className="branch-name">CHI NHÁNH TẠI PHÚ QUỐC</h4>
                            <ul className="branch-info">
                                <li>Địa chỉ: Tổ 8, Lô A, Khu Tái Định Cư, Khu phố 5, Phường Dương Đông, Thành phố Phú Quốc, Tỉnh Kiên Giang, Việt Nam</li>
                                <li>Điện thoại: (+84) 28 73079999 – (+84) 945407997</li>
                            </ul>
                        </div>

                        <div className="branch-item">
                            <h4 className="branch-name">CHI NHÁNH TẠI BUÔN MA THUỘT</h4>
                            <ul className="branch-info">
                                <li>Địa chỉ: 159/2 Trần Quý Cáp, P. Tự An, TP.Buôn Ma Thuột, Tỉnh DakLak</li>
                                <li>Điện thoại: (+84) 28 73079999 – 0917486879</li>
                            </ul>
                        </div>

                        <div className="branch-item">
                            <h4 className="branch-name">CHI NHÁNH TẠI HUẾ</h4>
                            <ul className="branch-info">
                                <li>Địa chỉ: 31 Chu Văn An, Thành phố Huế, Tỉnh Thừa Thiên Huế</li>
                                <li>Điện thoại: (+84) 917486879 - 02873079999</li>
                            </ul>
                        </div>

                        <div className="branch-item">
                            <h4 className="branch-name">CHI NHÁNH TẠI HÀ NỘI</h4>
                            <ul className="branch-info">
                                <li>Địa chỉ: Số 22,1/22 Phú Viên, Bồ Đề, Long Biên, Thủ đô Hà Nội</li>
                                <li>Điện thoại: (+84) 917486879 - 02873079999</li>
                            </ul>
                        </div>
                    </section>

                    <section className="vision-mission">
                        <div className="vision">
                            <h3 className="section-title">TẦM NHÌN</h3>
                            <ul className="vision-list">
                                <li>Trở thành Thương hiệu du lịch được yêu thích, tin tưởng nhất của người Việt Nam</li>
                                <li>Trở thành công ty Du Lịch mạnh hàng đầu Việt Nam, có uy tín và vị thế trên bản đồ du lịch trong nước và quốc tế</li>
                                <li>Xây dựng thành công chuỗi sản phẩm và dịch vụ du lịch đẳng cấp, góp phần nâng cao chất lượng cuộc sống của người Việt và nâng tầm vị thế của người Việt vươn xa toàn cầu</li>
                            </ul>
                        </div>

                        <div className="mission">
                            <h3 className="section-title">SỨ MỆNH</h3>
                            <ul className="mission-list">
                                <li>Truyền tải vẻ đẹp của các danh lam thắng cảnh, nét văn hóa độc đáo và những thành tựu phát triển mọi mặt của nhân loại tới khách hàng</li>
                                <li>Kết nối, dẫn dắt đem đến cho du khách trải nghiệm thú vị trong từng hành trình đến với những miền đất Việt Nam tươi đẹp và những nền văn minh của các quốc gia trên thế giới</li>
                                <li>Đổi mới sáng tạo và phát triển sản phẩm dịch vụ du lịch có chất lượng tốt nhằm đáp ứng nhu cầu đa dạng và phong phú của khách hàng trong nước và quốc tế</li>
                                <li>Đảm bảo những giá trị lợi ích của khách hàng cũng như thỏa mãn nhu cầu về an toàn trong ngành dịch vụ du lịch khi khách hàng sử dụng sản phẩm</li>
                            </ul>
                        </div>
                    </section>

                    <section className="services">
                        <h3 className="section-title">CÁC THÀNH TÍCH VÀ DỊCH VỤ</h3>
                        <p className="achievement-intro">Công ty Cổ phần MITD Travel Group tự hào cung cấp các sản phẩm du lịch hấp dẫn, an toàn cho Quý khách qua các chương trình du lịch trong và ngoài nước như sau:</p>

                        <ul className="services-list">
                            <li>
                                <strong>Các chương trình du lịch tham quan, dã ngoại, khám phá:</strong>
                                <p>sẽ mang đến cho Quý khách những cảm xúc dạt dào của tình bạn, tình yêu quê hương, đất nước.</p>
                            </li>
                            <li>
                                <strong>Các tour du lịch kết hợp tổ chức hội thảo, sự kiện:</strong>
                                <p>được tổ chức hoành tráng, ấn tượng đẹp, không khí sôi động … sẽ ghi lại những kỷ niệm tốt đẹp trong trái tim và ký ức của mỗi thành viên về những ngày tháng tươi đẹp nhất của nơi đây.</p>
                            </li>
                            <li>
                                <strong>Các chương trình Du Lịch Teambuilding:</strong>
                                <p>với nhiều kịch bản mới lạ nhằm khơi dậy năng lực tiềm ẩn của mỗi cá nhân và phát triển tinh thần & sức mạnh đồng đội, với nhiều đạo cụ độc đáo, ê – kíp thực hiện chuyên nghiệp sẽ mang đến cho Quý khách những giờ phút sảng khoái với nhiều thú vị bất ngờ.</p>
                            </li>
                            <li>
                                <strong>Chương trình du lịch nước ngoài:</strong>
                                <p>Malaysia, Singapore, Campuchia, Hàn Quốc, Trung Quốc, Châu Âu, Canada, Úc…</p>
                            </li>
                            <li>
                                <strong>Tư vấn và cung cấp dịch vụ:</strong>
                                <p>Cấp mới visa, ra hạn visa, xin giấy phép lao động, thẻ tạm trú, thẻ APEC, cung cấp vé máy bay, các loại xe du lịch, đặt phòng khách sạn - resort cao cấp.</p>
                            </li>
                        </ul>
                    </section>

                    <section className="company-story">
                        <h3 className="section-title">VỀ CHÚNG TÔI</h3>
                        <div className="company-description">
                            <p>Với sự am hiểu về điểm đến và sự tôn vinh cái đẹp trong nền văn hóa Việt Nam cũng như của các nước bạn, MITD Travel Group luôn cập nhật những thay đổi cấp thiết để hòa mình vào sự chuyển mình của ngành du lịch trong và ngoài nước.</p>

                            <p>Với tầm nhìn xa; sự tin tưởng mãnh liệt vào sự lãnh đạo của Ban Giám Đốc với kinh nghiệm lâu năm trong lãnh vực lữ hành và sự trợ giúp và tư vấn của các chuyên viên cùng các chuyên gia trong và ngoài nước; và sự tôn trọng đóng góp của mọi thành viên trong công ty, MITD Travel Group phấn đấu để luôn giữ vị trí là một trong những công ty du lịch hàng đầu của Việt Nam và khu vực về qui mô, chất lượng và uy tín.</p>

                            <p>Với nguồn lực dồi dào, tài chính vững mạnh, kinh nghiệm và uy tín trong lĩnh vực dịch vụ du lịch, mối quan hệ bền vững với các đối tác lớn khắp nơi trên thế giới, đội ngũ nhân viên năng động và chuyên nghiệp, MITD Travel Group luôn nỗ lực mang đến cho khách hàng những sản phẩm du lịch giá trị nhất cũng như những trải nghiệm đáng nhớ nhất cho mỗi chuyến đi.</p>
                        </div>
                    </section>
                </div>
            </div>

        </div>
    );
};

export default memo(Introduce);