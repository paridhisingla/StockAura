import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();
    
    if (loading) {
        return <div>Loading...</div>; 
    }

    const isAdmin = user?.email === "yashmittal4949@gmail.com";

    if (!isAuthenticated) {
        
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;