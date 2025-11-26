import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import logo from "../assets/informing-science-logo.png";
import { apiService, authService } from "../services";

// ✅ Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setApiError("");

      const response = await apiService.post<{ user?: any; message?: string }>(
        "/admin/login",
        data
      );

      if (response.user) authService.setUser(response.user);

      const token = authService.getToken();
      if (!token) throw new Error("Authentication token not received");

      navigate("/");
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data.data?.message || error.response.data?.error;

        if (status === 401) setApiError("Invalid email or password");
        else if (status === 403)
          setApiError("Access denied. Admin privileges required.");
        else if (status === 422) setApiError(message || "Invalid input data");
        else setApiError(message || "An error occurred. Please try again.");
      } else if (error.request) {
        setApiError("Network error. Please check your connection.");
      } else {
        setApiError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-100"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#4282c8] p-3 rounded-full">
            <img
              src={logo}
              alt="App Logo"
              className=" object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Welcome Back
        </h2>

        {/* API Error */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
            {apiError}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${errors.email
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${errors.password
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full !bg-[#4282c8] hover:bg-[#3674b5] text-white py-2.5 rounded-md font-medium transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A7.9 7.9 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                />
              </svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-4">
          © {new Date().getFullYear()} Informing Science Institute
        </p>
      </form>
    </div>
  );
};

export default Login;
