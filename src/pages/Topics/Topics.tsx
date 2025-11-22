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
  reorderTopics,
  setCurrentPage,
} from "../../store/topicSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

// -----------------------------
// Journal Type
// -----------------------------
interface Journal {
  journalId: number;
  topicId: number;
  name: string;
  overviewDescription: string;
}

const TopicsPage = () => {
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
  } = useAppSelector((state) => state.topic);

  const [localList, setLocalList] = useState<Journal[]>([]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // preload local list when journals change
  useEffect(() => {
    const mapped = journals.map((j) => ({
      ...j,
      journalId: j.topicId, // convert to component's expected format
    }));

    setLocalList(mapped);
  }, [journals]);

  // ------------------------------------
  // Fetch journals
  // ------------------------------------
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

  // ------------------------------------
  // delete
  // ------------------------------------
  const handleDelete = async (
    id: number,
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this journal?"))
      return;

    try {
      await dispatch(deleteJournal(id)).unwrap();
      toast.success("Journal deleted successfully");
    } catch (err) {
      toast.error((err as string) || "Delete failed");
    }
  };

  // ------------------------------------
  // pagination
  // ------------------------------------
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------
  // drag end handler
  // ------------------------------------
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newList = [...localList];
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);

    setLocalList(newList);

    const reorderedPayload: ReorderItem[] = newList.map((item, index) => ({
      _id: item.topicId,
      sortOrder: index + 1,
    }));

    try {
      await dispatch(reorderTopics({ items: reorderedPayload })).unwrap();
      // toast.success("Order updated");
    } catch {
      // toast.error("Failed to update order");
    }
  };

  // ------------------------------------
  // pagination numbers
  // ------------------------------------
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2)
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      else
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
    }
    return pages;
  };

  return (
    <div className="bg-[#fff] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-light text-gray-600 ">Topics</div>

          <div
            onClick={() => navigate("/create-topic")}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] cursor-pointer text-white font-medium px-6 py-2.5 !border-b-4"
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
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* DRAG-DROP TABLE ---------------------- */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="topics">
            {(provided) => (
              <table
                ref={provided.innerRef}
                {...provided?.droppableProps}
                className="w-full border-collapse  border border-gray-300 "
              >
                <thead className="bg-gray-100 border border-gray-300">
                  <tr className="border border-gray-300">
                    <th className="w-12 px-4 py-3 border border-gray-300"></th>
                    <th className="px-4 py-3 border text-left text-gray-600 border-gray-300">
                      Topics
                    </th>
                    <th className="px-4 py-3 border w-20 border-gray-300"></th>
                    <th className="px-4 py-3 border w-20 border-gray-300"></th>
                  </tr>
                </thead>

                <tbody>
                  {localList?.map((journal, index) => (
                    <Draggable
                      key={journal.topicId}
                      draggableId={journal?.topicId?.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided?.draggableProps}
                          className="hover:bg-gray-50 cursor-pointer border-gray-300"
                        >
                          <td
                            className="px-4 py-4 border text-center border-gray-300"
                            {...provided?.dragHandleProps}
                          >
                            <GripVertical size={20} className="text-gray-400" />
                          </td>

                          <td className="px-4 py-4 border border-gray-300">
                            <div>
                              <div
                                onClick={() =>
                                  navigate(
                                    `/create-topic?journalId=${journal?.topicId}`
                                  )
                                }
                                className="text-blue-600 hover:underline font-normal mb-1"
                              >
                                {journal?.name}
                              </div>

                              <div
                                className="text-gray-600 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: journal.overviewDescription,
                                }}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-4 border text-center border-gray-300">
                            <SquarePen
                              size={20}
                              className="hover:text-blue-800"
                              onClick={() =>
                                navigate(
                                  `/create-topic?journalId=${journal?.topicId}`
                                )
                              }
                            />
                          </td>

                          <td className="px-4 py-4 border text-center border-gray-300">
                            <Trash2
                              size={20}
                              className="text-red-400 hover:text-red-600"
                              onClick={(e) => handleDelete(journal?.topicId, e)}
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>

            {getPageNumbers().map((pg, i) =>
              typeof pg === "number" ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(pg)}
                  className={`px-4 py-2 rounded ${
                    currentPage === pg
                      ? "bg-[#4A8BC2] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pg}
                </button>
              ) : (
                <span key={i} className="px-2">
                  {pg}
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

export default TopicsPage;
