import {
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { useState } from "react";

interface SubOption {
  id: string;
  label: string;
  checked: boolean;
}

interface TopicOption {
  id: string;
  label: string;
  checked: boolean;
  hasSubOptions?: boolean;
  expanded?: boolean;
  subOptions?: SubOption[];
}

interface TopicSection {
  id: string;
  title: string;
  minRequired?: number;
  expanded: boolean;
  options?: TopicOption[];
}

const Topics = () => {
  const [sections, setSections] = useState<TopicSection[]>([
    {
      id: "fields",
      title: "Fields/Specializations",
      minRequired: 2,
      expanded: false,
      options: [],
    },
    {
      id: "special",
      title:
        "Special Sign Up (select if signing up for special series or track)",
      expanded: false,
      options: [],
    },
    {
      id: "general",
      title: "General Lines of Inquiry",
      minRequired: 4,
      expanded: false,
      options: [],
    },
    {
      id: "research",
      title: "Research Topics - specific",
      minRequired: 6,
      expanded: true,
      options: [
        {
          id: "applied-psych",
          label: "Applied Psychology",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "teaching",
          label: "Teaching and Learning",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "methods",
          label: "Methods of Teaching",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "professorial",
          label: "Other Professorial Issues",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "is-tech",
          label: "IS and Information Technology:",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "informing",
          label: "Informing Science Theory",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "higher-ed",
          label: "Higher Education as a Field of Study",
          checked: false,
          hasSubOptions: false,
        },
        {
          id: "business",
          label: "Business Practice",
          checked: false,
          hasSubOptions: true,
          expanded: true,
          subOptions: [
            { id: "accounting", label: "Accounting", checked: false },
            { id: "finance", label: "Finance", checked: false },
            { id: "marketing", label: "Marketing", checked: false },
            { id: "management", label: "Management", checked: false },
          ],
        },
      ],
    },
    {
      id: "type",
      title: "Type of Research Method",
      minRequired: 2,
      expanded: false,
      options: [
        { id: "case", label: "Case Method", checked: false },
        {
          id: "empirical",
          label:
            "Empirical (direct observation) / Quantitative (systematic empirical investigation)",
          checked: false,
        },
        {
          id: "qualitative",
          label: "Qualitative (why and how decisions are made)",
          checked: false,
        },
        {
          id: "exploratory",
          label: "Exploratory (problem not yet clearly defined)",
          checked: false,
        },
        {
          id: "constructive",
          label:
            "Constructive (new theory, algorithm, model, software, or framework)",
          checked: false,
        },
      ],
    },
    {
      id: "isi",
      title: "ISI member available for co-authorship",
      expanded: false,
      options: [],
    },
  ]);

  const [selectedTopics, _] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const toggleOption = (sectionId: string, optionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId && section.options) {
          return {
            ...section,
            options: section.options.map((option) =>
              option.id === optionId
                ? {
                  ...option,
                  expanded: option.hasSubOptions
                    ? !option.expanded
                    : option.expanded,
                }
                : option
            ),
          };
        }
        return section;
      })
    );
  };

  const toggleSubOption = (
    sectionId: string,
    optionId: string,
    subOptionId: string
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId && section.options) {
          return {
            ...section,
            options: section.options.map((option) => {
              if (option.id === optionId && option.subOptions) {
                return {
                  ...option,
                  subOptions: option.subOptions.map((subOption) =>
                    subOption.id === subOptionId
                      ? { ...subOption, checked: !subOption.checked }
                      : subOption
                  ),
                };
              }
              return option;
            }),
          };
        }
        return section;
      })
    );
  };

  const expandAll = () => {
    setSections(sections.map((section) => ({ ...section, expanded: true })));
  };

  const moveUp = () => {
    // Logic to move selected topic up
  };

  const moveDown = () => {
    // Logic to move selected topic down
  };

  const handleSave = () => {
    //console.log("Form saved:", formData);
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 py-6 bg-white min-h-screen font-sans max-w-6xl">
        {/* Left Panel - Choose Topics */}
        <div className="flex-1">
          <h2 className="text-2xl font-normal text-gray-700 mb-4">
            Choose Topics
          </h2>

          <div
            onClick={expandAll}
            className="text-blue-600 text-sm mb-4 cursor-pointer hover:text-blue-700"
          >
            Expand All
          </div>

          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className=" border-gray-200">
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex cursor-pointer bg-white items-center gap-2 py-3 text-left w-full "
                >
                  {section.expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-gray-700 font-medium">
                    {section.title}
                  </span>
                  {section.minRequired && (
                    <span className="text-red-500 text-sm">
                      (At least {section.minRequired})
                    </span>
                  )}
                </div>

                {section.expanded &&
                  section.options &&
                  section.options.length > 0 && (
                    <div className="pl-6 pb-3">
                      {section.options.map((option) => (
                        <div key={option.id}>
                          < div
                            onClick={() => toggleOption(section.id, option.id)}
                            className="flex cursor-pointer !bg-white items-center gap-2 py-2 text-left w-full "
                          >
                            {option.hasSubOptions ? (
                              option.expanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                              )
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            )}
                            <span className="text-gray-700 text-sm">
                              {option.label}
                            </span>
                          </div>

                          {/* Sub-options for Business Practice */}
                          {option.hasSubOptions &&
                            option.expanded &&
                            option.subOptions && (
                              <div className="pl-8 space-y-2 pb-2">
                                {option.subOptions.map((subOption) => (
                                  <label
                                    key={subOption.id}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={subOption.checked}
                                      onChange={() =>
                                        toggleSubOption(
                                          section.id,
                                          option.id,
                                          subOption.id
                                        )
                                      }
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">
                                      {subOption.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Selected Topics */}
        <div className="flex-1">
          <h2 className="text-2xl font-normal text-gray-700 mb-4">
            Selected Topics
          </h2>

          <p className="text-gray-600 text-sm mb-3">
            Order the topics in order of relevance
          </p>

          <div className="relative">
            <select
              multiple
              className="w-full h-48 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={8}
            >
              {selectedTopics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            {/* Arrow buttons positioned on the right side of the select box */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
              <button
                onClick={moveUp}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 !bg-white rounded-full shadow-sm"
                title="Move up"
              >
                <ChevronsUp className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={moveDown}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 !bg-white rounded-full shadow-sm"
                title="Move down"
              >
                <ChevronsDown className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <div
          onClick={handleSave}
          className=" !bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85]  cursor-pointer border  border-x-0 border-b-4  text-white font-medium px-8 py-2.5  transition"
        >
          Save
        </div>
        <div
          onClick={handleCancel}
          className="!bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:!bg-gray-300 text-gray-700 font-medium px-8 py-2.5  transition"
        >
          Cancel
        </div>
      </div>
    </div>
  );
};

export default Topics;
