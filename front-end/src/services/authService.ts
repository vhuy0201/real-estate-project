import api from "../api/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    [k: string]: any;
  };
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/api/client/auth/login", payload);
  // backend trả { message, data: { token, user } }
  const data = res.data?.data;
  return { token: data.accessToken, user: data.user };
}

export const loginWithGoogleRequest = async (idToken: string) => {
  const res = await api.post("/api/client/auth/google", { idToken });
  const data = res.data?.data;
  return { accessToken: data.accessToken, user: data.user };
};
