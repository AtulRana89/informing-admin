import { ChevronLeft, ChevronRight, SquarePen, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  fetchJournals, 
  deleteJournal, 
  setCurrentPage 
} from "../../store/typeSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const Type = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { 
    journals, 
    totalCount, 
    currentPage, 
    itemsPerPage, 
    isLoading, 
    error,
    filters 
  } = useAppSelector((state) => state.type);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch journals when page or filters change
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    
    const params: any = {
      offset,
      limit: itemsPerPage,
    };

    if (filters.searchText) params.text = filters.searchText;
    if (filters.journalId) params.journalId = filters.journalId;
    if (filters.type) params.type = filters.type;

    dispatch(fetchJournals(params));
  }, [currentPage, filters, itemsPerPage, dispatch]);

  // Handle delete journal
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this journal?")) {
      return;
    }

    try {
      await dispatch(deleteJournal(id)).unwrap();
      toast.success("Journal deleted successfully");
    } catch (err: any) {
      toast.error(err || "Failed to delete journal");
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
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
    }

    return pages;
  };

  return (
    <div className="bg-[#fff] min-h-screen">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-light text-gray-600">
            Types
          </div>
          <div
            onClick={() => navigate("/create-type")}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85] cursor-pointer text-white font-medium px-6 py-2.5 !border-b-4 transition"
          >
            + Add New
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {journals.length} of {totalCount.toLocaleString()} journals
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {false ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4282c8]"></div>
            <p className="mt-4 text-gray-600">Loading Types...</p>
          </div>
        ) : journals.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-600">No Tracks found</p>
          </div>
        ) : (
          <>
            {/* Journals Table */}
            <div className="bg-white border border-gray-300 rounded overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12 px-4 py-3 border border-gray-300"></th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300">
                      Types
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300 w-20">
                     
                    </th>
                    <th className="w-20 px-4 py-3 border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map((journal,index) => (
                    <tr
                      key={journal.articleId}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 border border-gray-300 text-center">
                        {/* <button
                          className="text-gray-400 hover:text-gray-600 cursor-move !bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={20} />
                        </button> */}
                         {(currentPage - 1) * itemsPerPage + (index + 1)}
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <div>
                          <div
                            className="text-blue-600 hover:underline font-normal mb-1"
                            onClick={() =>
                              navigate(
                                `/create-type?journalId=${journal.articleId}`
                              )
                            }
                          >
                            {journal.name}
                          </div>
                          <div
                            className="text-gray-600 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: journal.overviewDescription,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <SquarePen
                          onClick={() =>
                            navigate(
                              `/create-type?journalId=${journal.articleId}`
                            )
                          }
                          size={20}
                          className="hover:text-blue-800"
                        />
                      </td>
                      <td className="px-4 py-4 bg-transparent text-center border border-gray-300">
                        <button
                          onClick={(e) => handleDelete(journal.articleId, e)}
                          className=" hover:!border-none text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded ${
                        currentPage === page
                          ? "bg-[#4A8BC2] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500">
                      {page}
                    </span>
                  )
                )}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Type;