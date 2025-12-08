import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../services";

interface UserData {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  submissions: number;
  registrationDate: string;
  personalName: string;
  department: string;
  insertDate: number;
}

interface UserListResponse {
  data?: {
    list: UserData[];
    totalCount: number;
  };
  list?: UserData[];
  totalCount?: number;
}

interface FetchUsersParams {
  offset: number;
  limit: number;
  text?: string;
  status?: string;
}

interface UserState {
  users: UserData[];
  totalCount: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  selectedUsers: string[];
  filters: {
    activeTab: string | null;
    typeFilter: string;
    searchQuery: string;
    type: string[];
  };
}

const initialState: UserState = {
  users: [],
  totalCount: 0,
  currentPage: 1,
  limit: 20,
  totalPages: 0,
  isLoading: false,
  error: null,
  selectedUsers: [],
  filters: {
    activeTab: "User",
    typeFilter: "All Types", // single string for UI label
    searchQuery: "",
    type: [] as string[], // array for API filtering
  },
};

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk<
  { users: UserData[]; totalCount: number },
  FetchUsersParams,
  { rejectValue: string }
>("users/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await apiService.get<UserListResponse>("/user/list", {
      params,
    });

    // Handle different response structures
    const data = response.data || response;
    const userList = data?.list || (data as any).data || [];
    const total = data?.totalCount || (data as any).totalCount || 0;

    return {
      users: userList,
      totalCount: total,
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { users: [], totalCount: 0 };
    }
    return rejectWithValue(
      err.response?.data?.message || "Failed to load users"
    );
  }
});

// Async thunk for deleting a user
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await apiService.delete(`/user/${userId}`);
    return userId;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete user"
    );
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string | null>) => {
      state.filters.activeTab = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.filters.typeFilter = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSearchType: (state, action: PayloadAction<string[]>) => {
      state.filters.type = action.payload; // array for API
      state.filters.typeFilter = action.payload.length // for UI display
        ? action.payload.join(", ")
        : "All Types"; // default label
      state.currentPage = 1;
    },

    setSelectedUsers: (state, action: PayloadAction<string[]>) => {
      state.selectedUsers = action.payload;
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state.selectedUsers.includes(userId)) {
        state.selectedUsers = state.selectedUsers.filter((id) => id !== userId);
      } else {
        state.selectedUsers.push(userId);
      }
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.users.map((user) => user.userId);
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload.totalCount;
        state.totalPages = Math.ceil(action.payload.totalCount / state.limit);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "An error occurred";
        state.users = [];
        state.totalCount = 0;
        state.totalPages = 0;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(
          (user) => user.userId !== action.payload
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        state.totalPages = Math.ceil(state.totalCount / state.limit);
        // Remove from selected users if present
        state.selectedUsers = state.selectedUsers.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete user";
      });
  },
});

export const {
  setCurrentPage,
  setActiveTab,
  setTypeFilter,
  setSearchQuery,
  setSearchType,
  setSelectedUsers,
  toggleUserSelection,
  selectAllUsers,
  deselectAllUsers,
  resetFilters,
} = userSlice.actions;

export default userSlice.reducer;
