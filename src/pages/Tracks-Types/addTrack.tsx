import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Strikethrough,
  Code,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { apiService } from "../../services";

// ✅ Validation schema
const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
});

type FormData = z.infer<typeof schema>;

// ✅ TipTap Editor Component
const TipTapEditor = ({ value, onChange, error }: any) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "tiptap prose max-w-none focus:outline-none min-h-[12rem] p-3 border border-gray-300",
      },
    },
  });

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 hover:bg-gray-200 border border-gray-300 !bg-white transition-colors ${
        isActive ? "!bg-gray-300" : ""
      }`}
    >
      {children}
    </button>
  );

  if (!editor)
    return <div className="p-4 text-gray-500">Loading editor...</div>;

  return (
    <div>
      <div className={`border ${error ? "border-red-500" : "border-gray-300"}`}>
        {/* Toolbar */}
        <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
            className="!bg-red-500"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} className={`min-h-[16rem text-black bg-white `}  />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ✅ Main Form Component
export default function TrackForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Check if `journalId` exists in query params
  const params = new URLSearchParams(location.search);
  const id = params.get("trackId");
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // ✅ Fetch data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          setLoading(true);
          // const response = await apiService.get(`/topic/track/${id}`);
          const response = await apiService.get("/topic/track/list", {
            params: { trackId: id },
          });
          if (response?.data) {
            setValue("name", response.data?.list?.[0].name || "");
            setValue("description", response.data.description || "");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to load data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEditMode, setValue]);

  // ✅ Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (isEditMode) {
        await apiService.put(`/topic/track/`, {
          trackId: id,
          ...data,
        });
        toast.success("Updated successfully!");
      } else {
        await apiService.post("/topic/track", data);
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
          {isEditMode ? "Edit Track" : "Create New Track"}
        </h2>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            {...register("name")}
            disabled={loading}
            className={`w-full px-3 py-2 border !bg-[#FAFAFA] ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded focus:outline-none focus:ring-1 ${
              errors.name ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.description?.message}
              />
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  !rounded-none cursor-pointer border !border-x-0 !border-b-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
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
            className=" !bg-gray-200 !rounded-none cursor-pointer !border-gray-300 !border-x-0 !border-b-4 hover:!bg-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// const handleCancel = () => {
//     console.log("Form cancelled");
//     navigate(-1); // Go back to previous page
//   };
