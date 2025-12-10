import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services';

interface Faq {
    faqId: number;
    question: string;
    answer: string;
}

interface faqListData {
    list: Faq[];
    totalCount: number;
}

interface faqListResponse {
    data: faqListData;
}

interface FetchfaqsParams {
    offset: number;
    limit: number;
    text?: string;
    faqId?: string;
    type?: string;
}

interface faqState {
    faqs: Faq[];
    combineList: Faq[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
    isLoading: boolean;
    error: string | null;
    filters: {
        searchText: string;
        faqId: string;
        type: string;
    };
}

const initialState: faqState = {
    faqs: [],
    combineList: [],
    totalCount: 0,
    currentPage: 1,
    itemsPerPage: 10,
    isLoading: false,
    error: null,
    filters: {
        searchText: '',
        faqId: '',
        type: '',
    },
};

// Async thunk for fetching faqs
export const fetchfaqs = createAsyncThunk<
    faqListData,
    FetchfaqsParams,
    { rejectValue: string }
>(
    'faq/fetchfaq',
    async (params, { rejectWithValue }) => {
        try {
            const response = await apiService.get<faqListResponse>(
                '/faq/list',
                { params }
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to load faqs'
            );
        }
    }
);

// Async thunk for deleting a faq
export const deletefaq = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    'faqs/deletefaq',
    async (faqId, { rejectWithValue }) => {
        try {
            await apiService.delete(`/faq/delete/${faqId}`);
            return faqId;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete faq'
            );
        }
    }
);

const faqSlice = createSlice({
    name: 'faqs',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setFilters: (
            state,
            action: PayloadAction<Partial<faqState['filters']>>
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
            // Fetch faqs
            .addCase(fetchfaqs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchfaqs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.faqs = action.payload.list;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchfaqs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'An error occurred';
                state.faqs = [];
            })
            // Delete faq
            .addCase(deletefaq.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deletefaq.fulfilled, (state, action) => {
                state.isLoading = false;
                state.faqs = state.faqs.filter(
                    (faq) => faq.faqId !== action.payload
                );
                state.totalCount = Math.max(0, state.totalCount - 1);
            })
            .addCase(deletefaq.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete faq';
            });
    },
});

export const { setCurrentPage, setFilters, resetFilters } = faqSlice.actions;
export default faqSlice.reducer;