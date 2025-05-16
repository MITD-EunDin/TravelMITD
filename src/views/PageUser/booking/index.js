import { memo, useState, useRef, useEffect } from 'react';
import '../booking/style_book.scss';
import { User, TreePalm, FilePenLine, ReceiptText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyInfo } from "../../../api/Api";
import { bookTour, makePayment, getVnpayUrl } from '../../../api/BookingApi';
import { Spin, Alert, Button, InputNumber, Radio, message } from 'antd';
import bookdetail from '../../../assets/bookdetail.png';
const Booking = () => {
    const location = useLocation();
    const tour = location.state?.tour;
    const navigate = useNavigate();

    const [regionDropdown, setRegionDropdown] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const regionRef = useRef(null);

    const [numAdults, setNumAdults] = useState(1);
    const [numChildren, setNumChildren] = useState(0);
    const [total, setTotal] = useState(0);
    const [deposit, setDeposit] = useState(0);
    const [payFull, setPayFull] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedMethod, setSelectedMethod] = useState('vnpay');
    const [selectedSchedule, setSelectedSchedule] = useState(tour?.tourSchedules?.[0]?.departureDate || tour?.tourSchedule?.departureDate || '');
    const [tourScheduleId, setTourScheduleId] = useState(tour?.tourSchedules?.[0]?.id || '');

    const paymentOptions = [
        { id: 'vnpay', label: 'VNPAY (ATM, Visa, QR Code)', icon: '/vnpay-logo.png' },
        { id: 'momo', label: 'MOMO', icon: '/momo-logo.png' },
        { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: '/bank-icon.png' },
        { id: 'office', label: 'Thanh toán tại văn phòng', icon: '/office-icon.png' },
    ];

    const [userInfo, setUserInfo] = useState({
        fullname: '',
        email: '',
        address: '',
        phone: '',
        citizenId: '',
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getMyInfo(token);
                    setUserInfo({
                        fullname: data.fullname || '',
                        email: data.email || '',
                        address: data.address || '',
                        phone: data.phone || '',
                        citizenId: data.citizenId || '',
                    });
                } catch (err) {
                    setError('Không lấy được thông tin người dùng');
                }
            } else {
                setError('Vui lòng đăng nhập để đặt tour');
            }
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [numAdults, numChildren, tour]);

    const calculateTotal = () => {
        console.log('Tour data:', tour);
        if (!tour || !tour.newPrice) {
            setError('Thông tin tour không hợp lệ');
            setTotal(0);
            setDeposit(0);
            return;
        }
        const pricePerAdult = parseFloat(tour.newPrice);
        if (isNaN(pricePerAdult) || pricePerAdult <= 0) {
            setError('Giá tour không hợp lệ');
            setTotal(0);
            setDeposit(0);
            return;
        }
        const pricePerChild = pricePerAdult * 0.5;
        const totalAmount = numAdults * pricePerAdult + numChildren * pricePerChild;
        const depositAmount = totalAmount * 0.3;
        console.log('Calculated: totalAmount=', totalAmount, 'depositAmount=', depositAmount);
        setTotal(totalAmount);
        setDeposit(depositAmount);
    };

    const handleRegionClick = () => {
        setRegionDropdown(!regionDropdown);
    };

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setRegionDropdown(false);
    };

    const handleScheduleChange = (e) => {
        const departureDate = e.target.value;
        setSelectedSchedule(departureDate);
        const schedule = tour?.tourSchedules?.find((s) => s.departureDate === departureDate);
        if (!schedule || !schedule.id) {
            setError('Lịch trình không hợp lệ hoặc thiếu ID');
            setTourScheduleId('');
            return;
        }
        setTourScheduleId(schedule.id);
        setError('');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (regionRef.current && !regionRef.current.contains(event.target)) {
                setRegionDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleBookingAndPayment = async () => {
        if (!tour?.tourId || numAdults < 1) {
            setError('Vui lòng chọn tour và số lượng người hợp lệ');
            return;
        }
        if (!tourScheduleId && !(tour?.tourSchedule?.id)) {
            setError('Vui lòng chọn ngày khởi hành hợp lệ');
            return;
        }
        if (!selectedMethod) {
            setError('Vui lòng chọn phương thức thanh toán');
            return;
        }
        if (total <= 0 || (!payFull && deposit <= 0)) {
            setError('Số tiền không hợp lệ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Bước 1: Gửi yêu cầu đặt tour
            const bookingData = {
                tourId: tour.tourId,
                tourScheduleId: tourScheduleId || tour?.tourSchedule?.id,
                adultQuantity: numAdults,
                childQuantity: numChildren,
            };
            console.log('Sending bookingData:', bookingData);
            const bookingResponse = await bookTour(bookingData);
            const bookingId = bookingResponse.id;
            console.log('Booking response:', bookingResponse);

            // Bước 2: Xử lý thanh toán
            const amountToPay = payFull ? total : deposit;
            console.log('Amount to pay:', amountToPay, 'Pay full:', payFull);
            if (selectedMethod === 'vnpay') {
                const paymentResponse = await getVnpayUrl(bookingId, amountToPay);
                console.log('VNPAY URL response:', paymentResponse);
                window.location.href = paymentResponse.result;
            } else {
                const paymentData = {
                    bookingId,
                    amount: amountToPay,
                    method: selectedMethod.toUpperCase(),
                    payFull,
                };
                console.log('Sending paymentData:', paymentData);
                await makePayment(paymentData);
                message.success('Thanh toán thành công!');
                navigate('/payment-result?status=success', { state: { booking: { ...bookingResponse, amountPaid: amountToPay } } });
            }
        } catch (err) {
            console.error('Error in booking/payment:', err);
            setError(err.response?.data?.message || 'Đặt tour hoặc thanh toán thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container container max-w-screen-xl mx-auto">
            <div className="grid">
                <div className="homepage-img">
                    <img src={bookdetail} alt="Company Booking" />
                </div>
                <div className="homepage-booking">
                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Spin spinning={loading}>
                        <div style={{ minHeight: "200px", textAlign: "center", padding: "50px" }}>
                            {loading && "Đang xử lý..."}
                        </div>
                    </Spin>
                    <div className="detail-book">
                        <div className="detail-book-1">
                            <div className="detail-book-1-1">
                                <div>
                                    <TreePalm />
                                    <span>Đặt tour</span>
                                </div>
                                <div>
                                    <ul>
                                        <li>
                                            <span>Loại tour</span>
                                            <input type="text" value={tour?.tourType || ''} readOnly />
                                        </li>
                                        <li>
                                            <span>Số lượng người</span>
                                            <InputNumber
                                                min={1}
                                                value={numAdults}
                                                onChange={(value) => setNumAdults(value || 0)}
                                                style={{ width: '100%' }}
                                            />
                                        </li>
                                        <li>
                                            <span>Ngày khởi hành</span>
                                            {tour?.tourSchedules && tour.tourSchedules.length > 0 ? (
                                                <select
                                                    value={selectedSchedule}
                                                    onChange={handleScheduleChange}
                                                    className="form-tour_input"
                                                    required
                                                >
                                                    <option value="">Chọn ngày khởi hành</option>
                                                    {tour.tourSchedules.map((schedule) => (
                                                        <option key={schedule.departureDate} value={schedule.departureDate}>
                                                            {schedule.departureDate} ({schedule.currentPeople}/{schedule.peopleLimit})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={tour?.tourSchedule?.departureDate || ''}
                                                    readOnly
                                                />
                                            )}
                                        </li>
                                    </ul>
                                    <ul>
                                        <li>
                                            <span>Tên tour</span>
                                            <input type="text" value={tour?.tourName || ''} readOnly />
                                        </li>
                                        <li>
                                            <span>Số trẻ em</span>
                                            <InputNumber
                                                min={0}
                                                value={numChildren}
                                                onChange={(value) => setNumChildren(value || 0)}
                                                style={{ width: '100%' }}
                                            />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="detail-book-1-2">
                                <div>
                                    <User />
                                    <span>Thông tin khách hàng</span>
                                </div>
                                <div>
                                    <ul>
                                        <li>
                                            <span>Họ và tên</span>
                                            <input type="text" value={userInfo.fullname} readOnly />
                                        </li>
                                        <li>
                                            <span>Email</span>
                                            <input type="text" value={userInfo.email} readOnly />
                                        </li>
                                        <li>
                                            <span>Địa chỉ</span>
                                            <input type="text" value={userInfo.address} readOnly />
                                        </li>
                                    </ul>
                                    <ul>
                                        <li>
                                            <span>Điện thoại</span>
                                            <input type="text" value={userInfo.phone} readOnly />
                                        </li>
                                        <li>
                                            <span>Căn cước công dân</span>
                                            <input type="text" value={userInfo.citizenId} readOnly />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="detail-info">
                        <div>
                            <ul>
                                <li>
                                    <ReceiptText />
                                    <span>Thông tin đặt tour</span>
                                </li>
                                <li>
                                    <span>Tên tour</span>
                                    <span>{tour?.tourName}</span>
                                </li>
                                <li>
                                    <span>Giá</span>
                                    <span>{tour?.newPrice}</span>
                                </li>
                                <li>
                                    <span>Thời gian</span>
                                    <span>{tour?.duration}</span>
                                </li>
                                <li>
                                    <span>Phương tiện</span>
                                    <span>{tour?.transportation}</span>
                                </li>
                                <li>
                                    <span>Lưu trú</span>
                                    <span>{tour?.accommodation}</span>
                                </li>
                                <li>
                                    <span>Khởi hành</span>
                                    <span>{selectedSchedule || tour?.tourSchedule?.departureDate}</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4>Chọn phương thức thanh toán</h4>
                            {paymentOptions.map((option) => (
                                <label key={option.id} className="payment-option">
                                    <span>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={selectedMethod === option.id}
                                            onChange={() => setSelectedMethod(option.id)}
                                        />
                                    </span>
                                    <img src={option.icon} alt={option.label} />
                                </label>
                            ))}
                        </div>
                        <div>
                            <h4>Chọn loại thanh toán</h4>
                            <Radio.Group
                                onChange={(e) => setPayFull(e.target.value)}
                                value={payFull}
                                style={{ marginBottom: 16 }}
                            >
                                <Radio value={false}>Thanh toán cọc (30%): {deposit.toLocaleString()} VND</Radio>
                                <Radio value={true}>Thanh toán toàn bộ: {total.toLocaleString()} VND</Radio>
                            </Radio.Group>
                            <ul>
                                <li>
                                    <span>Tổng tiền</span>
                                    <span>{total.toLocaleString()} VND</span>
                                </li>
                                <li>
                                    <span>Tiền đặt cọc (30%)</span>
                                    <span>{deposit.toLocaleString()} VND</span>
                                </li>
                            </ul>
                            <Button
                                type="primary"
                                onClick={handleBookingAndPayment}
                                disabled={loading}
                                style={{ marginTop: 8 }}
                            >
                                Thanh toán
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Booking);