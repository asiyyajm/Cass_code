import React, { useState, useEffect } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/Homepage.css";

export const InstructorReport = () => {
  const { user } = useLocalAuth();

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.id) return;
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/assignments/?teacher=" + user.id
      );
      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      setError("Could not load assignments.");
    }
  };

  const handleAssignmentChange = async (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignmentId(assignmentId);
    setError("");

    const assignment = assignments.find(
      (a) => String(a.id) === String(assignmentId)
    );

    setSelectedAssignment(assignment);

    if (!assignment) {
      setStudents([]);
      setSubmissions([]);
      return;
    }

    await loadReportData(assignment);
  };

  const loadReportData = async (assignment) => {
    try {
      setLoading(true);

      const rosterResponse = await fetch(
        `http://localhost:8000/api/classes/${assignment.course}/roster/`
      );
      const rosterData = await rosterResponse.json();

      const submissionsResponse = await fetch(
        `http://localhost:8000/api/assignments/${assignment.id}/submissions/`
      );
      const submissionsData = await submissionsResponse.json();

      setStudents(rosterData);
      setSubmissions(submissionsData);

      console.log("ROSTER", rosterData);
      console.log("SUBMISSIONS", submissionsData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not load report data.");
      setLoading(false);
    }
  };

  const getAllComments = () => {
    return submissions.flatMap((submission) => submission.comments || []);
  };

  const studentSubmitted = (student) => {
    return submissions.some((submission) => submission.user === student.id);
  };

  const commentsMadeByStudent = (student) => {
    const allComments = getAllComments();

    return allComments.filter((comment) => comment.user === student.id).length;
  };

  const commentsReceivedByStudent = (student) => {
    const studentSubmissions = submissions.filter(
      (submission) => submission.user === student.id
    );

    let total = 0;

    studentSubmissions.forEach((submission) => {
      total += submission.comments ? submission.comments.length : 0;
    });

    return total;
  };

  return (
    <div className="instructor-dashboard">
      <main className="homepage-container">
        <h2 className="homepage-header">Assignment Report</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="classes">
          <h3>Select Assignment</h3>

          <select
            value={selectedAssignmentId}
            onChange={handleAssignmentChange}
            className="student-email-box"
          >
            <option value="">Choose an assignment</option>

            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAssignment && (
          <div className="classes">
            <h3>{selectedAssignment.name}</h3>


            {loading ? (
              <p>Loading report...</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Submitted?</th>
                    <th>Comments Made</th>
                    <th>Comments Received</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{studentSubmitted(student) ? "Yes" : "No"}</td>
                      <td>{commentsMadeByStudent(student)}</td>
                      <td>{commentsReceivedByStudent(student)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};