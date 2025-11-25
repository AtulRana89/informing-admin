import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { apiService } from "../../services";


// Define the validation schema
const personalInfoSchema = z.object({
  personalTitle: z.string().optional(),
  personalName: z.string().min(1, "Personal name is required").min(2, "Personal name must be at least 2 characters"),
  middleInitial: z.string().optional(),
  familyName: z.string().min(1, "Family name is required").min(2, "Family name must be at least 2 characters"),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

const PersonalInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onTouched",
    defaultValues: {
      personalTitle: "",
      personalName: "",
      middleInitial: "",
      familyName: "",
      gender: "",
      address: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "India",
      primaryPhone: "",
      secondaryPhone: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsFetching(true);
      setApiError("");

      const responseobject = await apiService.get("/user/profile", {
        params: { userId },
      });
      const response = responseobject.data.response;
      // Populate form with existing data - only fields present in this form
      if (response) {
        setValue("personalTitle", response.personalTitle || "");
        setValue("personalName", response.personalName || "");
        setValue("middleInitial", response.middleInitial || "");
        setValue("familyName", response.familyName || "");
        setValue("gender", response.gender || "");
        setValue("address", response.address || "");
        setValue("city", response.city || "");
        setValue("stateProvince", response.stateProvince || "");
        setValue("postalCode", response.postalCode || "");
        setValue("country", response.country || "India");
        setValue("primaryPhone", response.primaryTelephone || "");
        setValue("secondaryPhone", response.secondaryTelephone || "");

        // Set photo preview if exists
        if (response.profilePic) {
          setPhotoPreview(response.profilePic);
        }
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setApiError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PersonalInfoFormData) => {
    if (!userId) {
      setApiError("User ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setApiError("");

      // First, upload photo if there's a new one
      let profilePicUrl = photoPreview;
      if (photoFile) {
        try {
          const uploadResponse = await apiService.uploadFile("/upload/profile-pic", photoFile);
          profilePicUrl = uploadResponse.url || uploadResponse.path;
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          // Continue with form submission even if photo upload fails
        }
      }

      // Prepare update payload - only include fields from this form
      const updatePayload = {
        userId: userId,
        personalTitle: data.personalTitle,
        personalName: data.personalName,
        middleInitial: data.middleInitial || "",
        familyName: data.familyName,
        gender: data.gender || "",
        profilePic: profilePicUrl || "",
        primaryTelephone: data.primaryPhone || "",
        secondaryTelephone: data.secondaryPhone || "",
        address: data.address || "",
        city: data.city,
        stateProvince: data.stateProvince || "",
        postalCode: data.postalCode || "",
        country: data.country,
      };
      await apiService.put("/user/update", updatePayload);

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setApiError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setPhotoFile(null);
    setPhotoPreview("");
    if (userId) {
      fetchUserProfile();
    }
  };

  // Show loading state while fetching data
  if (isFetching) {
    return (
      <div className="bg-white py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4282c8]"></div>
          <p className="ml-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 max-w-6xl">
      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Title */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Personal Title
              </label>
              <select
                {...register("personalTitle")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >

                <option value=""></option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
              </select>
            </div>

            {/* Personal Name and Middle Initial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Personal Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...register("personalName")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border ${errors.personalName ? "border-red-500" : "border-gray-300"
                    } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
                {errors.personalName && (
                  <p className="text-red-600 text-sm mt-1">{errors.personalName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Middle Initial
                </label>
                <input
                  type="text"
                  {...register("middleInitial")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            </div>

            {/* Family Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Family Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("familyName")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border ${errors.familyName ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
              {errors.familyName && (
                <p className="text-red-600 text-sm mt-1">{errors.familyName.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Gender
              </label>
              <select
                {...register("gender")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Photo */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Photo
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Recommended size: 100 x 100px
              </p>
              <div className="flex flex-col items-start gap-4">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                  <div>
                    <label
                      htmlFor="photo"
                      className={`bg-[#FAFAFA] cursor-pointer bg-white border border-gray-400 rounded px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 inline-block ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-600 mt-2 ml-[0.5vw]">
                      {photoFile ? photoFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Address
              </label>
              <textarea
                {...register("address")}
                disabled={isLoading}
                rows={3}
                className={`bg-[#FAFAFA] resize w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("city")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border ${errors.city ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* State/Province and Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  {...register("stateProvince")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  {...register("postalCode")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Country <span className="text-red-600">*</span>
              </label>
              <select
                {...register("country")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border ${errors.country ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
              </select>
              {errors.country && (
                <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>

            {/* Primary and Secondary Telephone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Primary Telephone Number
                </label>
                <input
                  type="number"
                  {...register("primaryPhone")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Secondary Telephone Number
                </label>
                <input
                  type="number"
                  {...register("secondaryPhone")}
                  disabled={isLoading}
                  className={`w-full bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={` !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border  border-x-0 border-b-4  text-white font-medium px-8 py-2.5 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className={`!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;