import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../services";

interface Journal {
  trackId: number;
  name: string;
  //journalId: number;
  fullName: string;
  shortName: string;
  title: string;
  overviewDescription: string;
  status: "Published All" | "Archived";
}

interface JournalListData {
  list: Journal[];
  totalCount: number;
}

interface JournalListResponse {
  data: JournalListData;
}

interface FetchJournalsParams {
  offset: number;
  limit: number;
  text?: string;
  journalId?: string;
  type?: string;
}

interface JournalState {
  journals: Journal[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    searchText: string;
    journalId: string;
    type: string;
  };
}

const initialState: JournalState = {
  journals: [],
  totalCount: 0,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
  filters: {
    searchText: "",
    journalId: "",
    type: "",
  },
};

// Async thunk for fetching journals
export const fetchJournals = createAsyncThunk<
  JournalListData,
  FetchJournalsParams,
  { rejectValue: string }
>("journals/fetchJournals", async (params, { rejectWithValue }) => {
  try {
    const response = await apiService.get<JournalListResponse>(
      "/topic/track/list",
      { params }
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load journals"
    );
  }
});

// Async thunk for deleting a journal
export const deleteJournal = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("journals/deleteJournal", async (journalId, { rejectWithValue }) => {
  try {
    await apiService.delete(`/topic/track/${journalId}`);
    return journalId;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete journal"
    );
  }
});

const trackSlice = createSlice({
  name: "track",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<JournalState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch journals
      .addCase(fetchJournals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journals = action.payload.list;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "An error occurred";
        state.journals = [];
      })
      // Delete journal
      .addCase(deleteJournal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journals = state.journals.filter(
          (journal) => journal.trackId !== action.payload
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
      })
      .addCase(deleteJournal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete journal";
      });
  },
});

export const { setCurrentPage, setFilters, resetFilters } = trackSlice.actions;
export default trackSlice.reducer;
