import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../services";

export interface SubTopic {
  subTopicId: number;
  name: string;
  fullName: string;
  shortName: string;
  overviewDescription: string;
  status: "Published All" | "Archived";
}

interface SubTopicListData {
  list: SubTopic[];
  totalCount: number;
}

interface SubTopicListResponse {
  data: {
    list: any[];
    totalCount: number;
  };
}

export interface FetchJournalsParams {
  offset: number;
  limit: number;
  text?: string;
  journalId?: string;
  type?: string;
}

export interface ReorderItem {
  _id: number;
  sortOrder: number;
}

export interface ReorderSubTopicsPayload {
  items: ReorderItem[];
}

interface SubTopicState {
  journals: SubTopic[];
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

const initialState: SubTopicState = {
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

// --------------------------------------------------
// FETCH SUB TOPICS
// --------------------------------------------------
export const fetchJournals = createAsyncThunk<
  SubTopicListData,
  FetchJournalsParams,
  { rejectValue: string }
>("subtopics/fetchJournals", async (params, { rejectWithValue }) => {
  try {
    const response = await apiService.get<SubTopicListResponse>(
      "/topic/sub/list",
      { params }
    );

    const mappedList: SubTopic[] = response.data.list.map((item) => ({
      subTopicId: item.subTopicId ?? item.topicId,
      name: item.name,
      fullName: item.fullName,
      shortName: item.shortName,
      overviewDescription: item.overviewDescription,
      status: item.status,
    }));

    return {
      list: mappedList,
      totalCount: response.data.totalCount,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load sub topics"
    );
  }
});

// --------------------------------------------------
// DELETE SUBTOPIC
// --------------------------------------------------
export const deleteJournal = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("subtopics/deleteJournal", async (journalId, { rejectWithValue }) => {
  try {
    await apiService.delete(`/topic/sub/${journalId}`);
    return journalId;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete sub topic"
    );
  }
});

// --------------------------------------------------
// REORDER SUBTOPICS (NEW)
// --------------------------------------------------
export const reorderSubTopics = createAsyncThunk<
  { success: boolean },
  ReorderSubTopicsPayload,
  { rejectValue: string }
>("subtopics/reorder", async ({ items }, { rejectWithValue }) => {
  try {
    const response = await apiService.put("/topic/reorder", {
      items,
      type: "subtopic",
    });

    return response.data as { success: boolean };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to reorder sub topics"
    );
  }
});

// --------------------------------------------------
// SLICE
// --------------------------------------------------
const subTopicSlice = createSlice({
  name: "subtopic",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<SubTopicState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH
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

      // DELETE
      .addCase(deleteJournal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journals = state.journals.filter(
          (sub) => sub.subTopicId !== action.payload
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
      })
      .addCase(deleteJournal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete sub topic";
      })

      // REORDER (NEW)
      //.addCase(reorderSubTopics.fulfilled, (state) => {})
      .addCase(reorderSubTopics.rejected, (state, action) => {
        state.error = action.payload || "Failed to reorder sub topics";
      });
  },
});

export const { setCurrentPage, setFilters, resetFilters } =
  subTopicSlice.actions;

export default subTopicSlice.reducer;
