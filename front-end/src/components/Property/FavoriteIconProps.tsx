import { useEffect, useState } from 'react'
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { checkFavoriteType } from '@/types/FavoriteType';
import { addPropertyFavorite, checkPropertyFavorite, deletePropertyFavorite } from '@/services/buyerService';
type FavoriteIconPropsType = {
    property_id: string;
    onRemove?: () => void;
    mode?: 'normal' | 'delayed';
};
const FavoriteIconProps = ({ property_id, onRemove, mode = 'normal' }: FavoriteIconPropsType) => {
    const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
    useEffect(() => {
        const fetchIsFavorite = async () => {
            try {
                const data: checkFavoriteType = await checkPropertyFavorite(property_id);
                setIsFavorite(data.isFavorite);
            } catch (error) {
                console.log(error);
            }
        };
        fetchIsFavorite();
    }, [property_id]);
    const handleFavorite = async () => {
        try {
            if (isFavorite) {
                if (mode === 'normal') {
                    await deletePropertyFavorite(property_id);
                    setIsFavorite(false);
                } else if (mode === 'delayed') {
                    setIsFavorite(false);
                    if (onRemove) onRemove();
                }
            } else {
                await addPropertyFavorite(property_id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.log(error);
        }
    }
    if (isFavorite === null) {
        return null;
    }
    return (
        <div className=' text-white'>
            <button
                title='favorite'
                className='cursor-pointer'
                onClick={handleFavorite}
            >
                <FavoriteIcon
                    className={isFavorite ? 'text-red-500' : 'text-gray-300'}
                />
            </button>
        </div>
    )
}
export default FavoriteIconProps
