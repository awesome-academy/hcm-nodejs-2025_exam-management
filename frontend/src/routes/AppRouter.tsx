import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/guest/HomePage";
import SubjectList from "../pages/guest/SubjectList";
import DoTest from "../pages/user/DoTest";
import TestHistory from "../pages/user/TestHistory";
import TestResultDetail from "../pages/user/TestResultDetail";
import SubjectManagement from "../pages/suppervisor/SubjectManagement";
import QuestionManagement from "../pages/suppervisor/QuestionManagement";
import TestReviewList from "../pages/suppervisor/TestReviewList";
import TestReviewDetail from "../pages/suppervisor/TestReviewDetail";
import RequireRole from "../components/RequireRole";
import GuestLayout from "../layouts/GuestLayout";
import SupervisorLayout from "../layouts/SuppervisorLayout";
import TestManagement from "../pages/suppervisor/TestManagement";
import { ToastContainer } from "react-toastify";
import SubjectDetail from "../pages/user/SubjectDetail";
import TestResultDetailHistory from "../pages/user/TestResultDetailHistory";
import "react-toastify/dist/ReactToastify.css";

const AppRouter = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<GuestLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/tests/:id/do" element={<DoTest />} />
            <Route path="/history" element={<TestHistory />} />
            <Route path="/results/:sessionId" element={<TestResultDetail />} />
            <Route
              path="/results-detail-history/:sessionId"
              element={<TestResultDetailHistory />}
            />
          </Route>

          <Route element={<RequireRole allowed={["suppervisor"]} />}>
            <Route element={<SupervisorLayout />}>
              <Route
                path="/suppervisor/subjects"
                element={<SubjectManagement />}
              />
              <Route
                path="/suppervisor/questions"
                element={<QuestionManagement />}
              />
              <Route
                path="/suppervisor/test-management"
                element={<TestManagement />}
              />

              <Route path="/suppervisor/tests" element={<TestReviewList />} />
              <Route
                path="/suppervisor/tests/:sessionId"
                element={<TestReviewDetail />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AppRouter;
