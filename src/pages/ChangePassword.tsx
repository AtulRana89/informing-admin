import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import  { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiService } from "../services";
import toast from "react-hot-toast";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, { message: "Current password is required" }),
        newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
        confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePassword = ({ setModel }: { setModel: (val: boolean) => void }) => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("id");

    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ChangePasswordFormData) => {
        if (!userId) {
            toast.error("User ID is required");
            return;
        }
        setIsLoading(true);
        try {
            let payload = {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }
            await apiService.post("/admin/change-password", payload);
            toast.success("Password changed successfully!");
            setModel(false);
        } catch (err: any) {
            console.error("Error changing password:", err?.response?.data?.data?.message);
            toast.error(err?.response?.data?.data?.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setModel(false);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white border-2 border-gray-400 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-50">
                <h2 className="text-2xl text-gray-700 font-normal">Change Password</h2>
                <button
                    className="text-gray-500 hover:text-gray-700 !border-none"
                    onClick={() => setModel(false)}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Current Password</label>
                    <input
                        type="password"
                        {...register("currentPassword")}
                        className="w-full bg-[#FAFAFA] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    />
                    {errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">New Password</label>
                    <input
                        type="password"
                        {...register("newPassword")}
                        className="w-full bg-[#FAFAFA] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    />
                    {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        {...register("confirmPassword")}
                        className="w-full bg-[#FAFAFA] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-center mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="!bg-[#5a9bd2] cursor-pointer border border-red-600 border-x-0 border-b-4 hover:!bg-blue-700 text-white font-medium px-8 py-2.5 transition"
                    >
                        {isSubmitting || isLoading ? "Saving..." : "Change Password"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
