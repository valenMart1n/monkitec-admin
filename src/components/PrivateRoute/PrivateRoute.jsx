import { Navigate } from "react-router-dom";

function PrivateRoute({children}){
    const isAuthenticated = () => {
        try{
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            return !!(userStr && token);
        }catch(error){
            return false;
        }
    }
    return isAuthenticated() ? children: <Navigate to="/" replace/>;
}

export default PrivateRoute;