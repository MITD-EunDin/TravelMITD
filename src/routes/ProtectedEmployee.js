import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

const ProtectedEmployee = ({ children }) => {
    const { user } = useAuth();

    if (!user || user.scope !== "STAFF") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedEmployee;