import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import "./app.css";

import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StudentHomepage } from "./components/StudentHomepage";
import { InstructorHomepage } from "./components/InstructorHomepage";
import { AssignmentView } from "./components/AssignmentView";
import { SubmissionView } from "./components/submission";
import { InstructorAddAssignmentView } from "./components/InstructorAddAssignmentView";
import { InstructorAddClass } from "./components/InstructorAddClass";
import InstructorGroups from "./components/InstructorGroups";
import { InstructorReport } from "./components/InstructorReport";
import { Layout } from "./components/Layout";
import { SubmitFile } from "./components/submitFile";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/students"
          element={
            <ProtectedRoute requiredRole="student">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="homepage" replace />} />
          <Route path="homepage" element={<StudentHomepage />} />
          <Route
            path="assignments/:assignmentId"
            element={<AssignmentView />}
          />
          <Route
            path="assignments/:assignmentId/submissions/:submissionId"
            element={<SubmissionView />}
          />
          <Route
            path="assignments/:assignmentId/submissions/submit"
            element={<SubmitFile />}
          />
        </Route>

        <Route
          path="/instructors"
          element={
            <ProtectedRoute requiredRole="instructor">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="homepage" replace />} />
          <Route path="homepage" element={<InstructorHomepage />} />
          <Route
            path="classes/add"
            element={<InstructorAddClass />}
            />
          <Route
            path="assignments/add"
            element={<InstructorAddAssignmentView />}
          />
          <Route 
            path="groups"
            element={<InstructorGroups />} />
          <Route
            path="/instructors/report"
            element= {<InstructorReport/>}
          />
          <Route
            path="assignments/:assignmentId"
            element={<AssignmentView isTeacher={true} />}
          />
          <Route
            path="assignments/:assignmentId/submissions/:submissionId"
            element={<SubmissionView />}
          />
        </Route>
      </Routes>
    </Router>
  );
};
