import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services';

interface Content {
    contentId: number;
    description: string;
    pageType: string;
}

interface contentListData {
    list: Content[];
    totalCount: number;
}

interface contentListResponse {
    data: contentListData;
}

interface FetchcontentsParams {
    offset: number;
    limit: number;
    text?: string;
    contentId?: string;
    type?: string;
}

interface contentState {
    contents: Content[];
    combineList: Content[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
    isLoading: boolean;
    error: string | null;
    filters: {
        searchText: string;
        contentId: string;
        type: string;
    };
}

const initialState: contentState = {
    contents: [],
    combineList: [],
    totalCount: 0,
    currentPage: 1,
    itemsPerPage: 10,
    isLoading: false,
    error: null,
    filters: {
        searchText: '',
        contentId: '',
        type: '',
    },
};

// Async thunk for fetching contents
export const fetchcontents = createAsyncThunk<
    contentListData,
    FetchcontentsParams,
    { rejectValue: string }
>(
    'content/fetchcontent',
    async (params, { rejectWithValue }) => {
        try {
            const response = await apiService.get<contentListResponse>(
                '/content/list',
                { params }
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to load contents'
            );
        }
    }
);

// Async thunk for deleting a content
export const deletecontent = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    'content/deletecontent',
    async (contentId, { rejectWithValue }) => {
        try {
            await apiService.delete(`/content/${contentId}`);
            return contentId;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete content'
            );
        }
    }
);

const contentSlice = createSlice({
    name: 'contents',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setFilters: (
            state,
            action: PayloadAction<Partial<contentState['filters']>>
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
            // Fetch contents
            .addCase(fetchcontents.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchcontents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.contents = action.payload.list;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchcontents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'An error occurred';
                state.contents = [];
            })
            // Delete content
            .addCase(deletecontent.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deletecontent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.contents = state.contents.filter(
                    (content) => content.contentId !== action.payload
                );
                state.totalCount = Math.max(0, state.totalCount - 1);
            })
            .addCase(deletecontent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete content';
            });
    },
});

export const { setCurrentPage, setFilters, resetFilters } = contentSlice.actions;
export default contentSlice.reducer;