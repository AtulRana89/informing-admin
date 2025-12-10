import {
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../../services";

interface SubOption {
  _id: string;
  name: string;
  checked: boolean;
}

interface TopicOption {
  topicId: string;
  name: string;
  checked: boolean;
  hasSubOptions?: boolean;
  expanded?: boolean;
  subOptions?: SubOption[];
}

interface TopicSection {
  topicId: string;
  name: string;
  minSelections: string;
  expanded: boolean;
  options?: TopicOption[];
}

const Topics = () => {
  const [sections, setSections] = useState<TopicSection[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await apiService.get("/topic/topic-with-subtopics");
      const data = response.data?.response || response;

      const transformedSections: TopicSection[] =
        data.data?.list.map((topic: any) => ({
          topicId: topic.topicId,
          name: topic.name,
          minSelections: topic.minSelections || "1",
          expanded: false,
          options: topic.subTopics?.map((sub: any) => ({
            topicId: sub._id,
            name: sub.name,
            checked: false,
            hasSubOptions: false,
            expanded: false,
          })),
        })) || [];

      setSections(transformedSections);
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.topicId === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const toggleOption = (sectionId: string, optionId: string, name?: string) => {
    setSections(
      sections.map((section) => {
        if (section.topicId === sectionId && section.options) {
          return {
            ...section,
            options: section.options.map((option) => {
              if (option.topicId === optionId) {
                const newChecked = !option.checked;

                // Update selected topics when checked/unchecked
                if (name) {
                  setSelectedTopics(
                    (prev) =>
                      newChecked
                        ? [...prev, name] // ADD name
                        : prev.filter((t) => t !== name) // REMOVE name
                  );
                }

                return {
                  ...option,
                  checked: newChecked, // <-- KEY PART
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

  const toggleSubOption = (
    sectionId: string,
    optionId: string,
    subOptionId: string
  ) => {
    //alert(11);
    setSections(
      sections.map((section) => {
        if (section.topicId === sectionId && section.options) {
          return {
            ...section,
            options: section.options.map((option) => {
              if (option.topicId === optionId && option.subOptions) {
                return {
                  ...option,
                  subOptions: option.subOptions.map((sub) =>
                    sub._id === subOptionId
                      ? { ...sub, checked: !sub.checked }
                      : sub
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
    // Here you can send selected topics/subtopics to the API
    console.log("Saved topics:", sections);
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
              <div key={section.topicId} className="border-gray-200">
                <div
                  onClick={() => toggleSection(section.topicId)}
                  className="flex cursor-pointer bg-white items-center gap-2 py-3 text-left w-full "
                >
                  {section.expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-gray-700 font-medium">
                    {section?.name}
                  </span>
                  {section.minSelections && (
                    <span className="text-red-500 text-sm">
                      (At least {section.minSelections})
                    </span>
                  )}
                </div>

                {section.expanded &&
                  section.options &&
                  section.options.length > 0 && (
                    <div className="pl-6 pb-3">
                      {section.options.map((option) => (
                        <div key={option.topicId}>
                          <div
                            onClick={() =>
                              option.hasSubOptions
                                ? toggleOption(section.topicId, option.topicId)
                                : null
                            }
                            className="flex cursor-pointer items-center gap-2 py-2"
                          >
                            {/* {option.hasSubOptions ? (
                              option.expanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                              )
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            )} */}

                            <label
                              key={option.topicId}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1"
                            >
                              <input
                                type="checkbox"
                                checked={option.checked}
                                onChange={() =>
                                  toggleOption(
                                    section.topicId,
                                    option.topicId,
                                    option.name
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />

                              <span className="text-gray-700 text-sm">
                                {option.name}
                              </span>
                            </label>
                          </div>

                          {option.hasSubOptions &&
                            option.expanded &&
                            option.subOptions && (
                              <div className="pl-8 space-y-2 pb-2">
                                {option.subOptions.map((subOption) => (
                                  <label
                                    key={subOption._id}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={subOption.checked}
                                      onChange={() =>
                                        toggleSubOption(
                                          section.topicId,
                                          option.topicId,
                                          subOption._id
                                        )
                                      }
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">
                                      {subOption.name}
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
              className="w-full h-48 border  border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={8}
            >
              {selectedTopics.map((topic, index) => (
                <option
                  key={index}
                  value={topic}
                  className="text-gray-600 font-md"
                >
                  {topic}
                </option>
              ))}
            </select>

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 ">
              <button
                onClick={moveUp}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-full shadow-sm"
                title="Move up"
              >
                <ChevronsUp className="w-4 h-4 text-gray-700 " />
              </button>
              <button
                onClick={moveDown}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-full shadow-sm"
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
          className="bg-[#3d7ab5] hover:bg-[#2b5f85] cursor-pointer border border-x-0 border-b-4 text-white font-medium px-8 py-2.5 transition"
        >
          Save
        </div>
        <div
          onClick={handleCancel}
          className="bg-gray-200 cursor-pointer border-gray-300 border-x-0 border-b-4 hover:bg-gray-300 text-gray-700 font-medium px-8 py-2.5 transition"
        >
          Cancel
        </div>
      </div>
    </div>
  );
};

export default Topics;
