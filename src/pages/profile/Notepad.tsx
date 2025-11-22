
import { zodResolver } from "@hookform/resolvers/zod";
//import { X } from "lucide-react";
import  { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiService } from "../../services";
import toast from "react-hot-toast";



const notepadSchema = z.object({
  note: z.string().min(1, { message: "Note cannot be empty" }),
});

type NotepadFormData = z.infer<typeof notepadSchema>;

const Notepad = () => {
  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotepadFormData>({
    resolver: zodResolver(notepadSchema),
    defaultValues: {
      note: "",
    },
  });

  useEffect(() => {
    if (userId) {
      fetchUserNote();
    }
  }, [userId]);

  const fetchUserNote = async () => {
    try {
      const response = await apiService.get("/user/profile", { params: { userId } });
      const data = response.data?.response || response;
      setValue("note", data.note || "");
    } catch (err) {
      console.error("Error fetching note:", err);
    }
  };
  const onSubmit = async (data: NotepadFormData) => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    setIsLoading(true);
    try {
      let payload = {
        userId,
        note: data.note,
      }
      await apiService.put("/user/update", payload);
      toast.success("Note saved successfully!");
      //setShowNotepad(false);
    } catch (err: any) {
      console.error("Error saving note:", err);
      toast.error(err?.response?.data?.message || "Failed to save note.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    //setShowNotepad(false);
  };

  return (
    <div className="w-full mx-auto bg-white  ">
      {/* Header */}
      <div className="flex items-center justify-between p-4 ">
        {/* <h2 className="text-2xl text-gray-700 font-normal">Notepad</h2> */}
        {/* <button
          className="text-gray-500 hover:text-gray-700 !border-none"
          onClick={() => setShowNotepad(false)}
        >
          <X className="w-5 h-5" />
        </button> */}
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full p-6 flex flex-col  justify-center">
        <div className=" p-6 w-[40vw]">

          Add Note
          <textarea
            className="w-full bg-[#FAFAFA] h-32 p-3 border border-gray-300 rounded focus:!outline-none focus:!ring-0 focus:!border-gray-400 "
            placeholder="Write something..."
            {...register("note")}
          ></textarea>
          {errors.note && (
            <p className="text-red-500 text-sm mt-1">{errors.note.message}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mt-6">

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              // onClick={handleSave}
              className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border   border-x-0 border-b-4 text-white font-medium px-8 py-2.5  transition"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5  transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Notepad;
