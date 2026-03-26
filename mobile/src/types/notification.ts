// e:\Ki6\Ass\Project\real-estate-project\mobile\src\types\notification.ts

export type NotificationType = 
  | 'property' 
  | 'appointment' 
  | 'offer' 
  | 'chat' 
  | 'system' 
  | 'deal' 
  | 'contract' 
  | 'payment';

export interface MultilangText {
  vi: string;
  en: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  title: MultilangText;
  message: MultilangText;
  type: NotificationType;
  related_id?: string;
  action_url?: string;
  is_read: boolean;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Notification[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}
