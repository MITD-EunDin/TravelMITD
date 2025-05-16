import React, { useState } from 'react';
import './Setting.css';


const Setting = () => {
  const [activeTab, setActiveTab] = useState('tour');

  const tabs = [
    { id: 'tour', label: 'Tour', icon: '🛒' },
    { id: 'trip', label: 'Đơn hàng', icon: '✈️' },
    { id: 'staff', label: 'Nhân viên', icon: '👤' },
    { id: 'customer', label: 'Khách hàng', icon: '👥' },
    { id: 'announ', label: 'Thống báo', icon: '🔔' },
  ];

  return (
    <div className="setting-container">
      <h2>Setting</h2>
      <h3>Cấu hình chung</h3>
      <div className="setting-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`setting-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
      <div className="setting-content">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default Setting;