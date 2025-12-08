import { ChevronLeft, ChevronRight, Clock, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCombineJournals } from "../../store/journalSlice";
import {
  deleteUser,
  deselectAllUsers,
  fetchUsers,
  selectAllUsers,
  setActiveTab,
  setCurrentPage,
  setSearchQuery,
  setSearchType,
  toggleUserSelection,
} from "../../store/userSlice";
import { apiService } from "../../services";
import MultiSelectCheckbox, { Option } from "../../components/multi-select";

const typeOptions: Option[] = [
  { value: "", label: "All Type" },
  { value: "reviewer", label: "Reviewer" },
  { value: "editor", label: "Editor" },
  { value: "Publisher", label: "Publisher" },
  { value: "Author", label: "Author" },
  { value: "UnverifiedAuthor", label: "Unverified Article Author" },
  { value: "NoActiveEmails", label: "Reviewer/Editor With No Active Emails" },

  { value: "", label: "", isDivider: true },

  { value: "gackowski_award_winner", label: "Gackowski Award Winner" },
  { value: "second_act", label: "Second Act" },
  { value: "ambassador", label: "Ambassador" },
  { value: "director", label: "Director" },
  { value: "honorary_fellow", label: "Honorary Fellow" },
  { value: "fellow", label: "Fellow" },
  { value: "governor", label: "Governor" },
  { value: "executive_director", label: "Executive Director" },

  { value: "", label: "", isDivider: true },

  { value: "isi_founder", label: "Founder" },
  { value: "alumni", label: "Alumni" },
  { value: "Member", label: "Member" },
  { value: "LapsedMember", label: "Lapsed Member" },
  { value: "landing_page", label: "Featured" },
  { value: "HasTestimonial", label: "Has Testimonial" },
  { value: "in_watchList", label: "In Watchlist" },
  { value: "presented_paper", label: "Presented Paper at InSITE" },
  { value: "best_paper", label: "Best Paper for InSITE" },
];

const Users = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const {
    users,
    totalCount,
    currentPage,
    limit,
    totalPages,
    isLoading,
    selectedUsers,
    filters,
  } = useAppSelector((state) => state.users);

  const { combineList } = useAppSelector((state) => state.journals);

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  useEffect(() => {
    dispatch(fetchCombineJournals());
    console.log("Fetched combine journals :", combineList);
  }, []);

  // Set active tab from URL
  useEffect(() => {
    if (role && role !== filters.activeTab) {
      dispatch(setActiveTab(role));
    }
  }, [role, dispatch]);

  // Fetch users when dependencies change
  useEffect(() => {
    const offset = (currentPage - 1) * limit;

    const params: any = {
      offset,
      limit,
    };

    if (filters.searchQuery.trim()) {
      params.text = filters.searchQuery.trim();
    }

    if (filters.activeTab && filters.activeTab !== "User") {
      if (filters.activeTab == "Duplicate") {
        params.role = "isDuplicate";
      } else {
        params.role = filters.activeTab.toLowerCase();
      }
    }
    if (filters.type) {
      params.isiPosition = filters.type;
    }
    dispatch(fetchUsers(params));
  }, [
    currentPage,
    selectedUsers,
    filters.searchQuery,
    filters.activeTab,
    filters.type,
    limit,
    dispatch,
  ]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      dispatch(selectAllUsers());
    } else {
      dispatch(deselectAllUsers());
    }
  };

  const handleSelectUser = async (userId: string) => {
    const isCurrentlySelected = selectedUsers.includes(userId);

    // Update local state (toggle user)
    let updated;
    if (isCurrentlySelected) {
      updated = selectedUsers.filter((id) => id !== userId);
    } else {
      updated = [...selectedUsers, userId];
    }

    // API payload
    const payload = {
      userId,
      isDuplicate: !isCurrentlySelected, // true if checked, false if unchecked
    };

    try {
      await apiService.put("/user/update", payload);
      console.log("API updated:", payload);
      dispatch(toggleUserSelection(userId));
      toast.success("user updated succesfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.data?.message);
      console.error("Error updating:", error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setCurrentPage(page));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success("User deleted successfully!");
      } catch (error: any) {
        toast.error(error || "Failed to delete user");
      }
    }
  };

  // Export current page to CSV
  const handleExportToCSV = () => {
    if (users.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Define CSV headers
      const headers = ["User Name", "Email", "Details", "Registration Date"];

      // Convert users data to CSV rows
      const rows = users.map((user: any) => {
        const date = new Date(user.insertDate * 1000);
        // Format date as DD/MM/YYYY for better Excel compatibility
        const registrationDate = `${String(date.getDate()).padStart(
          2,
          "0"
        )}/${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}/${date.getFullYear()}`;

        return [
          user.personalName || "",
          user.email || "",
          `Submissions (${user.department || ""})`,
          registrationDate,
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download with UTF-8 BOM for better Excel compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `users_page_${currentPage}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("Export error:", error);
    }
  };

  const onTabClick = (tabLabel: string) => {
    //const lower = tabLabel.toLowerCase();
    // local UI
    //setActiveTab(lower);
    dispatch(setActiveTab(tabLabel));

    // redux
    //dispatch(setActiveTabInStore(lower));
    // update URL (replace so it doesn't spam history — change to push if you prefer)
    // const params = new URLSearchParams(location.search);
    // params.set("role", lower);
    // navigate(
    //   { pathname: location.pathname, search: params.toString() },
    //   { replace: true }
    // );
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0 ${
              currentPage === i
                ? "!bg-[#4A8BC2] !text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0 ${
            currentPage === 1
              ? "!bg-[#4A8BC2] !text-white"
              : "!text-gray-600 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        buttons.push(
          <span key="dots1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0 ${
              currentPage === i
                ? "bg-[#4A8BC2] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="dots2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      // Always show last page
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0 ${
            currentPage === totalPages
              ? "bg-[#4A8BC2] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };
  const handleType = (values: string[]) => {
    dispatch(setSearchType(values));
  };

  const handleTypeChange = (selected: string[]) => {
    setSelectedTypes(selected);
    // Your handleType function logic here
    console.log("Selected types:", selected);
  };

  return (
    <div className="bg-[#fff] min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-2xl font-light text-gray-600">Users</div>
          <div
            onClick={() =>
              navigate(`/users/create?role=${filters.activeTab?.toLowerCase()}`)
            }
            className="!bg-[#3d7ab5] hover:!bg-[#2b5f85] !border-[#2b5f85] cursor-pointer text-white font-medium px-6 py-2.5 !border-b-4 transition"
          >
            + Add New
          </div>
        </div>
        <div className="flex justify-between gap-3">
          <div className="flex gap-3 py-2">
            {["User", "Eic", "Admin", "Duplicate"].map((tab) => (
              <div
                key={tab}
                onClick={() => onTabClick(tab)}
                className={`px-2 py-2 rounded-xl cursor-pointer ${
                  filters.activeTab == tab
                    ? "!bg-[#568fce] text-white"
                    : "bg-white text-gray-400 border border-gray-300 hover:border-gray-400"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="flex gap-3 ">
            <div className="flex items-center ">
              <MultiSelectCheckbox
                options={typeOptions}
                value={selectedTypes}
                onChange={handleType}
                placeholder="All Types"
                disabled={false}
                isLoading={isLoading}
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                disabled={isLoading}
                className={`bg-[#FAFAFA] text-[14px] border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-gray-400 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {combineList?.map((item: any) => (
                  <option key={item.id} value={item.acronym}>
                    {item.acronym}
                  </option>
                ))}
                {/* <option value="">All Journals/Conferences</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option> */}
              </select>
            </div>
            {/* Search Input */}
            <div className="flex items-center flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className={`w-full text-[14px] bg-[#FAFAFA] border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-gray-400 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
        </div>
        {/* Export and Batch Options */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="text-gray-600">
            {totalCount.toLocaleString()} Total Results
          </span>
          <span className="text-gray-400">|</span>
          <button
            onClick={handleExportToCSV}
            className="text-blue-600 hover:underline !bg-transparent !border-none cursor-pointer"
          >
            Export to xls
          </button>
        </div>

        {/* Loading State */}
        {/* {isLoading && (
          <div className="text-center py-8 text-gray-600">Loading users...</div>
        )} */}

        {/* Users Table */}
        {!false && (
          <div className="bg-white border border-gray-300 rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-10 px-4 py-3 border border-gray-300">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        users.length > 0 &&
                        selectedUsers.length === users.length
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300">
                    User Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300">
                    Details
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-300">
                    Registration ▾
                  </th>
                  <th className="w-16 px-4 py-3 border border-gray-300  text-gray-700">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/profile/personal-info?id=${user?.userId}`)
                      }
                    >
                      <td
                        className="px-4 py-4 border border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* <input
                          type="checkbox"
                          checked={user.isDuplicate || false}
                          onChange={() => handleSelectUser(user.userId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        /> */}

                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.includes(user.userId) ||
                            user.isDuplicate
                          }
                          onChange={() => handleSelectUser(user.userId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.personalName}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <User
                                size={28}
                                className="text-white"
                                strokeWidth={1.5}
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-blue-600 hover:underline cursor-pointer font-medium">
                              {user.personalName}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <a href="#" className="text-blue-600 hover:underline">
                          Submissions ({user.department})
                        </a>
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(
                              user.insertDate * 1000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      {/* <td className="px-4 py-4 text-center border border-gray-300">
                        <button
                          onClick={(e) => handleDeleteUser(user.userId, e)}
                          className=" hover:!border-none text-red-400 bg-transparent hover:text-red-600 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td> */}
                      <td className="px-4 py-4 border text-center border-gray-300">
                        <Trash2
                          size={20}
                          className="text-red-400 hover:text-red-600"
                          onClick={(e) => handleDeleteUser(user.userId, e)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0"
            >
              <ChevronLeft size={20} />
            </button>

            {renderPaginationButtons()}

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed !border-none !outline-none !ring-0 focus:!outline-none focus:!border-none focus:!ring-0 active:!outline-none active:!border-none active:!ring-0"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
