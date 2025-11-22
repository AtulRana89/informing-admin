import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as z from "zod";
import { apiService } from "../services";
import toast from "react-hot-toast";

// Define the validation schema
const createUserSchema = z
  .object({
    personalName: z
      .string()
      .min(1, "Personal name is required")
      .min(2, "Personal name must be at least 2 characters"),
    middleInitial: z.string().optional().or(z.literal("")),
    familyName: z
      .string()
      .min(1, "Family name is required")
      .min(2, "Family name must be at least 2 characters"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    affiliationUniversity: z
      .string()
      .min(1, "Affiliation/University is required"),
    department: z.string().min(1, "Department is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    repeatPassword: z.string().min(1, "Please repeat your password"),

    // ✅ Add role field here
    role: z.string().optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ["repeatPassword"],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role") || "user";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onTouched",
    defaultValues: {
      personalName: "",
      middleInitial: "",
      familyName: "",
      city: "",
      country: "",
      affiliationUniversity: "",
      department: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    console.log("Form submitted with data:", data);
    try {
      // Remove repeatPassword from the payload
      const { repeatPassword, ...payload } = data;

      // ✅ Add role to payload if present
      if (role) payload.role = role;
      console.log("Creating user...", payload);
      await apiService.post("/user/", payload);

      toast.success("User created successfully!");
      reset();
      navigate(`/users?role=${role?.charAt(0).toUpperCase() + role?.slice(1)}`);
      // Adjust navigation path as needed
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to create user. Please try again."
      );
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    reset();
    //navigate(`/users?role=${role}`);
    navigate(`/users?role=${role?.charAt(0).toUpperCase() + role?.slice(1)}`);
    // navigate("/users"); // Adjust navigation path as needed
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-3xl font-light text-gray-700 mb-[2vw]">
          New User
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Personal Name and Middle Initial Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Personal Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("personalName")}
                className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.personalName ? "border-red-500" : "border-gray-300"
                  } bg-white focus:outline-none focus:ring-1 ${errors.personalName ? "focus:ring-red-500" : ""
                  }`}
              />
              {errors.personalName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.personalName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Middle Initial
              </label>
              <input
                type="text"
                {...register("middleInitial")}
                className="w-full !bg-[#FAFAFA] px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1"
              />
            </div>
          </div>

          {/* Family Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Family Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("familyName")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.familyName ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.familyName ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.familyName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.familyName.message}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              City <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("city")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.city ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.city ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.city && (
              <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Country <span className="text-red-600">*</span>
            </label>
            <select
              {...register("country")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.country ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.country ? "focus:ring-red-500" : ""
                }`}
            >
              <option value=""></option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="IN">India</option>
              <option value="AU">Australia</option>
            </select>
            {errors.country && (
              <p className="text-red-600 text-sm mt-1">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Affiliation/University */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Affiliation/University <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("affiliationUniversity")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.affiliationUniversity
                ? "border-red-500"
                : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.affiliationUniversity ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.affiliationUniversity && (
              <p className="text-red-600 text-sm mt-1">
                {errors.affiliationUniversity.message}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Department <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("department")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.department ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.department ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Your Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                } bg-blue-50 focus:outline-none focus:ring-1 ${errors.email ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Set your Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Set your Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••"
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                } bg-blue-50 focus:outline-none focus:ring-1 ${errors.password ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Repeat Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Repeat Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              {...register("repeatPassword")}
              className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${errors.repeatPassword ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:ring-1 ${errors.repeatPassword ? "focus:ring-red-500" : ""
                }`}
            />
            {errors.repeatPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.repeatPassword.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="!bg-[#FF4D7D] cursor-pointer !rounded-none border !border-red-600 !border-x-0 !border-b-4 hover:!bg-[#FF3366] text-white font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="!bg-gray-200 cursor-pointer !rounded-none !border-gray-300 !border-x-0 !border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
