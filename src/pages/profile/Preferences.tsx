
import { zodResolver } from "@hookform/resolvers/zod";
import  { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiService } from "../../services";
import toast from "react-hot-toast";

const preferencesSchema = z.object({
  unsubscribe: z.boolean(),
  allowProfile: z.boolean(),
  websiteUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  twitterUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  facebookUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  googleUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  linkedinUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const Preferences = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      unsubscribe: false,
      allowProfile: true,
      websiteUrl: "",
      twitterUrl: "",
      facebookUrl: "",
      googleUrl: "",
      linkedinUrl: "",
    },
  });

  useEffect(() => {
    if (userId) {
      fetchUserPreferences();
    } else {
      setIsFetchingData(false);
    }
  }, [userId]);

  const fetchUserPreferences = async () => {
    setIsFetchingData(true);
    try {
      const response = await apiService.get("/user/profile", {
        params: { userId },
      });
      const data = response.data?.response || response;

      // Prefill form
      setValue("unsubscribe", data.unsubscribe ?? false);
      setValue("allowProfile", data.allowProfile ?? true);
      setValue("websiteUrl", data.websiteUrl ?? "");
      setValue("twitterUrl", data?.socialMedia?.twitter ?? "");
      setValue("facebookUrl", data?.socialMedia?.facebook ?? "");
      setValue("googleUrl", data?.socialMedia?.googlePlus ?? "");
      setValue("linkedinUrl", data?.socialMedia?.linkedin ?? "");
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const onSubmit = async (data: PreferencesFormData) => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    const payload = {
      userId,
      unsubscribe: data.unsubscribe,
      allowProfile: data.allowProfile,
      websiteUrl: data.websiteUrl || "",
      socialMedia: {
        twitter: data.twitterUrl || "",
        facebook: data.facebookUrl || "",
        googlePlus: data.googleUrl || "",
        linkedin: data.linkedinUrl || "",
      },
    };
    setIsLoading(true);
    try {
      await apiService.put("/user/update", payload);
      toast.success("Preferences updated successfully!");
      fetchUserPreferences();
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to update preferences. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    console.log('Cancelling...');
    navigate(-1);
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };
  return (
    <div className="max-w-2xl py-8 bg-white font-sans">
      {/* Unsubscribe Checkbox */}
      {isFetchingData ? (
        <div className="text-center py-8 text-gray-600">Loading preferences...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("unsubscribe")}
                type="checkbox"
                // checked={unsubscribe}
                // onChange={(e) => setUnsubscribe(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-gray-800 font-medium">
                  Unsubscribe from ISI newsletters and notifications.
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  To stop receiving all emails change your settings in your{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Account Info
                  </a>
                </p>
              </div>
            </label>
          </div>

          {/* Allow Profile Checkbox */}
          <div className="mb-8 pb-6 border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("allowProfile")}
                type="checkbox"
                // checked={allowProfile}
                // onChange={(e) => setAllowProfile(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-gray-800 font-medium">
                  Allow basic profile information to be shown on ISI website.
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  Applies to ISI Members only. Your CV and email address will not be shown.
                </p>
              </div>
            </label>
          </div>

          {/* Website URL */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Your Website URL
            </label>
            <input
              type="text"
              {...register("websiteUrl")}
              // onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-[#FAFAFA] max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            />
            {errors.websiteUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.websiteUrl.message}</p>
            )}
          </div>

          {/* Twitter URL */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Twitter URL
            </label>
            <input
              type="text"
              {...register("twitterUrl")}
              // value={twitterUrl}
              // onChange={(e) => setTwitterUrl(e.target.value)}
              className="w-full bg-[#FAFAFA] max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            />

            {errors.twitterUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.twitterUrl.message}</p>
            )}
          </div>

          {/* Facebook URL */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Facebook URL
            </label>
            <input
              type="text"
              {...register("facebookUrl")}
              // value={facebookUrl}
              // onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full bg-[#FAFAFA] max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            />

            {errors.facebookUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.facebookUrl.message}</p>
            )}
          </div>

          {/* Google+ URL */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Google+ URL
            </label>
            <input
              type="text"
              {...register("googleUrl")}
              // value={googleUrl}
              // onChange={(e) => setGoogleUrl(e.target.value)}
              className="w-full bg-[#FAFAFA] max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            />

            {errors.googleUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.googleUrl.message}</p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              LinkedIn URL
            </label>
            <input
              type="text"
              {...register("linkedinUrl")}
              // value={linkedinUrl}
              // onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-[#FAFAFA] max-w-md px-3 py-2 border border-gray-300 rounded "
            />

            {errors.linkedinUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className=" !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border  border-x-0 border-b-4  text-white font-medium px-8 py-2.5  transition"
            >
              {isSubmitting || isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || isLoading}
              className="!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5  transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Preferences;

