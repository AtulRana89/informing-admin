import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as z from "zod";
import { apiService } from "../../services";

// ✅ Validation schema
const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  minSelections: z
    .string()
    .min(1, "Min Selection is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Min Selection must be a valid number",
    }),
  maxSelections: z
    .string()
    .min(1, "Max Selection is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Max Selection must be a valid positive number",
    }),
}).refine((data) => Number(data.maxSelections) >= Number(data.minSelections), {
  message: "Max Selection must be greater than or equal to Min Selection",
  path: ["max"],
});

type FormData = z.infer<typeof schema>;

export default function TopicForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read journalId from URL
  const params = new URLSearchParams(location.search);
  const id = params.get("journalId");
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: "",
      minSelections: "",
      maxSelections: ""
    },
  });

  // ✅ Fetch data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await apiService.get("/topic/list", {
            params: { topicId: id },
          });

          if (response?.data?.list[0]) {
            const topicData = response.data.list[0];
            setValue("name", topicData.name || "");
            setValue("minSelections", topicData.minSelections?.toString() || "");
            setValue("maxSelections", topicData.maxSelections?.toString() || "");
          }
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to load topic"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEditMode, setValue]);

  // ✅ Submit handler (Create or Update)
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const payload = {
        name: data.name,
        
         minSelections: data.minSelections,
        maxSelections: data.maxSelections,
      };

      if (isEditMode) {
        await apiService.put(`/topic/`, {
          topicId: id,
          ...payload,
        });
        toast.success("Updated successfully!");
      } else {
        await apiService.post("/topic", payload);
        toast.success("Created successfully!");
      }
      navigate(-1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          {isEditMode ? "Edit Topic" : "Create New Topic"}
        </h2>

        {/* ✅ Name field only */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            {...register("name")}
            disabled={loading}
            className={`w-full !bg-[#FAFAFA] px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded focus:outline-none focus:ring-1 ${
              errors.name ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}

          <div className="w-full justify-between flex mt-2">
            <div className="w-[48%]">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Min Selection <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("minSelections")}
                disabled={loading}
                className={`w-full px-3 py-2 border !bg-[#FAFAFA] ${
                  errors.minSelections ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-1 ${
                  errors.minSelections ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Enter min"
              />
              {errors.minSelections && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.minSelections.message}
                </p>
              )}
            </div>
            <div className="w-[48%]">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max Selection <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("maxSelections")}
                disabled={loading}
                className={`w-full px-3 py-2 border !bg-[#FAFAFA] ${
                  errors.maxSelections ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-1 ${
                  errors.maxSelections ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                placeholder="Enter max"
              />
              {errors.maxSelections && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.maxSelections.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Buttons */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85] !rounded-none cursor-pointer border !border-x-0 !border-b-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update"
              : "Save"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="!bg-gray-200 !rounded-none cursor-pointer !border-gray-300 !border-x-0 !border-b-4 hover:!bg-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}