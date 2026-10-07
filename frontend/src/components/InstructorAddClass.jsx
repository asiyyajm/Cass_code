import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/InstructorAddClass.css";

export const InstructorAddClass = () => {
  const { user } = useLocalAuth();
  const navigate = useNavigate();

  const [newClass, setNewClass] = useState({
    code: "",
    name: "",
    term: "",
    year: new Date().getFullYear(),
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewClass((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();

    if (
      !newClass.code.trim() ||
      !newClass.name.trim() ||
      !newClass.term.trim()
    ) {
      setError("Code, name, and term are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:8000/api/classes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: newClass.code,
          name: newClass.name,
          term: newClass.term,
          year: parseInt(newClass.year),
          start_date: newClass.start_date,
          end_date: newClass.end_date,
          teacher: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create class");
      }

      navigate("/instructors/homepage");
    } catch (err) {
      console.error("Error creating class:", err);
      setError("Could not add new class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h1>Add Class</h1>

        {/* <button
          className="return-button"
          onClick={() => navigate("/instructors/homepage")}
        >
          Return Home
        </button> */}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="assignment-form" onSubmit={handleAddClass}>
        <div className="form-group">
          <label htmlFor="code">Code: </label>
          <input
            id="code"
            type="text"
            name="code"
            placeholder="e.g. CSC 107"
            value={newClass.code}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Name: </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g. Creative Computing"
            value={newClass.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="term">Term: </label>
          <select
            id="term"
            name="term"
            value={newClass.term}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Term</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="year">Year: </label>
          <input
            id="year"
            type="number"
            name="year"
            value={newClass.year}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date: </label>
          <input
            id="start_date"
            type="date"
            name="start_date"
            value={newClass.start_date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date: </label>
          <input
            id="end_date"
            type="date"
            name="end_date"
            value={newClass.end_date}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating..." : "Create Class"}
        </button>
      </form>
    </div>
  );
};