import React, { useEffect } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/Homepage.css";

export const StudentHomepage = () => {
  const { user } = useLocalAuth();
  const [assignments, setAssignments] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const [selectedClass, setSelectedClass] = React.useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchClasses = async () => {
      console.log(user);
      try {
        const resp = await fetch(
          "http://localhost:8000/api/classes/?student=" + user.id,
        );
        const data = await resp.json();
        console.log(data);
        if (resp.ok) {
          setClasses(data);
        } else {
          console.error("Failed to fetch classes:", data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;

    if (!selectedClass) return;

    console.log("Fetching assignments for class:", selectedClass);

    const fetchAssignments = async () => {
      try {
        const resp = await fetch(
          `http://localhost:8000/api/classes/${selectedClass}/assignments/?student=${user.id}`,
        );

        const data = await resp.json();
        console.log(data);
        if (resp.ok) {
          setAssignments(data);
        } else {
          console.error("Failed to fetch assignments:", data);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [selectedClass, user]);

  return (
    <div className="homepage-container">
      <h1>Welcome to the Student Homepage</h1>
      <p>This is where students can view their assignments and submissions.</p>
      <section>
        <h2>Your Classes</h2>
        <ul>
          {classes.map((classItem) => (
            <li key={classItem.id} >
              <h3>{classItem.name}</h3>
              <p>{classItem.description}</p>
              <button className="assignment-button"
                onClick={() => setSelectedClass(classItem.id)}
                disabled={selectedClass === classItem.id}
              >
                {selectedClass === classItem.id ? "Selected" : "Select Class"}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Your Assignments</h2>
        {assignments?.length === 0 && (
          <p>No assignments available for the selected class.</p>
        )}
        <ul>
          {assignments
            .sort((a, b) => {
              return (
                new Date(a.submission_deadline) -
                new Date(b.submission_deadline)
              );
            })
            .map((assignment) => (
              <li key={assignment.id}>
                <h3>{assignment.name}</h3>
                <p>{assignment.description}</p>
                <p>
                  Release Date:{" "}
                  {new Date(assignment.release_date).toLocaleDateString()}
                </p>
                <p>
                  Submission Deadline:{" "}
                  {new Date(
                    assignment.submission_deadline,
                  ).toLocaleDateString()}
                </p>
                <p>
                  Commenting Deadline:{" "}
                  {new Date(
                    assignment.commenting_deadline,
                  ).toLocaleDateString()}
                </p>
                <div>
                  <a href={`/students/assignments/${assignment.id}`}>
                    <button className="assignment-button">
                      View Assignment
                    </button>
                  </a>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
};
