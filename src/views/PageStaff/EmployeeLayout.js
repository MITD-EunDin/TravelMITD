import { Outlet } from "react-router-dom";
import { EmployeeSidebar } from "./EmployeeSidebar";
import { useAuth } from "../../Contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Kiểm tra quyền STAFF
    useEffect(() => {
        if (!user || user.scope !== "STAFF") {
            navigate("/login");
        }
    }, [user, navigate]);

    return (
        <div className="flex min-h-screen">
            <EmployeeSidebar />
            <div className="flex-1 p-6 bg-gray-100 ml-64">
                <Outlet />
            </div>
        </div>
    );
}