import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiService } from "../../services";

// Note: You need to install these packages:
// npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline

// Import TipTap
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import toast from "react-hot-toast";

// Zod Schema
const conferenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  acronym: z.string().min(1, "Acronym is required"),
  message: z.string().min(1, "Invitation message is required"),
  legacyExternalUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  onlineIssn: z.string().optional().or(z.literal("")),
  printIssn: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
  minimumTopicsPerArticle: z.string().optional().or(z.literal("")),
  defaultEditorDueDate: z.string().optional().or(z.literal("")),
  defaultReviewerDueDate: z.string().optional().or(z.literal("")),
  defaultTotalReviewers: z.string().optional().or(z.literal("")),
  isAllow: z.boolean().optional().or(z.string().optional()),
});

type ConferenceFormData = z.infer<typeof conferenceSchema>;

// TipTap Rich Text Editor Component
const TipTapEditor = ({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      UnderlineExtension,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[16rem] p-3',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>;
  }

  const MenuButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 hover:bg-gray-200 border border-gray-300 bg-white transition-colors
        ${isActive ? '!bg-gray-300' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="border border-gray-300">
        {/* Toolbar */}
        <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          {/* Heading Dropdown */}
          <select
            className="px-2 py-1 border border-gray-300 bg-white text-sm cursor-pointer"
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
                editor.isActive('heading', { level: 2 }) ? '2' :
                  editor.isActive('heading', { level: 3 }) ? '3' :
                    editor.isActive('heading', { level: 4 }) ? '4' :
                      editor.isActive('heading', { level: 5 }) ? '5' :
                        editor.isActive('heading', { level: 6 }) ? '6' : '0'
            }
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
              }
            }}
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          {/* Blockquote */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <span className="text-sm font-bold">"</span>
          </MenuButton>

          {/* Code Block */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <span className="text-xs font-mono">{'{ }'}</span>
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* History */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>

          {/* Horizontal Rule */}
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <span className="text-xs">―</span>
          </MenuButton>

          {/* Clear Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <span className="text-xs">Clear</span>
          </MenuButton>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} className="min-h-[16rem] text-black bg-white" />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function ConferenceForm() {
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const id = params.get("conferenceId");
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ConferenceFormData>({
    resolver: zodResolver(conferenceSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      acronym: "",
      message: "",
      legacyExternalUrl: "",
      onlineIssn: "",
      printIssn: "",
      status: "draft",
      minimumTopicsPerArticle: "",
      defaultEditorDueDate: "",
      defaultReviewerDueDate: "",
      defaultTotalReviewers: "",
      isAllow: false,
    },
  });

  // Fetch conference data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchConferenceData();
    }
  }, [id]);

  const fetchConferenceData = async () => {
    try {
      const response = await apiService.get(`/conference/list?conferenceId=${id}`);
      const data = response.data.list[0] || response;

      // Populate form with fetched data
      setValue("title", data.title || "");
      setValue("acronym", data.acronym || "");
      setValue("message", data.message || "");
      setValue("legacyExternalUrl", data.legacyExternalUrl || "");
      setValue("onlineIssn", data.onlineIssn || "");
      setValue("printIssn", data.printIssn || "");
      setValue("status", data.status || "draft");
      setValue("minimumTopicsPerArticle", data.minimumTopicsPerArticle || "");
      setValue("defaultEditorDueDate", data.defaultEditorDueDate || "");
      setValue("defaultReviewerDueDate", data.defaultReviewerDueDate || "");
      setValue("defaultTotalReviewers", data.defaultTotalReviewers || "");
      setValue("isAllow", data.isAllow || false);
    } catch (error) {
      console.error("Error fetching conference data:", error);
      toast.error("Failed to load conference data");
    }
  };

  const onSubmit = async (data: ConferenceFormData) => {
    console.log("Form submitted with data:", data);
    try {
      if (isEditMode) {
        console.log("Updating conference...");
        await apiService.put("/conference/", {
          conferenceId: id,
          ...data,
        });
        toast.success("Conference updated successfully!");
      } else {
        console.log("Creating conference...");
        await apiService.post("/conference/", data);
        toast.success("Conference created successfully!");
      }
      navigate("/conferences");
    } catch (error: any) {
      console.error("Error saving conference:", error);
      toast.error(
        error?.response?.data?.data?.message ||
        "Failed to save conference. Please try again."
      );
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  const handleCancel = () => {
    navigate("/conferences");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit, onError)();
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-3xl font-light text-gray-700 mb-8">
          {isEditMode ? "Edit Conference" : "New Conference"}
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Acronym */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acronym <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("acronym")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            />
            {errors.acronym && (
              <p className="text-red-600 text-sm mt-1">
                {errors.acronym.message}
              </p>
            )}
          </div>

          {/* Invitation Message with TipTap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Message <span className="text-red-600">*</span>
            </label>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <TipTapEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.message?.message}
                />
              )}
            />
          </div>

          {/* Legacy/External URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legacy/External URL
            </label>
            <input
              type="text"
              {...register("legacyExternalUrl")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            />
            {errors.legacyExternalUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.legacyExternalUrl.message}</p>
            )}
          </div>

          {/* Online ISSN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Online ISSN
            </label>
            <input
              type="text"
              {...register("onlineIssn")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            />
          </div>

          {/* Print ISSN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Print ISSN
            </label>
            <input
              type="text"
              {...register("printIssn")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-600">*</span>
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1"
            >
              <option value="draft">Draft (Keep hidden)</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Bottom Section with Gray Background */}
          <div className="bg-gray-100 p-6 border border-gray-300 mt-8">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Topics Per Article
                </label>
                <input
                  type="text"
                  {...register("minimumTopicsPerArticle")}
                  className="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Editor Due Date
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  In days after the current date
                </p>
                <input
                  type="text"
                  {...register("defaultEditorDueDate")}
                  className="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Reviewer Due Date
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  In days after the current date
                </p>
                <input
                  type="text"
                  {...register("defaultReviewerDueDate")}
                  className="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-start-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Total Reviewers
                </label>
                <input
                  type="text"
                  {...register("defaultTotalReviewers")}
                  className="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("isAllow")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Allow authors to see selected blinded article evaluations
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className=" !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  !rounded-none cursor-pointer border  !border-x-0 !border-b-4  text-white font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="!bg-gray-200 !rounded-none cursor-pointer !border-gray-300 !border-x-0 !border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}