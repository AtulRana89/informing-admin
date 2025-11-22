import { configureStore } from '@reduxjs/toolkit';
import conferenceReducer from './conferenceSlice';
import journalReducer from './journalSlice';
import userReducer from './userSlice';
import trackReducer from './trackSlice';
import typeReducer from './typeSlice';
import topicReducer from './topicSlice';
import subTopicReducer from './subTopicSlice';
export const store = configureStore({
  reducer: {
    conferences: conferenceReducer,
    journals: journalReducer,
    users: userReducer,
    track:trackReducer,
    type:typeReducer,
    topic:topicReducer,
    subtopic:subTopicReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;