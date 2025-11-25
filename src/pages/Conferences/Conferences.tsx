import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { deleteConference, fetchConferences, setCurrentPage } from "../../store/conferenceSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";


const ConferencesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get state from Redux
  const {
    conferences,
    totalResults,
    currentPage,
    isLoading,
    error,
  } = useAppSelector((state) => state.conferences);

  // Filter states (local)
  const [searchText] = useState("");
  const [conferenceId] = useState("");
  const [type] = useState("");

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  // Fetch conferences when page or filters change
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;

    const params: any = {
      offset,
      limit: itemsPerPage,
    };

    if (searchText) params.text = searchText;
    if (conferenceId) params.journalId = conferenceId;
    if (type) params.type = type;

    dispatch(fetchConferences(params));
  }, [dispatch, currentPage, searchText, conferenceId, type]);

  // Handle delete conference
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conference?")) {
      return;
    }

    try {
      await dispatch(deleteConference(id)).unwrap();
      toast.success("Conference deleted successfully");
    } catch (err: any) {
      toast.error(err || "Failed to delete conference");
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];

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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-light text-gray-600">Conferences</div>
          <div
            onClick={() => navigate("/conferences/create")}
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85] cursor-pointer text-white font-medium px-6 py-2.5 !border-b-4 transition"
          >
            + Add New
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {conferences.length} of {totalResults.toLocaleString()}{" "}
            conferences
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
            <p className="mt-4 text-gray-600">Loading conferences...</p>
          </div>
        ) : conferences.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-600">No conferences found</p>
          </div>
        ) : (
          <>
            {/* Conferences Table */}
            <div className="bg-white border border-gray-300 rounded overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12 px-4 py-3 border border-gray-300 text-gray-700">Sr.no</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300">
                      Conference
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300 w-24">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300 w-38">
                      Status
                    </th>
                    <th className="w-20 px-4 py-3 border border-gray-300 text-gray-700">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {conferences.map((conference,index) => (
                    <tr
                      key={conference.conferenceId}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 border border-gray-300 text-center text-gray-700">
                        {/* <button
                          className="text-gray-400 hover:text-gray-600 cursor-move"
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
                                `/conferences/create?conferenceId=${conference.conferenceId}`
                              )
                            }
                          >
                            {conference.title}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {conference.acronym}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 border border-gray-300">
                        <span className="text-gray-600">
                          {new Date(
                            conference.insertDate * 1000
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="px-4 py-4 border border-gray-300">
                        <span
                          className={`text-sm ${conference.status === "Published All"
                            ? "text-green-600"
                            : "text-gray-600"
                            }`}
                        >
                          {conference.status}
                        </span>
                      </td>

                      {/* <td className="px-4 py-4 bg-transparent text-center border border-gray-300">
                        <button
                          onClick={(e) =>
                            handleDelete(conference.conferenceId, e)
                          }
                          className="text-red-400 hover:text-red-600 transition hover:!border-none "
                        >
                          <Trash2 size={20} />
                        </button>
                      </td> */}
                      <td className="px-4 py-4 border text-center border-gray-300">
                        <Trash2
                          size={20}
                          className="text-red-400 hover:text-red-600"
                          onClick={(e) => handleDelete(conference.conferenceId, e)}
                        />
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
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPage - 1))
                  }
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
                      className={`px-4 py-2 rounded ${currentPage === page
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

export default ConferencesPage;