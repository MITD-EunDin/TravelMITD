import { memo } from "react";
import "./account.scss";
import { User, Bell, ReceiptText, LogOut, Heart } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Đăng xuất thành công!');
    window.location.reload();
};

export const PageAccountCommon = () => {
    return (
        <div className="container-account">
            <div className="info-account">
                <User />
                <span>Cha eun woo</span>
            </div>
            <ul className="listNavi-account">
                <li>
                    <NavLink
                        to="/account"
                        end
                        className={({ isActive }) => (isActive ? "linkto active" : "linkto")}
                    >
                        <User />
                        <span>Hồ sơ của tôi</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="notification"
                        className={({ isActive }) => (isActive ? "linkto active" : "linkto")}
                    >
                        <Bell />
                        <span>Thông báo</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="booking_history"
                        className={({ isActive }) => (isActive ? "linkto active" : "linkto")}
                    >
                        <ReceiptText />
                        <span>Đơn mua</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="favorites"
                        className={({ isActive }) => (isActive ? "linkto active" : "linkto")}
                    >
                        <Heart />
                        <span>Yêu thích</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/dang-xuat" className="linkto" onClick={handleLogout}>
                        <LogOut />
                        <span>Đăng xuất</span>
                    </NavLink>
                </li>

            </ul>
        </div>
    );
};

const AccountLayout = () => {
    return (
        <div className="account-layout container max-w-screen-xl mx-auto">
            <PageAccountCommon />
            <div className="account-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AccountLayout;
