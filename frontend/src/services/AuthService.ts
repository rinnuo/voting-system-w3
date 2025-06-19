import { userApi } from "./interceptors";
import type { User } from "../models/user";

export class AuthService {
  static async login(username: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    try {
      const response = await userApi.post("users/login/", { username, password });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const userResponse = await userApi.get<User>("users/me/");
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      return { ...response.data, user: userResponse.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Error al iniciar sesión: " + error.message);
      }
      throw new Error("Error al iniciar sesión: An unknown error occurred");
    }
  }

  static logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}