import React, { useState, useEffect } from 'react';
import { addTour, updateTour } from '../../../api/TourApi';
import './AddTour.css';

const AddTour = ({ onClose, onAddTour, onUpdateTour, tourToEdit }) => {
  const [newTour, setNewTour] = useState({
    tourName: '',
    price: '',
    discount: '',
    newPrice: '',
    duration: '',
    description: '',
    itinerary: '',
    transportation: '',
    accommodation: '',
    tourType: '',
    region: '',
    images: [], // Thay image bằng images (danh sách URL)
    peopleLimit: '',
    currentPeople: '',
    departureDate: '',
  });
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]); // Lưu URL preview ảnh

  useEffect(() => {
    if (tourToEdit) {
      const firstSchedule = tourToEdit.tourSchedules?.[0];
      const price = Number(tourToEdit.price) || 0;
      const discount = Number(tourToEdit.discount) || 0;
      const newPrice = price - (price * (discount / 100));
      setNewTour({
        tourName: tourToEdit.tourName || '',
        price: tourToEdit.price || '',
        discount: tourToEdit.discount || '',
        newPrice: newPrice || '',
        duration: tourToEdit.duration || '',
        description: tourToEdit.description || '',
        itinerary: tourToEdit.itinerary || '',
        transportation: tourToEdit.transportation || '',
        accommodation: tourToEdit.accommodation || '',
        tourType: tourToEdit.tourType || '',
        region: tourToEdit.region || '',
        images: tourToEdit.images || [tourToEdit.image].filter(Boolean), // Chuyển image thành images
        peopleLimit: firstSchedule ? firstSchedule.peopleLimit : '',
        currentPeople: firstSchedule ? firstSchedule.currentPeople : '',
        departureDate: firstSchedule ? firstSchedule.departureDate : '',
      });
      setImagePreviews(tourToEdit.images || [tourToEdit.image].filter(Boolean));
    }
  }, [tourToEdit]);

  // Tính toán newPrice khi price hoặc discount thay đổi
  useEffect(() => {
    const price = Number(newTour.price) || 0;
    const discount = Number(newTour.discount) || 0;
    const newPrice = price - (price * (discount / 100));
    setNewTour((prev) => ({ ...prev, newPrice: newPrice || 0 }));
  }, [newTour.price, newTour.discount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTour((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e) => {
    const departureDate = e.target.value;
    setSelectedSchedule(departureDate);
    const schedule = tourToEdit?.tourSchedules?.find(
      (s) => s.departureDate === departureDate
    );
    setNewTour((prev) => ({
      ...prev,
      peopleLimit: schedule ? schedule.peopleLimit : '',
      currentPeople: schedule ? schedule.currentPeople : '',
      departureDate: departureDate,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newTour.images.length > 3) {
      alert('Chỉ được chọn tối đa 3 ảnh.');
      return;
    }

    const newImageUrls = [...newTour.images];
    const newPreviews = [...imagePreviews];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'image tour');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/duydoyrpb/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.secure_url) {
          newImageUrls.push(data.secure_url);
          newPreviews.push(data.secure_url);
        } else {
          throw new Error('Upload ảnh thất bại');
        }
      } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        alert('Upload ảnh thất bại. Vui lòng thử lại.');
        return;
      }
    }

    setNewTour((prev) => ({ ...prev, images: newImageUrls }));
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newImageUrls = newTour.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setNewTour((prev) => ({ ...prev, images: newImageUrls }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra giá trị hợp lệ
    const price = Number(newTour.price);
    const discount = Number(newTour.discount);
    const peopleLimit = Number(newTour.peopleLimit);
    if (price < 0 || discount < 0 || peopleLimit < 0) {
      alert('Giá, ưu đãi hoặc giới hạn người không được nhỏ hơn 0.');
      return;
    }
    if (newTour.images.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh.');
      return;
    }

    // Chuẩn bị payload
    const tourPayload = {
      tourName: newTour.tourName,
      price: price,
      discount: discount,
      newPrice: Number(newTour.newPrice),
      duration: newTour.duration,
      description: newTour.description,
      itinerary: newTour.itinerary,
      transportation: newTour.transportation,
      accommodation: newTour.accommodation,
      tourType: newTour.tourType,
      region: newTour.region,
      images: newTour.images,
      peopleLimit: peopleLimit,
      currentPeople: Number(newTour.currentPeople) || 0,
      departureDate: newTour.departureDate || null,
    };

    try {
      let updatedTour;
      if (tourToEdit) {
        updatedTour = await updateTour(tourToEdit.tourId, tourPayload);
        onUpdateTour(updatedTour);
      } else {
        const addedTour = await addTour(tourPayload);
        onAddTour(addedTour);
      }
      alert(tourToEdit ? 'Cập nhật tour thành công!' : 'Thêm tour thành công!');
      onClose();
    } catch (error) {
      console.error('Lỗi khi thêm/sửa tour:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Đã có lỗi khi thêm/sửa tour. Vui lòng thử lại.'}`);
    }
  };

  return (
    <div className="modal-tour_overlay">
      <div className="modal-tour_content">
        <div className="modal-tour_header">
          <h5>{tourToEdit ? 'Cập nhật Tour' : 'Thiết lập Tour'}</h5>
          <div className="modal-tour_header_group">
            <img src="/Eye Closed.png" alt="ẩn" />
            <div className="header-save" onClick={handleSubmit} style={{ cursor: 'pointer' }}>
              <img src="/Save 3.png" alt="Lưu" />
              <p>Lưu</p>
            </div>
            <button onClick={onClose} className="close-button">X</button>
          </div>
        </div>

        <form className="modal-tour_body">
          <div className="form-tour_row">
            <div className="form-tour_group">
              <label>Tên Tour</label>
              <input
                type="text"
                name="tourName"
                value={newTour.tourName}
                onChange={handleInputChange}
                className="form-tour_input"
                required
              />
            </div>
            <div className="form-tour_group">
              <label>Loại Tour</label>
              <select
                name="tourType"
                value={newTour.tourType}
                onChange={handleInputChange}
                className="form-tour_input"
                required
              >
                <option value="">Chọn loại tour</option>
                <option value="DOMESTIC">Trong nước</option>
                <option value="INTERNATIONAL">Quốc tế</option>
              </select>
            </div>
          </div>

          <div className="form-tour_row">
            <div className="form-tour_group">
              <label>Khu vực</label>
              <select
                name="region"
                value={newTour.region}
                onChange={handleInputChange}
                className="form-tour_input"
                required
              >
                <option value="">Chọn khu vực</option>
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
              </select>
            </div>
            <div className="form-tour_group">
              <label>Thời lượng</label>
              <input
                type="text"
                name="duration"
                value={newTour.duration}
                onChange={handleInputChange}
                className="form-tour_input"
              />
            </div>
          </div>

          <div className="form-tour_row">
            <div className="form-tour_group">
              <label>Phương tiện</label>
              <input
                type="text"
                name="transportation"
                value={newTour.transportation}
                onChange={handleInputChange}
                className="form-tour_input"
              />
            </div>
            <div className="form-tour_group">
              <label>Nơi ở</label>
              <input
                type="text"
                name="accommodation"
                value={newTour.accommodation}
                onChange={handleInputChange}
                className="form-tour_input"
              />
            </div>
          </div>

          {tourToEdit && tourToEdit.tourSchedules && tourToEdit.tourSchedules.length > 0 ? (
            <div className="form-tour_row">
              <div className="form-tour_group">
                <label>Ngày khởi hành</label>
                <select
                  value={selectedSchedule}
                  onChange={handleScheduleChange}
                  className="form-tour_input"
                >
                  <option value="">Chọn ngày khởi hành</option>
                  {tourToEdit.tourSchedules.map((schedule) => (
                    <option key={schedule.departureDate} value={schedule.departureDate}>
                      {schedule.departureDate} ({schedule.currentPeople}/{schedule.peopleLimit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-tour_group">
                <label>Giới hạn người</label>
                <input
                  type="text"
                  value={newTour.peopleLimit ? `${newTour.currentPeople}/${newTour.peopleLimit}` : ''}
                  readOnly
                  className="form-tour_input"
                />
              </div>
            </div>
          ) : (
            <div className="form-tour_row">
              <div className="form-tour_group">
                <label>Ngày khởi hành</label>
                <input
                  type="date"
                  name="departureDate"
                  value={newTour.departureDate}
                  onChange={handleInputChange}
                  className="form-tour_input"
                />
              </div>
              <div className="form-tour_group">
                <label>Giới hạn người</label>
                <input
                  type="number"
                  name="peopleLimit"
                  value={newTour.peopleLimit}
                  onChange={handleInputChange}
                  className="form-tour_input"
                  min="0"
                />
              </div>
            </div>
          )}

          <div className="form-tour_row">
            <div className="form-tour_group">
              <label>Giá</label>
              <input
                type="number"
                name="price"
                value={newTour.price}
                onChange={handleInputChange}
                className="form-tour_input"
                min="0"
              />
            </div>
            <div className="form-tour_group">
              <label>Ưu đãi (%)</label>
              <input
                type="number"
                name="discount"
                value={newTour.discount}
                onChange={handleInputChange}
                className="form-tour_input"
                min="0"
              />
            </div>
            <div className="form-tour_group">
              <label>Giá mới</label>
              <input
                type="number"
                name="newPrice"
                value={newTour.newPrice}
                readOnly
                className="form-tour_input"
              />
            </div>
          </div>

          <div className="form-tour_group">
            <label>Lịch trình</label>
            <textarea
              name="itinerary"
              value={newTour.itinerary}
              onChange={handleInputChange}
              className="form-tour_textarea"
            />
          </div>

          <div className="form-tour_group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={newTour.description}
              onChange={handleInputChange}
              className="form-tour_textarea"
            />
          </div>

          <div className="form-tour_group">
            <label>Ảnh (tối đa 3 ảnh)</label>
            <div className="image-upload">
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-container">
                    <img src={preview} alt={`Tour ${index + 1}`} className="preview-image" />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 3 && (
                  <div className="image-placeholder">
                    <span>Chọn ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="image-input"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="button" className="submit-button" onClick={handleSubmit}>
            {tourToEdit ? 'Cập nhật tour' : 'Thêm tour'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTour;