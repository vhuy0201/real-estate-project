import type { OfferStatus } from '../types/Offer';

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const getStatusColor = (status: OfferStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'forwarded_to_seller':
      return 'info';
    case 'seller_reviewing':
      return 'info';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

export const getStatusColorConfig = (status: OfferStatus) => {
  switch (status) {
    case 'pending':
      return {
        backgroundColor: '#FFF3E0',
        color: '#E65100',
        borderColor: '#FFB74D',
      };
    case 'forwarded_to_seller':
      return {
        backgroundColor: '#E3F2FD',
        color: '#1565C0',
        borderColor: '#64B5F6',
      };
    case 'seller_reviewing':
      return {
        backgroundColor: '#E1BEE7',
        color: '#7B1FA2',
        borderColor: '#BA68C8',
      };
    case 'accepted':
      return {
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        borderColor: '#81C784',
      };
    case 'rejected':
      return {
        backgroundColor: '#FFEBEE',
        color: '#C62828',
        borderColor: '#EF5350',
      };
    case 'cancelled':
      return {
        backgroundColor: '#F5F5F5',
        color: '#616161',
        borderColor: '#9E9E9E',
      };
    default:
      return {
        backgroundColor: '#F5F5F5',
        color: '#616161',
        borderColor: '#9E9E9E',
      };
  }
};

