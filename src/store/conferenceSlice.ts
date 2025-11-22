import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services';


interface Conference {
  id: number;
  insertDate: number;
  conferenceId: number;
  fullName: string;
  registrations: string;
  shortName: string;
  title: string;
  acronym: string;
  overviewDescription: string;
  status: "Published All" | "Archived";
}

interface ConferenceListData {
  list: Conference[];
  totalCount: number;
}

interface ConferenceState {
  conferences: Conference[];
  totalResults: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

interface FetchConferencesParams {
  offset: number;
  limit: number;
  text?: string;
  journalId?: string;
  type?: string;
}

// Initial state
const initialState: ConferenceState = {
  conferences: [],
  totalResults: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
};

// Async thunk for fetching conferences
export const fetchConferences = createAsyncThunk<
  ConferenceListData,
  FetchConferencesParams,
  { rejectValue: string }
>(
  'conferences/fetchConferences',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ data: ConferenceListData }>(
        '/conference/list',
        { params }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load conferences'
      );
    }
  }
);

// Async thunk for deleting a conference
export const deleteConference = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'conferences/deleteConference',
  async (conferenceId, { rejectWithValue }) => {
    try {
      await apiService.delete(`/conference/${conferenceId}`);
      return conferenceId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete conference'
      );
    }
  }
);

// Conference slice
const conferenceSlice = createSlice({
  name: 'conferences',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conferences
      .addCase(fetchConferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conferences = action.payload.list;
        state.totalResults = action.payload.totalCount;
      })
      .addCase(fetchConferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Delete conference
      .addCase(deleteConference.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteConference.fulfilled, (state, action) => {
        state.conferences = state.conferences.filter(
          (conf) => conf.conferenceId !== action.payload
        );
        state.totalResults -= 1;
      })
      .addCase(deleteConference.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete conference';
      });
  },
});

export const { setCurrentPage, clearError } = conferenceSlice.actions;
export default conferenceSlice.reducer;