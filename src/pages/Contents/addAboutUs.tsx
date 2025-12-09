import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as z from "zod";
import { apiService } from "../../services";
import { TipTapEditor } from "../Journals/createJournals";

// ✅ Validation schema
const schema = z.object({
  overviewDescription: z.string().min(1, "Description is required"),
});

type FormData = z.infer<typeof schema>;

export default function AboutUsForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read journalId from URL
  const params = new URLSearchParams(location.search);
  const id = params.get("journalId");
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      overviewDescription: "",
    },
  });

  // ✅ Fetch data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await apiService.get("/topic/sub/list", {
            params: { subTopicId: id },
          });

          if (response?.data?.list[0]) {
            const data = response.data.list[0];
            setValue("overviewDescription", data.overviewDescription || "");
          }
        } catch (error: any) {
          toast.error(error.response?.message || "Failed to load data");
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
        overviewDescription: data.overviewDescription,
      };

      if (isEditMode) {
        await apiService.put(`/topic/sub/`, {
          subTopicId: id,
          ...payload,
        });
        toast.success("Updated successfully!");
      } else {
        await apiService.post("/topic/sub", payload);
        toast.success("Created successfully!");
      }
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.response?.data?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          {isEditMode ? "Edit About Us" : "Create About Us"}
        </h2>

        {/* ✅ Editor field */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <Controller
            name="overviewDescription"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.overviewDescription?.message}
                disabled={loading}
              />
            )}
          />
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