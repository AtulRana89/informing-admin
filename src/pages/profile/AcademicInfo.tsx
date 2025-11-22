import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiService } from "../../services";
import toast from "react-hot-toast";

// Zod Schema - only fields in this form
const academicInfoSchema = z.object({
  affiliationUniversity: z.string().min(1, "Affiliation/University is required"),
  department: z.string().min(1, "Department is required"),
  positionTitle: z.string().optional().or(z.literal("")),
  orcid: z.string().optional().or(z.literal("")),
  resume: z.any().optional(),
  bio: z.string().optional().or(z.literal("")),
});

type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;

const AcademicInfo = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [cvFileName, setCvFileName] = useState<string>("No file chosen");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    // watch,
  } = useForm<AcademicInfoFormData>({
    resolver: zodResolver(academicInfoSchema),
    mode: "onTouched",
    defaultValues: {
      affiliationUniversity: "",
      department: "",
      positionTitle: "",
      orcid: "",
      bio: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else {
      setIsFetchingData(false);
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setIsFetchingData(true);
    try {
      console.log("Fetching user profile for userId:", userId);
      const response = await apiService.get(`/user/profile`, {
        params: { userId },
      });

      console.log("Profile data received:", response);
      const data = response.data?.response || response;

      // Only prefill fields that exist in this form
      if (data.affiliationUniversity) setValue("affiliationUniversity", data.affiliationUniversity);
      if (data.department) setValue("department", data.department);
      if (data.positionTitle) setValue("positionTitle", data.positionTitle);
      if (data.orcid) setValue("orcid", data.orcid);
      if (data.bio) setValue("bio", data.bio);
      if (data.resume) setCvFileName(data.resume);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      // Don't show alert if user doesn't exist yet (might be new user)
      if (error?.response?.status !== 404) {
        console.error("Failed to fetch profile:", error?.response?.data?.message);
      }
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        e.target.value = "";
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and Word documents are allowed");
        e.target.value = "";
        return;
      }

      setCvFileName(file.name);
      setValue("resume", file);
    }
  };

  const onSubmit = async (data: AcademicInfoFormData) => {
    console.log("Form submitted with data:", data);

    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload with only the fields from this form
      const payload: any = {
        userId: userId,
        affiliationUniversity: data.affiliationUniversity,
        department: data.department,
        positionTitle: data.positionTitle || "",
        orcid: data.orcid || "",
        bio: data.bio || "",
      };

      // If resume file exists, convert to base64 or upload separately
      if (data.resume && data.resume instanceof File) {
        // For now, just send the filename
        // You may need to implement file upload endpoint separately
        payload.resume = data.resume.name;

        // TODO: Implement file upload if your API supports it
        // const formData = new FormData();
        // formData.append('resume', data.resume);
        // await apiService.post('/user/upload-resume', formData);
      }

      console.log("Updating user profile with payload:", payload);
      await apiService.put("/user/update", payload);

      toast.success("Academic information updated successfully!");
      // Optionally navigate or refresh data
      fetchUserProfile();
    } catch (error: any) {
      console.error("Error updating academic info:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to update academic information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="bg-white py-8 max-w-6xl">
      {isFetchingData ? (
        <div className="text-center py-8 text-gray-600">Loading profile data...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Affiliation/University */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Affiliation/University <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...register("affiliationUniversity")}
                  className={`w-full bg-[#FAFAFA] border rounded px-3 py-2 text-gray-700 focus:outline-none ${errors.affiliationUniversity
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-gray-400"
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
                <label className="block text-gray-700 font-semibold mb-2">
                  Department <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...register("department")}
                  className={`w-full bg-[#FAFAFA] border rounded px-3 py-2 text-gray-700 focus:outline-none ${errors.department
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-gray-400"
                    }`}
                />
                {errors.department && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Position Title */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Position Title
                </label>
                <input
                  type="text"
                  {...register("positionTitle")}
                  className="w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* ORCiD */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ORCiD
                </label>
                <input
                  type="text"
                  {...register("orcid")}
                  className="w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* CV/Résumé */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  CV/Résumé
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  PDF or Word (max size 2MB)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="cvFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cvFile"
                    className="cursor-pointer bg-[#EEEEEE] border border-gray-400 rounded px-4 py-1 text-md text-gray-700 hover:bg-gray-50 inline-block"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">{cvFileName}</span>
                </div>
              </div>

              {/* Short Bio Summary */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Short Bio Summary
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Will show in{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Peer Directory
                  </a>
                </p>
                <textarea
                  {...register("bio")}
                  rows={6}
                  className="w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className=" !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border  border-x-0 border-b-4  text-white font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || isLoading}
              className="!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AcademicInfo;