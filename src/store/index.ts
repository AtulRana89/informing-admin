import { configureStore } from '@reduxjs/toolkit';
import conferenceReducer from './conferenceSlice';
import faqReducer from './faqSlice';
import journalReducer from './journalSlice';
import subTopicReducer from './subTopicSlice';
import topicReducer from './topicSlice';
import trackReducer from './trackSlice';
import typeReducer from './typeSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    conferences: conferenceReducer,
    journals: journalReducer,
    users: userReducer,
    track: trackReducer,
    type: typeReducer,
    topic: topicReducer,
    subtopic: subTopicReducer,
    faq: faqReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;