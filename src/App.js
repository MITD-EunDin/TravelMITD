import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./views/FormLog/Login";
import SignupForm from "./views/FormLog/signup";
import ResetPassword from "./views/FormLog/ResetPassword";

import { AuthProvider, useAuth } from "../src/Contexts/AuthContext";
import ProtectedAdmin from "./routes/ProtectedAdmin";
import ProtectedUser from "./routes/ProtectedUser";
import { ToursProvider } from "./Contexts/ToursContext";

import { userRoutes } from "./routes/UserRoutes";
import { adminRoutes } from "./routes/AdminRoutes";

import AccountLayout from "./views/PageUser/Account/AccountLayout";
import UserProfile from "./views/PageUser/Account/UserProfile";
import Notification from "./views/PageUser/Account/Notification";
import BookingHistory from "./views/PageUser/Account/paymentHistory";
import Favorites from "./views/PageUser/Account/Favorite";
import InvoiceDetail from "./views/PageUser/Account/billdetail";

import ProtectedEmployee from "./routes/ProtectedEmployee";
import EmployeeLayout from "./views/PageStaff/EmployeeLayout";
import EmployeeDashboard from "./views/PageStaff/EmployeeDashboard";
import EmployeeOrders from "./views/PageStaff/EmployeeOrders";
import EmployeeProfile from "./views/PageStaff/EmployeeProfile";
import EmployeeTours from "./views/PageStaff/EmployeeTours";
import EmployeeNotifications from "./views/PageStaff/EmployeeNotifications";


import Booking from "./views/PageUser/booking";
import PaymentResult from "./views/PageUser/PaymentResult";
import PaymentDetailPage from "./views/PageAdmin/PaymentDetail";


import AdminLayout from './views/PageAdmin/AdminSidebar';
import UserLayout from "./components/common/Navbar";



function App() {
  // Danh sách các đường dẫn công khai
  const publicRoutes = userRoutes.filter(
    (route) =>
      route.path === "/" ||
      route.path === "/tours" ||
      route.path === "/introduce" ||
      route.path === "/news" ||
      route.path.includes("/tours/:id")
  );

  // Danh sách các đường dẫn yêu cầu đăng nhập
  const protectedRoutes = userRoutes.filter((route) => route.path === "/booking" || route.path === "/detailservice");
  return (
    <AuthProvider>
      <ToursProvider>
        <Router>
          <Routes>
            <Route path="/" element={<UserLayout />}>
              {publicRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Route>
            {/* ✅ Nếu chưa đăng nhập -> luôn đưa về trang login */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path='/invoices/:bookingId' element={<InvoiceDetail />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            {/* Các route yêu cầu đăng nhập */}
            <Route element={<ProtectedUser><UserLayout /></ProtectedUser>}>
              {protectedRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}

              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<UserProfile />} />
                <Route path="notification" element={<Notification />} />
                <Route path="booking_history" element={<BookingHistory />} />
                <Route path="favorites" element={<Favorites />} />
              </Route>
            </Route>



            {/* ✅ Bảo vệ trang admin, chỉ cho phép admin truy cập */}
            <Route path="/admin/*" element={<ProtectedAdmin> <AdminLayout /></ProtectedAdmin>}>
              {adminRoutes.map((route, idx) => (
                <Route key={idx} path={route.path} element={route.element} />
              ))}
              <Route path="payments/:bookingId" element={<PaymentDetailPage />} />
            </Route>

            {/* Route nhân viên */}
            <Route path="/employee/*" element={<ProtectedEmployee><EmployeeLayout /></ProtectedEmployee>}>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="orders" element={<EmployeeOrders />} />
              <Route path="tours" element={<EmployeeTours />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>

            {/* Chuyển hướng về trang chủ nếu đường dẫn không hợp lệ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToursProvider>
    </AuthProvider>
  );
}

export default App;
