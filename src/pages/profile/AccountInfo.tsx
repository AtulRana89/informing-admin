import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from 'react';
import { Controller, useForm } from "react-hook-form";

import toast from "react-hot-toast";
import * as z from "zod";
import MultiSelectCheckbox from "../../components/multi-select";
import { apiService } from '../../services';

const typeOptions = [
  { value: "admin", label: "Admin" },
  { value: "eic", label: "Eic" },
  { value: "user", label: "User" },
];

// Define the validation schema - ONLY fields present in this form
const accountInfoSchema = z.object({
  // Email section
  email: z.string().min(1, "Primary email is required").email("Invalid email address"),
  receivePrimaryEmail: z.boolean().optional(),
  receiveReminderEmail: z.boolean().optional(),
  receiveSecondaryEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  // receiveSecondary: z.boolean().optional(),

  // Admin Settings - Left Column
  // username: z.string().optional().or(z.literal("")),
  // role: z.string().min(1, "Role is required"),
  role: z
    .array(z.string().min(1))
    .min(1, "At least one role is required"),
  status: z.string().min(1, "Status is required"),
  isPendingAuthor: z.boolean().optional(),
  isiPositions: z.array(z.enum([
    "executive_director",
    "governor",
    "fellow",
    "honorary_fellow",
    "director",
    "ambassador",
    "second_act",
    "gackowski_award_winner",
    "isi_founder",
    "governor_emeritus",
    "alumni",
    "landing_page",
    "in_watchList",
    "presented_paper",
    "best_paper",
  ])).optional(),
  ofTheMonth: z.object({
    type: z.enum(["reviewer", "editor"]).optional().or(z.literal("")),
    month: z.enum(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).optional().or(z.literal("")),
    year: z.string().optional().or(z.literal("")),
  }),
  reviewerMonth: z.string().optional().or(z.literal("")),
  reviewerYear: z.string().optional().or(z.literal("")),
  editorYear: z.string().optional().or(z.literal("")),

  // Admin Settings - Right Column
  testimonial: z.string().max(150, "Testimonial must be 150 characters or less").optional().or(z.literal("")),
  memberUntil: z.string().optional().or(z.literal("")),
  membershipType: z.string().optional().or(z.literal("")),
  isiFounder: z.boolean().optional(),
  // governorEmeritus: z.boolean().optional(),
  // alumni: z.boolean().optional(),
  // featureOnLandingPage: z.boolean().optional(),
  // inWatchList: z.boolean().optional(),
  // presentedPaperAtInSITE: z.boolean().optional(),
  // bestPaperForInSITE: z.boolean().optional(),
  // receiveReminderEmails: z.boolean().optional(),
});

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

const AccountInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    watch,
    reset,
    getValues
  } = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    mode: "onTouched",
    defaultValues: {
      email: '',
      receivePrimaryEmail: true,
      receiveReminderEmail: false,
      receiveSecondaryEmail: '',
      // username: '',
      role: [],
      status: 'active',
      isPendingAuthor: false,
      testimonial: '',
      memberUntil: '',
      membershipType: ' ',
      isiPositions: [],
      isiFounder: false,
      // governorEmeritus: false,
      // alumni: false,
      // featureOnLandingPage: false,
      // inWatchList: false,
      // presentedPaperAtInSITE: false,
      // bestPaperForInSITE: false,
      // receiveReminderEmails: false,
      reviewerMonth: '',
      reviewerYear: '',
      editorYear: ''
    },
  });

  // const isiPositions = watch('isiPositions');

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
        setValue("email", response.email || "");
        setValue("receivePrimaryEmail", response.receivePrimaryEmail ?? true);
        setValue("receiveReminderEmail", response.receiveReminderEmail ?? true);

        setValue("receiveSecondaryEmail", response.receiveSecondaryEmail || "");
        // setValue("receiveSecondary", response.receiveSecondaryEmail ?? false);
        // setValue("username", response.username || "");
        // setValue("role", response.role || "admin");
        setValue("role", Array.isArray(response.role) ? response.role : [response.role]);
        setValue("status", response.status || "active");
        setValue("isPendingAuthor", response.isPendingAuthor ?? false);
        setValue("testimonial", response.testimonial || "");
        setValue("memberUntil", response.memberUntil || "");
        setValue("membershipType", response.membershipTypes || "");

        // ISI Positions - parse if string, otherwise use as object
        if (response.isiPositions) {
          const positions = typeof response.isiPositions === 'string'
            ? JSON.parse(response.isiPositions)
            : response.isiPositions;
          setValue("isiPositions", positions);
        }

        // Reviewer/Editor of the Month - parse if needed
        // if (response.ofTheMonth) {
        //   const monthData = typeof response.ofTheMonth === "string"
        //     ? JSON.parse(response.ofTheMonth)
        //     : response.ofTheMonth || {};

        //   setValue("type", monthData.type || "");
        //   setValue("month", monthData.month || "");
        //   setValue("year", monthData.year || "");
        // }
        setValue("ofTheMonth.type", response?.ofTheMonth?.type ?? "");
        setValue("ofTheMonth.month", response?.ofTheMonth?.month ?? "");
        setValue("ofTheMonth.year", response?.ofTheMonth?.year ?? "");

        setValue("isiFounder", response.isiFounder ?? false);
        // setValue("governorEmeritus", response.governorEmeritus ?? false);
        // setValue("alumni", response.alumni ?? false);
        // setValue("featureOnLandingPage", response.featureOnLandingPage ?? false);
        // setValue("inWatchList", response.inWatchList ?? false);
        // setValue("presentedPaperAtInSITE", response.presentedPaperAtInSITE ?? false);
        // setValue("bestPaperForInSITE", response.bestPaperForInSITE ?? false);
        // setValue("receiveReminderEmails", response.receiveReminderEmails ?? false);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setApiError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: AccountInfoFormData) => {
    console.log("Form submitted with data:", data);

    if (!userId) {
      setApiError("User ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setApiError("");

      // Prepare ofTheMonth data

      // Prepare update payload - only include fields from this form
      const updatePayload = {
        userId: userId,
        role: data.role,
        status: data.status,
        email: data.email,
        receivePrimaryEmail: data.receivePrimaryEmail,
        receiveReminderEmail: data.receiveReminderEmail,
        receiveSecondaryEmail: data.receiveSecondaryEmail || "",
        // username: data.username || "",
        isPendingAuthor: data.isPendingAuthor,
        testimonial: data.testimonial || "",
        memberUntil: data.memberUntil || "",
        membershipTypes: data.membershipType || "",
        isiPositions: data.isiPositions,
        isReviewerEditorOfMonth: !!(data.reviewerMonth || data.reviewerYear || data.editorYear),
        ofTheMonth: {
          type: data.ofTheMonth.type || "",
          month: data.ofTheMonth.month || "",
          year: data.ofTheMonth.year || ""
        },
        isiFounder: data.isiFounder,
        // governorEmeritus: data.governorEmeritus,
        // alumni: data.alumni,
        // featureOnLandingPage: data.featureOnLandingPage,
        // inWatchList: data.inWatchList,
        // presentedPaperAtInSITE: data.presentedPaperAtInSITE,
        // bestPaperForInSITE: data.bestPaperForInSITE,
        // receiveReminderEmails: data.receiveReminderEmails,
      };

      console.log("Updating account with payload:", updatePayload);
      await apiService.put("/user/update", updatePayload);

      toast.success("Account information updated successfully!");
    } catch (err: any) {
      console.error("Error updating account info:", err);
      setApiError(err.response?.data?.message || "Failed to update account information");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    setApiError("Please fix the validation errors before submitting");
  };

  const handleCancel = () => {
    reset();
    if (userId) {
      fetchUserProfile();
    }
  };

  const handleCheckboxChange = (position: NonNullable<AccountInfoFormData["isiPositions"]>[number], checked: boolean) => {
    const currentPositions = getValues("isiPositions") || [];
    const updated = checked
      ? [...currentPositions, position]
      : currentPositions.filter((p) => p !== position);
    setValue("isiPositions", updated as AccountInfoFormData["isiPositions"]);
  };

  const handleType = (newSelected: string[]) => {
    console.log("Selected roles:", newSelected);
    setValue("role", newSelected);
  };

  // Show loading state while fetching data
  if (isFetching) {
    return (
      <div className="max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4282c8]"></div>
          <p className="ml-4 text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* White Background Section */}
        <div className="bg-white py-8 mb-0">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Primary Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Primary Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                disabled={isLoading}
                className={`w-full border bg-[#FAFAFA] ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Receive emails checkbox */}
            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                {...register("receivePrimaryEmail")}
                id="receivePrimaryEmail"
                disabled={isLoading}
                className="w-4 h-4 bg-[#FAFAFA] text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="receivePrimaryEmail" className="ml-2 text-gray-700">
                Receive emails at this address
              </label>
            </div>

            {/* Secondary Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Secondary Email
              </label>
              <p className="text-sm text-gray-600 mb-2">
                If you are having trouble receiving emails on your primary address, please enter a secondary one
              </p>
              <input
                type="email"
                {...register("receiveSecondaryEmail")}
                disabled={isLoading}
                className={`w-full bg-[#FAFAFA] border ${errors.receiveSecondaryEmail ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              />
              {errors.receiveSecondaryEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.receiveSecondaryEmail.message}</p>
              )}
            </div>

            {/* Receive emails checkbox for secondary */}
            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                {...register("receiveReminderEmail")}
                id="receiveReminderEmail"
                disabled={isLoading}
                className="w-4 h-4 bg-[#FAFAFA] text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="receiveReminderEmail" className="ml-2 text-gray-700">
                Receive emails at this address
              </label>
            </div>

            {/* Empty cell for grid alignment */}
            <div></div>
          </div>
        </div>

        {/* Gray Background Section */}
        <div className="bg-gray-100 p-8">
          <h2 className="text-2xl text-gray-700 mb-6">Admin Settings</h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Username */}
              {/* <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Username
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Enter a username to create custom log in credentials
                </p>
                <input
                  type="text"
                  {...register("username")}
                  disabled={isLoading}
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div> */}

              {/* Role */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Role <span className="text-red-600">*</span>
                </label>
                {/* <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectCheckbox
                      options={typeOptions}
                      value={field.value ?? []}
                      onChange={handleType}
                      placeholder="All Types"
                      disabled={false}
                      isLoading={isLoading}
                    />
                  )}
                /> */}
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectCheckbox
                      options={typeOptions}
                      value={field.value ?? []}
                      onChange={(selected) => field.onChange(selected)}
                      placeholder="Select roles"
                    />
                  )}
                />
                {/* <select
                  {...register("role")}
                  disabled={isLoading}
                  className={`w-full border ${errors.role ? "border-red-500" : "border-gray-300"
                    } rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Author">Author</option>
                </select> */}
                {errors.role && (
                  <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  {...register("status")}
                  disabled={isLoading}
                  className={`w-full border ${errors.status ? "border-red-500" : "border-gray-300"
                    } rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {errors.status && (
                  <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Is Pending Author */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("isPendingAuthor")}
                  id="isPendingAuthor"
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPendingAuthor" className="ml-2 text-gray-700">
                  Is Pending Author
                </label>
              </div>

              {/* ISI Position */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  ISI Position
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'executive_director', label: 'Executive Director' },
                    { key: 'governor', label: 'Governor' },
                    { key: 'fellow', label: 'Fellow' },
                    { key: 'honorary_fellow', label: 'Honorary Fellow' },
                    { key: 'director', label: 'Director' },
                    { key: 'ambassador', label: 'Ambassador' },
                    { key: 'second_act', label: 'Second Act' },
                    { key: 'gackowski_award_winner', label: 'Gackowski Award Winner' }
                  ].map(({ key, label }: any) => (
                    <div key={key} className="flex items-center">
                      <input type="checkbox" id={key} disabled={isLoading} checked={watch("isiPositions")?.includes(key) || false} onChange={(e) => handleCheckboxChange(key, e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                      <label htmlFor={key} className="ml-2 text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviewer/Editor of the Month */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Reviewer/Editor of the Month
                </label>
                <div className="flex gap-3">
                  {/* Type: Reviewer or Editor */}
                  <select
                    {...register("ofTheMonth.type")}
                    disabled={isLoading}
                    className={`flex-1 border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Type</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                  </select>

                  {/* Month */}
                  <select
                    {...register("ofTheMonth.month")}
                    disabled={isLoading}
                    className={`flex-1 border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Month</option>
                    <option value="Jan">January</option>
                    <option value="Feb">February</option>
                    <option value="Mar">March</option>
                    <option value="Apr">April</option>
                    <option value="May">May</option>
                    <option value="Jun">June</option>
                    <option value="Jul">July</option>
                    <option value="Aug">August</option>
                    <option value="Sep">September</option>
                    <option value="Oct">October</option>
                    <option value="Nov">November</option>
                    <option value="Dec">December</option>
                  </select>

                  {/* Year */}
                  <select
                    {...register("ofTheMonth.year")}
                    disabled={isLoading}
                    className={`flex-1 border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Year</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Testimonial */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Testimonial
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Enter a short text (150 characters max)
                </p>
                <textarea
                  {...register("testimonial")}
                  disabled={isLoading}
                  rows={5}
                  maxLength={150}
                  className={`w-full border ${errors.testimonial ? "border-red-500" : "border-gray-300"
                    } rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 resize-none ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
                {errors.testimonial && (
                  <p className="text-red-600 text-sm mt-1">{errors.testimonial.message}</p>
                )}
              </div>

              {/* Member Until and Membership Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Member Until
                  </label>
                  <input
                    type="text"
                    {...register("memberUntil")}
                    disabled={isLoading}
                    className={`w-full border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Membership Type
                  </label>
                  <select
                    {...register("membershipType")}
                    disabled={isLoading}
                    className={`w-full border border-gray-300 rounded px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="isi_member">ISI Member</option>
                    <option value="isi_sponsored_member">ISI Sponsoring Member</option>
                  </select>
                </div>
              </div>
              {/* Additional Checkboxes */}
              <div className="space-y-2">
                {[
                  { key: 'isi_founder' as const, label: 'ISI Founder' },
                  { key: 'governor_emeritus' as const, label: 'Governor Emeritus' },
                  { key: 'alumni' as const, label: 'Alumni' },
                  { key: 'landing_page' as const, label: 'Feature on landing page' },
                  { key: 'in_watchList' as const, label: 'In WatchList' },
                  { key: 'presented_paper' as const, label: 'Presented paper at InSITE' },
                  { key: 'best_paper' as const, label: 'Best paper for InSITE' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center">
                    {/* <input
                      type="checkbox"
                      // checked={isiPositions?.includes(key)}
                      // onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                      checked={watch("isiPositions")?.includes(key) || false}
                      onChange={(e) => {
                        const current = watch("isiPositions") || [];
                        if (e.target.checked) {
                          setValue("isiPositions", [...current, key]);
                        } else {
                          setValue("isiPositions", current.filter((p) => p !== key));
                        }
                      }}
                      id={key}
                      disabled={isLoading}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    /> */}
                    <input type="checkbox" id={key} disabled={isLoading} checked={watch("isiPositions")?.includes(key) || false} onChange={(e) => handleCheckboxChange(key, e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <label htmlFor={key} className="ml-2 text-gray-700">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={` !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border  border-x-0 border-b-4  text-white font-medium px-8 py-2.5 transition ${isLoading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isLoading || isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className={`!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition ${isLoading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountInfo;