import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BuyPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/search?type=for-sale', { replace: true });
    }, [navigate]);
    return null;
};

export default BuyPage;