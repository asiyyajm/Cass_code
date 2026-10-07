import React, { useState, useEffect } from "react";
import "../styles/InstructorAddAssignmentView.css";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useNavigate } from "react-router";

export const InstructorAddAssignmentView = () => {
  const { user } = useLocalAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    course: "",
    name: "",
    description: "",
    release_date: "",
    submission_deadline: "",
    commenting_deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/?teacher=${user.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Could not load classes. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course || !formData.name) {
      setError("Please select a class and provide an assignment name.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/assignments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          course: parseInt(formData.course),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create assignment");
      }

      navigate("/instructors");
    } catch (error) {
      console.error("Error creating assignment:", error);
      setError(
        error.message || "Could not create assignment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h1>Add Assignment</h1>
        {/* <button
          className="return-button"
          onClick={() => navigate("/instructors")}
        >
          Return Home
        </button> */}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="assignment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course">Course: </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select a course --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code}: {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Assignment Name: </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description: </label>
          <textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="release_date">Release Date and Time: </label>
          <input
            id="release_date"
            name="release_date"
            type="datetime-local"
            value={formData.release_date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="submission_deadline">Submission Deadline: </label>
          <input
            id="submission_deadline"
            name="submission_deadline"
            type="datetime-local"
            value={formData.submission_deadline}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="commenting_deadline">Commenting Deadline: </label>
          <input
            id="commenting_deadline"
            name="commenting_deadline"
            type="datetime-local"
            value={formData.commenting_deadline}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
};
