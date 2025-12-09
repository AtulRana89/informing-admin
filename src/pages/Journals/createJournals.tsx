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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { apiService } from "../../services";

// Import TipTap
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import toast from "react-hot-toast";
// Define the validation schema
const newJournalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  acronym: z
    .string()
    .min(1, "Acronym is required")
    .min(2, "Acronym must be at least 2 characters"),
  overviewDescription: z
    .string()
    .min(1, "Overview description is required")
    .min(10, "Overview description must be at least 10 characters"),
  legacyExternalUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  callForPapersMessage: z.string().optional(),
  onlineIssn: z.string().optional(),
  printIssn: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  minimumTopicsPerArticle: z.string().optional(),
  defaultEditorDueDate: z.string().optional(),
  defaultReviewerDueDate: z.string().optional(),
  defaultTotalReviewers: z.string().optional(),
  isAllow: z.boolean().optional(),
});

type JournalFormData = z.infer<typeof newJournalSchema>;

// TipTap Rich Text Editor Component
export const TipTapEditor = ({
  value,
  onChange,
  error,
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      UnderlineExtension,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
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

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>;
  }

  const MenuButton = ({
    onClick,
    isActive,
    disabled: btnDisabled,
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
      disabled={btnDisabled || disabled}
      title={title}
      className={`px-2 py-1 hover:bg-gray-200  border border-gray-300 text-gray-600 !bg-white transition-colors
        ${isActive ? '!bg-gray-300' : ''}
        ${(btnDisabled || disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className={`border ${error ? "border-red-500" : "border-gray-300"}`}>
        {/* Toolbar */}
        <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={disabled}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={disabled}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          {/* Heading Dropdown */}
          <select
            className={`px-2 py-1 border border-gray-300 bg-white text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            disabled={disabled}
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
            disabled={disabled}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          {/* Blockquote */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
            title="Blockquote"
          >
            <span className="text-sm font-bold">"</span>
          </MenuButton>

          {/* Code Block */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            disabled={disabled}
            title="Code Block"
          >
            <span className="text-xs font-mono">{'{ }'}</span>
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* History */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || disabled}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || disabled}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>

          {/* Horizontal Rule */}
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            title="Horizontal Rule"
          >
            <span className="text-xs">―</span>
          </MenuButton>

          {/* Clear Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            disabled={disabled}
            title="Clear Formatting"
          >
            <span className="text-xs">Clear</span>
          </MenuButton>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className={`min-h-[16rem] text-black bg-white ${disabled ? 'opacity-0' : ''}`}
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function JournalForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const params = new URLSearchParams(location.search);
  const id = params.get("journalId");
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<JournalFormData>({
    resolver: zodResolver(newJournalSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      acronym: "",
      overviewDescription: "",
      legacyExternalUrl: "",
      callForPapersMessage: "",
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

  // Fetch journal data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchJournalData();
    }
  }, [id]);

  const fetchJournalData = async () => {
    try {
      setIsFetching(true);
      setApiError("");

      const response = await apiService.get("/journal/list", {
        params: { journalId: id },
      });

      // Assuming the API returns data array with one item
      const journalData = response?.data?.list[0];

      if (journalData) {
        // Populate form with existing data
        setValue("title", journalData.title || "");
        setValue("acronym", journalData.acronym || "");
        setValue("overviewDescription", journalData.overviewDescription || "");
        setValue("legacyExternalUrl", journalData.legacyExternalUrl || "");
        setValue("callForPapersMessage", journalData.callForPapersMessage || "");
        setValue("onlineIssn", journalData.onlineIssn || "");
        setValue("printIssn", journalData.printIssn || "");
        setValue("status", journalData.status || "draft");
        setValue("minimumTopicsPerArticle", journalData.minimumTopicsPerArticle || "");
        setValue("defaultEditorDueDate", journalData.defaultEditorDueDate || "");
        setValue("defaultReviewerDueDate", journalData.defaultReviewerDueDate || "");
        setValue("defaultTotalReviewers", journalData.defaultTotalReviewers || "");
        setValue("isAllow", journalData.isAllow || false);
      }
    } catch (err: any) {
      console.error("Error fetching journal:", err);
      setApiError(err.response?.data?.message || "Failed to load journal data");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: JournalFormData) => {
    try {
      setIsLoading(true);
      setApiError("");

      if (isEditMode) {
        // Update existing journal
        await apiService.put("/journal/", {
          journalId: id,
          ...data,
        });
        toast.success("Journal updated successfully!");
      } else {
        // Create new journal
        await apiService.post("/journal/", data);
        toast.success("Journal created successfully!");
      }

      // Navigate back to journals list
      navigate("/journals");
    } catch (err: any) {
      console.error("Error saving journal:", err);
      setApiError(
        err?.response?.data?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} journal`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/journals");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  // Show loading state while fetching data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4282c8]"></div>
            <p className="ml-4 text-gray-600">Loading journal data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-3xl font-light text-gray-700 mb-8">
          {isEditMode ? "Edit Journal" : "New Journal"}
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              disabled={isLoading}
              className={`w-full px-3 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"
                } !bg-[#FAFAFA] focus:outline-none focus:ring-1 ${errors.title ? "focus:ring-red-500" : "focus:ring-blue-500"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">
                {errors.title.message}
              </p>
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
              disabled={isLoading}
              className={`w-full px-3 py-2 border ${errors.acronym ? "border-red-500" : "border-gray-300"
                } !bg-[#FAFAFA] focus:outline-none focus:ring-1 ${errors.acronym ? "focus:ring-red-500" : "focus:ring-blue-500"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors.acronym && (
              <p className="text-red-600 text-sm mt-1">
                {errors.acronym.message}
              </p>
            )}
          </div>

          {/* Overview Description with TipTap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overview Description <span className="text-red-600">*</span>
            </label>
            <Controller
              name="overviewDescription"
              control={control}
              render={({ field }) => (
                <TipTapEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.overviewDescription?.message}
                  disabled={isLoading}
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
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            />
            {errors.legacyExternalUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.legacyExternalUrl.message}</p>
            )}
          </div>

          {/* Call for Papers Message with TipTap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call for Papers Message
            </label>
            <Controller
              name="callForPapersMessage"
              control={control}
              render={({ field }) => (
                <TipTapEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          {/* Online ISSN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Online ISSN
            </label>
            <input
              type="text"
              {...register("onlineIssn")}
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 !bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-600">*</span>
            </label>
            <select
              {...register("status")}
              disabled={isLoading}
              className={`w-full px-3 py-2 border ${errors.status ? "border-red-500" : "border-gray-300"
                } !bg-[#FAFAFA] focus:outline-none focus:ring-1 ${errors.status ? "focus:ring-red-500" : "focus:ring-blue-500"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("isAllow")}
                  disabled={isLoading}
                  className={`mr-2 ${isLoading ? "cursor-not-allowed" : ""}`}
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
              disabled={isLoading}
              className={`!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  !rounded-none cursor-pointer border !border-x-0 !border-b-4  text-white font-medium px-8 py-2.5 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className={`!bg-gray-200 !rounded-none cursor-pointer !border-gray-300 !border-x-0 !border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}