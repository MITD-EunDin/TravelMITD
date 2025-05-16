import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

function AdminRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />; 
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />; 
    }

    return children;
}

export default AdminRoute;
