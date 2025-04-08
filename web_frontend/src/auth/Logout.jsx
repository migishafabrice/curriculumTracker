import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Remove the auth token from localStorage
        localStorage.removeItem("AuthToken");

        // Redirect to the login page
        navigate("/login");
    }, [navigate]);

    return null;
};
export default Logout;