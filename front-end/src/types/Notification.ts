export type NotificationType = {
  _id: string;
  user_id: string;
  title: {
    vi: string;
    en: string;
  };
  message: {
    vi: string;
    en: string;
  };
  type: string;
  is_read: boolean;
  related_id: string;
  action_url?: string;
  createdAt: string;
  updatedAt: string;
};
