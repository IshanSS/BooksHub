import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const UserRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "user") {
    return <Navigate to="/login" />;
  }
  return children;
};

export default UserRoute;
