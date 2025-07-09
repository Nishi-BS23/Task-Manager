import { authApi } from "../lib/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  console.log("Logging in with payload:", payload);
  const res = await authApi.post("/auth/login", payload);
  console.log("Login response:", res);
  return res.data;
};
