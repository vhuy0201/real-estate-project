import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RentPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/search?type=for-rent', { replace: true });
    }, [navigate]);
    return null;
};

export default RentPage;