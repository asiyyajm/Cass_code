import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/Homepage.css";

export const InstructorHomepage = () => {
  const { user } = useLocalAuth();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [rosters, setRosters] = useState({});
  const [studentEmails, setStudentEmails] = useState({});
  const [openRosters, setOpenRosters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    if (!user || !user.id) return;
    fetchClasses();
    fetchAssignments();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchClasses = async () => {
    try {
      const classResponse = await fetch(
        "http://localhost:8000/api/classes/?teacher=" + user.id,
      );
      if (!classResponse.ok) throw new Error("Failed to fetch /api/classes/");
      const classData = await classResponse.json();
      console.log("Fetched classes:", classData);

      setClasses(classData);

      for (let i = 0; i < classData.length; i++) {
        fetchRoster(classData[i].id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching classes or assignments:", err);
      setError("Could not load classes and assignments.");
      setLoading(false);
    }
  };

  const fetchRoster = async (classId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/roster/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch roster");
      }
      const rosterData = await response.json();

      setRosters((prev) => ({
        ...prev,
        [classId]: rosterData,
      }));
    } catch (err) {
      console.error("Error fetching roster:", err);
    }
  };

  const toggleRoster = (classId) => {
    setOpenRosters((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const handleStudentEmailChange = (classId, value) => {
    setStudentEmails((prev) => ({
      ...prev,
      [classId]: value,
    }));
  };

  const handleAddStudent = async (classId) => {
    const email = studentEmails[classId];

    if (!email || !email.trim()) {
      setError("Please enter a student email");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/roster/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student: email.trim().toLowerCase(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add student");
      }
      const updatedRoster = await response.json();

      setRosters((prev) => ({
        ...prev,
        [classId]: updatedRoster,
      }));

      setStudentEmails((prev) => ({
        ...prev,
        [classId]: "",
      }));

      setError(null);
    } catch (err) {
      console.error("Error adding student", err);
      setError("Unable to add student. Ensure email ends in @union.edu.");
    }
  };

  const fetchAssignments = async () => {
    try {
      const assignmentResponse = await fetch(
        "http://localhost:8000/api/assignments/?teacher=" + user.id,
      );
      if (!assignmentResponse.ok)
        throw new Error("Failed to fetch /api/assignments/");
      const assignmentData = await assignmentResponse.json();
      console.log("Fetched assignments:", assignmentData);

      setAssignments(assignmentData);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Could not load assignments.");
    }
  };



  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const noClasses = classes.length === 0;

  return (
    <div className="instructor-dashboard">
      <aside className="instructor-side-panel">
        <h3>Instructor Tools</h3>
        <button
          className="side-panel-btn"
          onClick={() => navigate("/instructors/classes/add")}
        >
          Add Class
        </button>
        <button
          className="side-panel-btn"
          onClick={() => navigate("/instructors/assignments/add")}
        >
          Add Assignment
        </button>
        <button
          className="side-panel-btn"
          onClick={() => navigate("/instructors/groups")}
        >
          Create Groups
        </button>
        <button
          className="side-panel-btn"
          onClick={() => navigate("/instructors/report")}
        >
          View Report
        </button>
      </aside>

      <main className="homepage-container">
        <section>
          <h2 className="homepage-header"> Your Classes and Assignments</h2>



          {error && <p style={{ color: "red" }}>{error}</p>}

          {noClasses ? (
            <p>No classes exist yet. Add Class to create one.</p>
          ) : (
            classes.map((cls) => {
              console.log(cls.id, assignments);
              const assignmentsForClass = assignments.filter(
                (assignment) => assignment.course === cls.id,
              );

              const roster = rosters[cls.id] || [];
              const rosterIsOpen = openRosters[cls.id] || false;

              return (
                <div className={"classes"} key={cls.id}>
                  <div>
                    <h3>{cls.name}</h3>
                    <h5>
                      {cls.code} - {cls.term} {cls.year}
                    </h5>
                  </div>

                  <button
                    className="roster-toggle-btn"
                    onClick={() => toggleRoster(cls.id)}
                  >
                    {rosterIsOpen ? "Hide Roster" : "Manage Roster"}

                  </button>
                  {rosterIsOpen && (
                    <div className="roster-panel">
                      <h4>Class Roster</h4>

                      <div className="add-student-row">
                        <input
                          className="student-email-box"
                          type="email"
                          placeholder="student@union.edu"
                          value={studentEmails[cls.id] || ""}
                          onChange={(e) =>
                            handleStudentEmailChange(cls.id, e.target.value)
                          }
                        />

                        <button
                          className="add-student-btn"
                          onClick={() => handleAddStudent(cls.id)}
                        >
                          Add Student
                        </button>
                      </div>

                      {roster.length === 0 ? (
                        <p className="empty-roster-msg">No students added</p>
                      ) : (
                        <ul className="roster-list">
                          {roster.map((student) => (
                            <li className="roster-student" key={student.id}>
                              <span>{student.name}</span>
                              <span>{student.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {assignmentsForClass.length > 0 ? (
                    <ul>
                      {assignmentsForClass.map((assignment) => (
                        <li key={assignment.id}>
                          <Link to={`/instructors/assignments/${assignment.id}`}>
                            {assignment.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No assignments yet for this class.</p>
                  )}
                </div>
              );
            })
          )}
        </section>
        {showBackToTop && (
          <button
            className="floating-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </main>
    </div>
  );
};
