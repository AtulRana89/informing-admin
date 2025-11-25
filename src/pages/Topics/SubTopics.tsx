import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  SquarePen,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  deleteJournal,
  fetchJournals,
  FetchJournalsParams,
  ReorderItem,
  reorderSubTopics,
  setCurrentPage,
} from "../../store/subTopicSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

// -----------------------------
// SubTopic Type (UI)
// -----------------------------
interface SubTopic {
  subTopicId: number;
  name: string;
  overviewDescription: string;
}

const SubTopicsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    journals,
    totalCount,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    filters,
  } = useAppSelector((state) => state.subtopic);

  const [localList, setLocalList] = useState<SubTopic[]>([]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // -----------------------------------------
  // preload → convert slice data → ui data
  // -----------------------------------------
  useEffect(() => {
    const converted = journals.map((j) => ({
      subTopicId: j?.subTopicId,
      name: j?.name,
      overviewDescription: j?.overviewDescription,
    }));

    setLocalList(converted);
  }, [journals]);

  // -----------------------------------------
  // fetch sub-topics
  // -----------------------------------------
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;

    const params: FetchJournalsParams = {
      offset,
      limit: itemsPerPage,
    };

    if (filters.searchText) params.text = filters.searchText;
    if (filters.journalId) params.journalId = filters.journalId;
    if (filters.type) params.type = filters.type;

    dispatch(fetchJournals(params));
  }, [currentPage, filters, itemsPerPage, dispatch]);

  // -----------------------------------------
  // delete
  // -----------------------------------------
  const handleDelete = async (
    id: number,
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await dispatch(deleteJournal(id)).unwrap();
      toast.success("Sub topic deleted");
    } catch (err) {
      toast.error((err as string) || "Failed to delete");
    }
  };

  // -----------------------------------------
  // handle drag end
  // -----------------------------------------
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newList = [...localList];
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);

    setLocalList(newList);

    const reordered: ReorderItem[] = newList.map((item, index) => ({
      _id: item.subTopicId,
      sortOrder: index + 1,
    }));

    try {
      await dispatch(reorderSubTopics({ items: reordered })).unwrap();
      //toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  // -----------------------------------------
  // Pagination
  // -----------------------------------------
  const handlePageChange = (p: number) => {
    dispatch(setCurrentPage(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const arr: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      if (currentPage <= 3) arr.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2)
        arr.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      else
        arr.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
    }

    return arr;
  };

  // -----------------------------------------

  return (
    <div className="bg-[#fff] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-light text-gray-600">Sub Topics</div>

          <div
            onClick={() => navigate("/create-subtopic")}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] text-white cursor-pointer px-6 py-2.5 font-medium !border-b-4"
          >
            + Add New
          </div>
        </div>

        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {localList?.length} of {totalCount}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {/* ---------------- DRAG & DROP TABLE ---------------------- */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="subtopics">
            {(provided) => (
              <table
                ref={provided.innerRef}
                {...provided?.droppableProps}
                className="w-full border-collapse"
              >
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12 px-4 py-3 border border-gray-300 text-gray-700 ">Shuffle</th>
                    <th className="w-12 px-4 py-3 border border-gray-300"></th>
                    <th className="px-4 py-3 border text-left text-gray-700 border-gray-300">Sub Topics</th>
                    <th className="px-4 py-3 border w-20 border-gray-300 text-gray-700">Edit</th>
                    <th className="px-4 py-3 border w-20 border-gray-300 text-gray-700">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {localList?.map((st, i) => (
                    <Draggable
                      key={st?.subTopicId}
                      draggableId={st?.subTopicId.toString()}
                      index={i}
                    >
                      {(provided) => (
                        <tr
                          ref={provided?.innerRef}
                          {...provided?.draggableProps}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td
                            className="px-4 py-4 border text-center border-gray-300"
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={20} className="text-gray-400" />
                          </td>

                          <td className="px-4 py-4 border border-gray-300">
                            <div>
                              <div
                                onClick={() =>
                                  navigate(
                                    `/create-subtopic?journalId=${st?.subTopicId}`
                                  )
                                }
                                className="text-blue-600 hover:underline font-normal mb-1"
                              >
                                {st?.name}
                              </div>

                              <div
                                className="text-gray-600 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: st.overviewDescription,
                                }}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-4 border text-center border-gray-300">
                            <SquarePen
                              size={20}
                              className="text-gray-900 hover:text-blue-800"
                              onClick={() =>
                                navigate(
                                  `/create-subtopic?journalId=${st?.subTopicId}`
                                )
                              }
                            />
                          </td>

                          <td className="px-4 py-4 border text-center border-gray-300">
                            <Trash2
                              size={20}
                              className="text-red-400 hover:text-red-600"
                              onClick={(e) => handleDelete(st?.subTopicId, e)}
                            />
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}

                  {provided?.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>

        {/* ---------------- PAGINATION ---------------------- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>

            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={idx}
                  onClick={() => handlePageChange(p)}
                  className={`px-4 py-2 rounded ${currentPage === p
                    ? "bg-[#4A8BC2] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400">
                  {p}
                </span>
              )
            )}

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubTopicsPage;
