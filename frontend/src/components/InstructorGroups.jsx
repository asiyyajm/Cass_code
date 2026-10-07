import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/InstructorGroups.css";


function InstructorGroups() {
    const navigate = useNavigate();
    const { user } = useLocalAuth();


    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [groups, setGroups] = useState([]);
    const [editingGroupId, setEditingGroupId] = useState(null);

    useEffect(() => {
        if (!user || !user.id) {
            return;
        }

        fetchClasses();
    }, [user]);

    const fetchClasses = async () => {
        try {
            const response = await fetch(
                "http://localhost:8000/api/classes/?teacher=" + user.id
            );

            if (!response.ok) {
                throw new Error("Could not load classes");
            }

            const data = await response.json();
            setClasses(data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading classes:", err);
            setError("Could not load your classes.");
            setLoading(false);
        }
    };

    const fetchAssignmentsForClass = async (classId) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/classes/${classId}/assignments/`
            );

            if (!response.ok) {
                throw new Error("Could not load assignments");
            }

            const data = await response.json();
            setAssignments(data);
        } catch (err) {
            console.error("Error loading assignments:", err);
            setError("Could not load assignments for this class.");
        }
    };

    const fetchRosterForClass = async (classId) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/classes/${classId}/roster/`
            );

            if (!response.ok) {
                throw new Error("Could not load roster");
            }

            const data = await response.json();
            setStudents(data);
        } catch (err) {
            console.error("Error loading roster:", err);
            setError("Could not load students for this class.");
        }
    };

    const handleStudentCheckbox = (studentId) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(
                selectedStudentIds.filter((id) => id !== studentId)
            );
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        }
    };

    const createGroup = async () => {
        if (!selectedAssignmentId) {
            setError("Please choose an assignment first.");
            return;
        }

        if (selectedStudentIds.length === 0) {
            setError("Please select at least one student.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/api/assignments/${selectedAssignmentId}/groups/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        students: students
                            .filter((student) => selectedStudentIds.includes(student.id))
                            .map((student) => student.email),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Could not create group");
            }

            if (editingGroupId) {
                await deleteGroup(editingGroupId);
                setEditingGroupId(null);
            } else {
                fetchGroupsForAssignment(selectedAssignmentId);
            }

            setSelectedStudentIds([]);
            setError("");
        } catch (err) {
            console.error("Error creating group:", err);
            setError("Could not create group.");
        }
    };

    const fetchGroupsForAssignment = async (assignmentId) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/assignments/${assignmentId}/groups/`
            );

            if (!response.ok) {
                throw new Error("Could not load groups");
            }

            const data = await response.json();
            setGroups(data);
        } catch (err) {
            console.error("Error loading groups:", err);
            setError("Could not load groups for this assignment.");
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/groups/${groupId}/`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Could not delete group");
            }

            fetchGroupsForAssignment(selectedAssignmentId);
        } catch (err) {
            console.error("Error deleting group:", err);
            setError("Could not delete group.");
        }
    };

    const startEditingGroup = (group) => {
        const studentIdsInGroup = group.users.map((student) => student.id);

        setSelectedStudentIds(studentIdsInGroup);
        setEditingGroupId(group.id);
    };





    if (loading) {
        return <p>Loading groups page...</p>;
    }

    return (
        <div className="groups-page">
            <h1>Manage Groups</h1>

            {/* <button onClick={() => navigate("/instructors/homepage")}>
                Back to Homepage
            </button> */}

            {error && <p className="groups-error">{error}</p>}

            <div className="groups-card">
                <label>Select a class:</label>

                <select
                    value={selectedClassId}
                    onChange={(e) => {
                        const classId = e.target.value;
                        setSelectedClassId(classId);
                        setSelectedAssignmentId("");
                        setAssignments([]);
                        setStudents([]);
                        setSelectedStudentIds([]);

                        if (classId) {
                            fetchAssignmentsForClass(classId);
                            fetchRosterForClass(classId);
                        }
                    }}
                >
                    <option value="">Choose a class</option>

                    {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                            {classItem.code} - {classItem.name}
                        </option>
                    ))}
                </select>
                {selectedClassId && (
                    <div>
                        <label>Select an assignment:</label>

                        <select
                            value={selectedAssignmentId}
                            onChange={(e) => {
                                const assignmentId = e.target.value;

                                setSelectedAssignmentId(assignmentId);
                                setGroups([]);

                                if (assignmentId) {
                                    fetchGroupsForAssignment(assignmentId);
                                }
                            }}
                        >
                            <option value="">Choose an assignment</option>

                            {assignments.map((assignment) => (
                                <option key={assignment.id} value={assignment.id}>
                                    {assignment.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {selectedClassId && students.length > 0 && (
                    <div>
                        <h2>Students in this class</h2>
                        {students.map((student) => (
                            <label key={student.id}>

                                <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onChange={() => handleStudentCheckbox(student.id)}
                                />
                                {" "}
                                {student.first_name} - {student.email}
                            </label>
                        ))}
                        <button onClick={createGroup}>
                            {editingGroupId ? "Save Group Changes" : "Create Group"}
                        </button>
                    </div>

                )}

                {selectedAssignmentId && (
                    <div>
                        <h2>Groups for this assignment</h2>

                        {groups.length === 0 && (
                            <p>No groups have been created yet.</p>
                        )}

                        {groups.map((group, index) => (
                            <div key={group.id}>
                                <h3>Group {index + 1}</h3>

                                {group.users.map((student) => (
                                    <p key={student.id}>
                                        {student.first_name} - {student.email}
                                    </p>
                                ))}

                                <button onClick={() => deleteGroup(group.id)}>
                                    Delete Group
                                </button>
                                <button onClick={() => startEditingGroup(group)}>
                                    Edit Group
                                </button>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default InstructorGroups;