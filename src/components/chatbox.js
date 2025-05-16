import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllTours } from '../api/TourApi';

const ChatBox = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tours, setTours] = useState([]);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Chào bạn! Tôi có thể gợi ý tour theo điểm đến, loại tour, chỗ ở, giá hoặc giảm giá. Bạn muốn tìm tour nào?' }
  ]);
  const chatContainerRef = useRef(null);
  const hasFetchedTours = useRef(false);

  // Hàm sửa vùng/quốc gia
  const fixLocation = (tour) => {
    if (tour.tourName?.match(/ĐÀI LOAN/i)) return 'Đài Loan';
    if (tour.tourName?.match(/MỸ THO|VŨNG TÀU|CẦN THƠ|CHÂU ĐỐC/i)) return 'Miền Nam';
    return tour.country || tour.region || 'Không rõ địa điểm';
  };

  // Hàm xử lý khoảng giá từ input
  const parsePriceRange = (input) => {
    input = input.toLowerCase().replace(/[^0-9- khoảng dưới trên]/g, '');
    if (input.includes('dưới')) {
      const max = parseInt(input.match(/\d+/)[0]) * 1000000 || Infinity;
      return { min: 0, max };
    }
    if (input.includes('trên')) {
      const min = parseInt(input.match(/\d+/)[0]) * 1000000 || 0;
      return { min, max: Infinity };
    }
    if (input.includes('khoảng')) {
      const [min, max] = input.match(/\d+/g).map(n => parseInt(n) * 1000000) || [0, Infinity];
      return { min, max };
    }
    const price = parseInt(input) * (input.includes('triệu') ? 1000000 : 1) || 0;
    return { min: price * 0.8, max: price * 1.2 }; // ±20% cho tìm kiếm gần đúng
  };

  // Hàm chọn ngẫu nhiên tối đa 4 tour
  const getRandomTours = (tours, max = 4) => {
    if (tours.length <= max) return tours;
    const shuffled = [...tours].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, max);
  };

  // Lấy danh sách tour
  useEffect(() => {
    const fetchTours = async () => {
      if (hasFetchedTours.current) return;
      hasFetchedTours.current = true;

      try {
        const data = await getAllTours();
        console.log('Dữ liệu tour từ API:', JSON.stringify(data, null, 2));
        const validTours = data.filter(
          tour =>
            tour &&
            tour.tourName &&
            typeof tour.price === 'number' &&
            tour.discount !== undefined
        );
        setTours(validTours);
        const discountTours = getRandomTours(validTours.filter(tour => tour.discount > 0));
        if (discountTours.length > 0) {
          setChatHistory(prev => [
            ...prev,
            { sender: 'bot', text: 'Dưới đây là một số tour giảm giá nổi bật:' },
            ...discountTours.map(tour => ({
              sender: 'bot',
              text: (
                <div>
                  <div>
                    {tour.id ? (
                      <Link
                        to={`/tours/${tour.id}`}
                        className="text-blue-600 hover:underline"
                        title={`Xem chi tiết ${tour.tourName}`}
                      >
                        {tour.tourName}
                      </Link>
                    ) : (
                      tour.tourName
                    )}
                  </div>
                  <div>Giá: {(tour.price * (1 - tour.discount / 100)).toLocaleString()} VNĐ (Giảm {tour.discount}%)</div>
                  <div>Chỗ ở: {tour.accommodation || 'Không rõ'}</div>
                  <div>Loại tour: {tour.tourType || 'Không rõ'}</div>
                  <div>Địa điểm: {fixLocation(tour)}</div>
                </div>
              )
            }))
          ]);
        } else {
          setChatHistory(prev => [
            ...prev,
            { sender: 'bot', text: 'Hiện không có tour giảm giá nào!' }
          ]);
        }
      } catch (error) {
        console.error('Lỗi lấy tour:', error.message);
        setChatHistory(prev => [
          ...prev,
          { sender: 'bot', text: 'Không thể tải tour. Vui lòng thử lại sau!' }
        ]);
      }
    };
    fetchTours();
  }, []);

  // Cuộn xuống cuối chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Toggle chatbox
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Xử lý tin nhắn người dùng
  const sendMessage = () => {
    if (!message.trim()) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
    const userInput = message.toLowerCase();

    // Tìm kiếm tour dựa trên tourName, region, country, tourType, accommodation, discount, price
    let matchingTours = tours.filter(tour => {
      // So sánh với tourName, region, country, tourType, accommodation
      const textMatch =
        tour.tourName?.toLowerCase().includes(userInput) ||
        tour.region?.toLowerCase().includes(userInput) ||
        tour.country?.toLowerCase().includes(userInput) ||
        tour.tourType?.toLowerCase().includes(userInput) ||
        tour.accommodation?.toLowerCase().includes(userInput);

      // So sánh với discount
      const discountMatch = userInput.includes('giảm giá') && tour.discount > 0;

      // So sánh với price
      let priceMatch = false;
      if (userInput.match(/\d+/) || userInput.includes('triệu') || userInput.includes('dưới') || userInput.includes('trên')) {
        const { min, max } = parsePriceRange(userInput);
        const finalPrice = tour.price * (1 - (tour.discount || 0) / 100);
        priceMatch = finalPrice >= min && finalPrice <= max;
      }

      return textMatch || discountMatch || priceMatch;
    });

    // Chọn ngẫu nhiên tối đa 4 tour
    matchingTours = getRandomTours(matchingTours);

    const botResponse = matchingTours.length > 0
      ? `Dưới đây là các tour phù hợp với "${message}":`
      : `Không tìm thấy tour phù hợp với "${message}"!`;

    setChatHistory(prev => [
      ...prev,
      { sender: 'bot', text: botResponse },
      ...matchingTours.map(tour => ({
        sender: 'bot',
        text: (
          <div>
            <div>
              {tour.id ? (
                <Link
                  to={`/tours/${tour.id}`}
                  className="text-blue-600 hover:underline"
                  title={`Xem chi tiết ${tour.tourName}`}
                >
                  {tour.tourName}
                </Link>
              ) : (
                tour.tourName
              )}
            </div>
            <div>Giá: {(tour.price * (1 - tour.discount / 100)).toLocaleString()} VNĐ (Giảm {tour.discount}%)</div>
            <div>Chỗ ở: {tour.accommodation || 'Không rõ'}</div>
            <div>Loại tour: {tour.tourType || 'Không rõ'}</div>
            <div>Địa điểm: {fixLocation(tour)}</div>
          </div>
        )
      }))
    ]);

    setMessage('');
  };

  // Xử lý nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-20 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 z-[60]"
        title="Tư vấn tour"
      >
        <img
          src="https://img.icons8.com/ios-filled/50/ffffff/chat.png"
          alt="Chat icon"
          className="w-8 h-8"
        />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-8 w-80 bg-white rounded-lg shadow-xl z-[60] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center bg-blue-500 text-white p-3">
            <h3 className="text-white font-semibold">MIT-D ChatBox Ai</h3>
            <button onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>
          <div
            ref={chatContainerRef}
            className="p-4 max-h-96 overflow-y-auto flex-1"
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-3 flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.sender === 'user' ? 'bg-blue-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{chat.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi về tour..."
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;