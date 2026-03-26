export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  password?: string; 
}

export type UpdateProfileDto = {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: File;
}

export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}