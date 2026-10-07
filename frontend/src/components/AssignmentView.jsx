import React from "react";
import "../styles/AssignmentView.css";
import { useNavigate, useParams } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";

export const AssignmentView = ({ isTeacher }) => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useLocalAuth();

  const [assignment, setAssignment] = React.useState(null);
  const [group, setGroup] = React.useState([]);
  const [allGroups, setAllGroups] = React.useState([]);
  const [roster, setRoster] = React.useState([]);
  const [dueDate, setDueDate] = React.useState("");
  const [submissions, setSubmissions] = React.useState(null);

  React.useEffect(() => {
    if (!user || !user.id) return;
    const fetchAssignment = async () => {
      try {
        const userParam = isTeacher ? "teacher" : "student";
        const resp = await fetch(
          `http://localhost:8000/api/assignments/${assignmentId}/?${userParam}=${user.id}`,
        );
        const data = await resp.json();
        if (resp.ok) {
          console.log("Assignment data:", data);
          setAssignment(data);
          setDueDate(new Date(data.submission_deadline).toLocaleDateString());

          if (isTeacher && data.course) {
            try {
              const rosterResp = await fetch(
                `http://localhost:8000/api/classes/${data.course}/roster/`
              );
              const rosterData = await rosterResp.json();
              setRoster(rosterData);
            } catch (err) {
              console.error("Error fetching roster:", err);
            }
          }
        } else {
          console.error("Failed to fetch assignment:", data);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    const fetchGroup = async () => {
      try {
        // Always fetch all groups (no student filter) so both views have the full group structure
        const resp = await fetch(
          `http://localhost:8000/api/assignments/${assignmentId}/groups/`,
        );
        const data = await resp.json();

        console.log("Group data:", data);

        if (resp.ok && data.length > 0 && data[0].users) {
          setAllGroups(data);
        } else {
          setAllGroups([]);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const resp = await fetch(
          `http://localhost:8000/api/assignments/${assignmentId}/submissions/`,
        );
        const data = await resp.json();
        console.log("Submissions data:", data);
        if (resp.ok) {
          setSubmissions(data);
        } else {
          console.error("Failed to fetch submissions:", data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchAssignment();
    fetchGroup();
    fetchSubmissions();
  }, [user, isTeacher, assignmentId]);

  if (!assignment) {
    return (
      <div>
        <h2>Loading assignment...</h2>
      </div>
    );
  }

  const userSubmission = submissions
    ? submissions.find((s) => s.user === user.id)
    : null;

  const getReturnPath = () => {
    return isTeacher ? "/instructors/homepage" : "/students/homepage";
  };

  const getSubmissionPath = (submissionId) => {
    const basePath = isTeacher ? "/instructors" : "/students";
    return `${basePath}/assignments/${assignmentId}/submissions/${submissionId}`;
  };

  const getSubmitPath = () => {
    return `/students/assignments/${assignmentId}/submissions/submit`;
  };

  return (
    <div className="student-assignment-container">
      <header className="student-assignment-header">
        <div>
          <h1>{isTeacher ? "Instructor" : "Student"} Assignment Page</h1>
          <h2>{assignment.name}</h2>
        </div>
        {/* <button
          className="return-button"
          onClick={() => navigate(getReturnPath())}
        >
          Return to Home
        </button> */}
      </header>

      <div className="student-assignment-content">
        {!isTeacher && (
          <div className="assignment-actions">
            <button
              className="view-button"
              onClick={() => {
                if (userSubmission) {
                  navigate(getSubmissionPath(userSubmission.id));
                } else {
                  navigate(getSubmitPath());
                }
              }}
            >
              {userSubmission ? "View My Submission" : "Submit Assignment"}
            </button>
            <span className="due-date">Due date: {dueDate}</span>
          </div>
        )}

        <h3>Submissions</h3>
        {submissions !== null && allGroups.length > 0 && (() => {
          const submittedUserIds = new Set(submissions.map((s) => s.user));
          const submittedGroupsCount = allGroups.filter((g) =>
            g.users && g.users.some((m) => submittedUserIds.has(m.id))
          ).length;
          const totalGroups = allGroups.length;
          return (
            <p className="submission-count">
              <strong>{submittedGroupsCount}</strong> of <strong>{totalGroups}</strong> group{totalGroups !== 1 ? "s" : ""} submitted
            </p>
          );
        })()}
        {submissions !== null && allGroups.length === 0 && (
          <p className="submission-count">
            {isTeacher ? (
              <><strong>{submissions.length}</strong> of <strong>{roster.length}</strong> student{roster.length !== 1 ? "s" : ""} submitted</>
            ) : (
              <><strong>{submissions.filter((s) => s.user !== user.id).length}</strong> submission{submissions.filter((s) => s.user !== user.id).length !== 1 ? "s" : ""} available to comment on</>
            )}
          </p>
        )}

        {allGroups.length > 0 ? (
          allGroups.map((grp, grpIndex) => (
            <div key={grp.id ?? grpIndex} style={{ marginBottom: "1.5rem" }}>
              <h4>Group {grpIndex + 1}</h4>
              <table className="group-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Submission</th>
                  </tr>
                </thead>
                <tbody>
                  {grp.users && grp.users.map((member, memberIndex) => {
                    const submission = submissions
                      ? submissions.find((s) => s.user === member.id)
                      : null;
                    const isOwnRow = member.id === user.id;
                    const displayName = isTeacher
                      ? member.name
                      : isOwnRow
                      ? "You"
                      : `Student ${grpIndex * (grp.users?.length ?? 0) + memberIndex + 1}`;
                    return (
                      <tr
                        key={member.id}
                        onClick={() => {
                          if (!submission) {
                            if (isTeacher) alert("No submission found for this member.");
                            return;
                          }
                          navigate(getSubmissionPath(submission.id));
                        }}
                        style={{ cursor: submission ? "pointer" : "default" }}
                      >
                        <td>{displayName}</td>
                        <td>
                          {submission
                            ? submission.files && submission.files.length > 0
                              ? submission.files[0].name
                              : "Submitted"
                            : "No submission"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <table className="group-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submission</th>
              </tr>
            </thead>
            <tbody>
              {isTeacher
                ? roster.map((student) => {
                    const submission = submissions
                      ? submissions.find((s) => s.user === student.id)
                      : null;
                    return (
                      <tr
                        key={student.id}
                        onClick={() => {
                          if (!submission) return;
                          navigate(getSubmissionPath(submission.id));
                        }}
                        style={{ cursor: submission ? "pointer" : "default" }}
                      >
                        <td>{student.name}</td>
                        <td>
                          {submission
                            ? submission.files && submission.files.length > 0
                              ? submission.files[0].name
                              : "Submitted"
                            : "No submission"}
                        </td>
                      </tr>
                    );
                  })
                : submissions &&
                  submissions
                    .filter((s) => s.user !== user.id)
                    .map((submission, index) => (
                      <tr
                        key={submission.id}
                        onClick={() => navigate(getSubmissionPath(submission.id))}
                        style={{ cursor: "pointer" }}
                      >
                        <td>Student {index + 1}</td>
                        <td>
                          {submission.files && submission.files.length > 0
                            ? submission.files[0].name
                            : "Submitted"}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
