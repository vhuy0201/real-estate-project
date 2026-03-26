export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
