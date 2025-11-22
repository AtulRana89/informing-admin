import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ConferencesPage from "./pages/Conferences/Conferences";
import NewConferencesForm from "./pages/Conferences/createConferences";
import Dashboard from "./pages/Dashboard";
import JournalsPage from "./pages/Journals/Journals";
import NewJournalForm from "./pages/Journals/createJournals";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import TemplateAndEmail from "./pages/TemplateAndEmail";
import SubTopicsPage from "./pages/Topics/SubTopics";
import TopicHeader from "./pages/Topics/TopicHeader";
import TopicsPage from "./pages/Topics/Topics";
import SubTopicForm from "./pages/Topics/addSubTopic";
import TopicForm from "./pages/Topics/addTopic";
import TrackTypeHeader from "./pages/Tracks-Types/TrackTypeHeader";
import Tracks from "./pages/Tracks-Types/Tracks";
import Type from "./pages/Tracks-Types/Type";
import TrackForm from "./pages/Tracks-Types/addTrack";
import TypeForm from "./pages/Tracks-Types/addType";
import Users from "./pages/Users/Users";
import CreateUser from "./pages/createUser";
import AcademicInfo from "./pages/profile/AcademicInfo";
import AccountInfo from "./pages/profile/AccountInfo";
import Notepad from "./pages/profile/Notepad";
import PersonalInfo from "./pages/profile/PersonalInfo";
import Preferences from "./pages/profile/Preferences";
import Profile from "./pages/profile/Profile";
import Topics from "./pages/profile/Topics";

// Profile subpages

const App: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem("authToken")); // Replace with real auth logic

  return (
    <Router basename="/admin">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Layout Routes */}
        <Route
          path="/"
          element={
            isAuthenticated || true ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/create" element={<CreateUser />} />

          {/* Profile Routes */}
          <Route path="profile" element={<Profile />}>
            {/* 👇 This acts as the default route for /profile */}
            <Route index element={<Navigate to="personal-info" replace />} />
            {/* <Route index element={<PersonalInfo />} /> */}

            <Route path="personal-info" element={<PersonalInfo />} />
            <Route path="account-info" element={<AccountInfo />} />
            <Route path="academic-info" element={<AcademicInfo />} />
            <Route path="topics" element={<Topics />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="notepad" element={<Notepad />} />
          </Route>

          <Route path="topic" element={<TopicHeader />}>
            {/* 👇 This acts as the default route for /profile */}
            <Route index element={<Navigate to="topics-page" replace />} />
            {/* <Route index element={<PersonalInfo />} /> */}

            <Route path="topics-page" element={<TopicsPage />} />
            <Route path="sub-topics" element={<SubTopicsPage />} />
          </Route>
          <Route path="create-topic" element={<TopicForm />} />
          <Route path="create-subtopic" element={<SubTopicForm />} />

          <Route path="track-type" element={<TrackTypeHeader />}>
            {/* 👇 This acts as the default route for /profile */}
            <Route index element={<Navigate to="track" replace />} />
            {/* <Route index element={<PersonalInfo />} /> */}

            <Route path="track" element={<Tracks />} />
            <Route path="type" element={<Type />} />
          </Route>
          <Route path="create-track" element={<TrackForm />} />
          <Route path="create-type" element={<TypeForm />} />

          <Route path="journals" element={<JournalsPage />} />
          <Route path="journals/create" element={<NewJournalForm />} />

          <Route path="conferences" element={<ConferencesPage />} />
          <Route path="conferences/create" element={<NewConferencesForm />} />
          <Route
            path="tempelate-email-setting"
            element={<TemplateAndEmail />}
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
