import { memo, useState } from "react";
import "./account.scss";
import { User, Bell, ReceiptText, LogOut, Heart, Menu, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Đăng xuất thành công!');
    window.location.reload();
};

const PageAccountCommon = ({ isMenuOpen, toggleMenu }) => {
    return (
        <div className="account-wrapper">
            <button
                className={`menu-toggle-button ${isMenuOpen ? 'menu-toggle-button-hidden' : ''}`}
                onClick={toggleMenu}
            >
                <Menu size={24} />
                <span>Menu</span>
            </button>
            <div className={`container-account ${isMenuOpen ? 'container-account-open' : ''}`}>
                <div className="account-header">
                    <div className="info-account">
                        <User />
                        <span>Cha eun woo</span>
                    </div>
                    <button className="menu-close-button" onClick={toggleMenu}>
                        <X size={24} />
                    </button>
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
        </div>
    );
};

const AccountLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="account-layout container max-w-screen-xl mx-auto ">
            <PageAccountCommon isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
            <div className="account-content">
                <Outlet />
            </div>
        </div>
    );
};

export default memo(AccountLayout);