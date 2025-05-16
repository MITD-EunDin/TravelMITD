import React, { useState, useEffect } from 'react';
import AddTour from '../AddTour/index';
import { deleteTour, getAllTours, addSchedule } from '../../../api/TourApi';
import { X, Edit, Trash2, RefreshCcw, Search, Plus } from "lucide-react";
import './tour.css';

const AddSchedule = ({ onClose, onAddSchedule, tourId }) => {
  const [schedule, setSchedule] = useState({
    tourId: tourId || '',
    departureDate: '',
    peopleLimit: '',
  });

  const handleChange = (e) => {
    setSchedule({
      ...schedule,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddSchedule(schedule);
      onClose();
    } catch (error) {
      console.error('Lỗi khi thêm lịch trình:', error);
      alert('Đã có lỗi khi thêm lịch trình. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] max-w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Thêm Lịch Trình Tour 🗓️</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã tour</label>
            <input
              type="text"
              name="tourId"
              value={schedule.tourId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày khởi hành</label>
            <input
              type="date"
              name="departureDate"
              value={schedule.departureDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng người tối đa</label>
            <input
              type="number"
              name="peopleLimit"
              value={schedule.peopleLimit}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tour = () => {
  const [tours, setTours] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingTour, setEditingTour] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);

  const openScheduleModal = (tourId) => {
    setSelectedTourId(tourId);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedTourId(null);
  };

  const handleAddSchedule = async (newSchedule) => {
    try {
      const updatedTour = await addSchedule(newSchedule.tourId, {
        departureDate: newSchedule.departureDate,
        peopleLimit: parseInt(newSchedule.peopleLimit),
      });
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.tourId === newSchedule.tourId ? updatedTour : tour
        )
      );
      alert('Thêm lịch trình thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm lịch trình:', error);
      throw error;
    }
  };

  const openModal = (tour = null) => {
    if (tour) {
      setEditingTour(tour);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTour(null);
  };

  const handleAddTour = (newTour) => {
    setTours((prev) => [...prev, newTour]);
    closeModal();
  };

  const handleUpdateTour = (updatedTour) => {
    setTours((prev) =>
      prev.map((t) => (t.tourId === updatedTour.tourId ? updatedTour : t))
    );
    closeModal();
  };

  const handleDelete = async (tourId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tour này?");
    if (confirmDelete) {
      try {
        await deleteTour(tourId);
        setTours((prevTours) => prevTours.filter((tour) => tour.tourId !== tourId));
        alert('Xóa tour thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa tour:', error);
        alert('Đã có lỗi khi xóa tour. Vui lòng thử lại.');
      }
    }
  };

  const fetchTours = async () => {
    try {
      const data = await getAllTours();
      console.log('Dữ liệu tours từ API:', data);
      setTours(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tour:', error);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const filteredTours = tours
    .filter((tour) =>
      (filterType ? tour.tourType === filterType : true) &&
      (searchText
        ? (tour.tourId && tour.tourId.toString().includes(searchText)) ||
        (tour.tourName &&
          tour.tourName.toLowerCase().includes(searchText.toLowerCase())) ||
        (tour.tourType &&
          tour.tourType.toLowerCase().includes(searchText.toLowerCase()))
        : true)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      return sortAsc
        ? a[sortField] > b[sortField]
          ? 1
          : -1
        : a[sortField] < b[sortField]
          ? 1
          : -1;
    });

  return (
    <div className="tour-container">
      <div className="tour-header">
        <div className="tour-header-top">
          <div className="tour-refesh" onClick={fetchTours}>
            <RefreshCcw size={20} strokeWidth={2} />
            <span>Tải lại</span>
          </div>

          <div className="tour-search">
            <span>Tìm kiếm</span>
            <input
              type="text"
              placeholder="Mã/Tên tour/Phân loại"
              className="tour-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search size={20} strokeWidth={2} />
          </div>

          <Plus
            data-testid="btn-them-tour"
            size={24}
            strokeWidth={2}
            className="tour-add text-pink-500 hover:text-pink-600 hover:scale-110 transition-all duration-300 cursor-pointer bg-pink-100 p-2 rounded-full shadow-md"
            onClick={() => openModal()}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="tour-header-bottom">
          <select
            name="type"
            className="tour-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tất cả tour</option>
            <option value="DOMESTIC">Tour trong nước</option>
            <option value="INTERNATIONAL">Tour quốc tế</option>
          </select>

          <select
            name="sort"
            className="tour-select"
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="">Sắp xếp theo</option>
            <option value="price">Giá</option>
            <option value="duration">Thời lượng</option>
          </select>

          <button onClick={() => setSortAsc(!sortAsc)} className="tour-sort-btn">
            {sortAsc ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <table className="tour-table mt-4">
        <thead>
          <tr>
            <th>Mã tour</th>
            <th>Tên tour</th>
            <th>Hình ảnh</th>
            <th>Thời lượng</th>
            <th>Giá</th>
            <th>Giá ưu đãi</th>
            <th>Ưu đãi</th>
            <th>Nơi ở</th>
            <th>Khu vực</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredTours.map((tour) => (
            <tr key={tour.tourId}>
              <td>{tour.tourId}</td>
              <td>{tour.tourName}</td>
              <td>
                {tour.images && tour.images.length > 0 ? (
                  <img src={tour.images[0]} alt="Tour" className="tour-image" />
                ) : tour.image ? (
                  <img src={tour.image} alt="Tour" className="tour-image" />
                ) : (
                  <div className="tour-image-placeholder"></div>
                )}
              </td>
              <td>{tour?.duration}</td>
              <td>{(tour?.price ?? 0).toLocaleString()}₫</td>
              <td>{(tour?.newPrice ?? 0).toLocaleString()}₫</td>
              <td>{tour?.discount}</td>
              <td>{tour?.accommodation}</td>
              <td>{tour?.region}</td>
              <td className="action-buttons">
                <button
                  className="action-btn edit-btn"
                  onClick={() => openModal(tour)}
                >
                  <Edit size={18} className="text-white" />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(tour.tourId)}
                >
                  <Trash2 size={18} className="text-white" />
                </button>
                <button
                  className="action-btn schedule-btn"
                  onClick={() => openScheduleModal(tour.tourId)}
                >
                  📅
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <AddTour
          onClose={closeModal}
          onAddTour={handleAddTour}
          onUpdateTour={handleUpdateTour}
          tourToEdit={editingTour}
        />
      )}

      {isScheduleModalOpen && (
        <AddSchedule
          onClose={closeScheduleModal}
          onAddSchedule={(schedule) => handleAddSchedule({ ...schedule, tourId: selectedTourId })}
          tourId={selectedTourId}
        />
      )}
    </div>
  );
};

export default Tour;