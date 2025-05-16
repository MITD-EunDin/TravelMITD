
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

const ProtectedUser = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute - User:", user);

    return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedUser;
