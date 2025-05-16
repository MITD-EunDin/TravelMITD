import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

function ProtectedAdmin({ children }) {
    const { user } = useAuth();

    console.log("ProtectedAdmin - User:", user);

    if (!user) {
        console.log("ProtectedAdmin - Not logged in, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    const isAdmin = user.roles && (user.roles.includes("ADMIN") || user.roles.includes("ROLE_ADMIN"));
    if (!isAdmin) {
        console.log("ProtectedAdmin - Not an admin, redirecting to /");
        return <Navigate to="/" replace />;
    }

    console.log("ProtectedAdmin - User is admin, rendering children");
    return children;
}

export default ProtectedAdmin;