import React, { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Comments } from "./comments";
import { useParams } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";
import "../styles/submission.css";

// Determine language based on file extension
const getLanguage = (filename) => {
  if (!filename) return "text";
  const extension = filename.split(".").pop().toLowerCase();
  const languageMap = {
    js: "javascript",
    jsx: "jsx",
    py: "python",
    java: "java",
    html: "html",
    css: "css",
    cpp: "cpp",
    c: "c",
  };
  return languageMap[extension] || "text";
};

/**
 * SubmissionView component displays an existing submission with its details and comments.
 */
export const SubmissionView = () => {
  const { submissionId, assignmentId } = useParams();
  const { user } = useLocalAuth();

  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [comments, setComments] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [selectedLineForComment, setSelectedLineForComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOwnSubmission = user && !user.is_teacher && submission && submission.user === user.id;
  const isPastCommentingDeadline = assignment && new Date() > new Date(assignment.commenting_deadline);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const submissionsResp = await fetch(
          `http://localhost:8000/api/assignments/${assignmentId}/submissions/`,
        );

        if (!submissionsResp.ok) {
          throw new Error(
            `Failed to fetch submissions: ${submissionsResp.statusText}`,
          );
        }

        const submissionsData = await submissionsResp.json();

        const targetSubmission = submissionsData.find(
          (sub) => sub.id === parseInt(submissionId),
        );

        if (!targetSubmission) {
          throw new Error(`Submission with ID ${submissionId} not found`);
        }

        console.log("Target submission data:", targetSubmission);

        setSubmission(targetSubmission);

        if (targetSubmission.files && targetSubmission.files.length > 0) {
          setFileName(targetSubmission.files[0].name);
          setFileContent(targetSubmission.files[0].content);
        }

        if (targetSubmission.comments) {
          setComments(targetSubmission.comments);
        }

        const assignmentResp = await fetch(
          `http://localhost:8000/api/assignments/${assignmentId}/`,
        );

        if (!assignmentResp.ok) {
          throw new Error(
            `Failed to fetch assignment: ${assignmentResp.statusText}`,
          );
        }

        const assignmentData = await assignmentResp.json();
        setAssignment(assignmentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && submissionId) {
      fetchData();
    }
  }, [assignmentId, submissionId]);

  const language = getLanguage(fileName);

  const commentsByLine = comments.reduce((acc, comment) => {
    const lineNumber = comment.line_number;
    if (!acc[lineNumber]) {
      acc[lineNumber] = [];
    }
    acc[lineNumber].push(comment);
    return acc;
  }, {});

  const handleLineClick = (lineNumber) => {
    if (isOwnSubmission) {
      return;
    }

    if (selectedLine === lineNumber) {
      setSelectedLine(null);
      setSelectedLineForComment(null);
    } else {
      setSelectedLine(lineNumber);
      setSelectedLineForComment(lineNumber);
    }
  };

  const toggleAllComments = () => {
    setShowAllComments(!showAllComments);
    if (!showAllComments) {
      setSelectedLine(null);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!selectedLineForComment) {
      alert("Please select a line to comment on.");
      return;
    }

    try {
      const fileId =
        submission.files && submission.files.length > 0
          ? submission.files[0].id
          : null;

      const comment = {
        submission: submissionId,
        user: user.id,
        comment: newComment,
        comment_type: selectedLineForComment ? "file" : "general",
        line_number: selectedLineForComment || null,
        submission_file: fileId,
      };

      const resp = await fetch("http://localhost:8000/api/addcomment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      });

      if (resp.ok) {
        const newCommentData = await resp.json();

        const updatedComments = [...comments, newCommentData];
        setComments(updatedComments);
        setNewComment("");

        if (newCommentData.line_number) {
          const lineNum = newCommentData.line_number;
          if (!commentsByLine[lineNum]) {
            commentsByLine[lineNum] = [];
          }
          commentsByLine[lineNum].push(newCommentData);
        }
      } else {
        throw new Error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    }
  };

  const linesWithComments = Object.keys(commentsByLine).map(Number);

  if (loading) {
    return <div>Loading submission...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!submission || !assignment) {
    return <div>Submission not found</div>;
  }

  return (
    <div className="submission-wrapper">
      <div className="submission">
        <h2>
          {isOwnSubmission
            ? "Your Submission"
            : user && !user.is_teacher
            ? "Anonymous Submission"
            : `Submission by User ${submission.user}`}
        </h2>
        <p>
          Assignment: {assignment.name} (ID: {assignment.id})
        </p>
        <p>Submission ID: {submission.id}</p>
        <p>File Name: {fileName}</p>

        {fileContent && (
          <button className="submit-button" onClick={toggleAllComments}> 
            {showAllComments ? "Hide All Comments" : "Show All Comments"}
          </button>
        )}

        <div className="code-container">
          {fileContent && (
            <SyntaxHighlighter
              lineProps={(lineNumber) => {
                const hasComments = linesWithComments.includes(lineNumber);
                const isSelected = selectedLine === lineNumber;
                return {
                  style: {
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "rgba(255, 210, 0, 0.2)"
                      : hasComments
                        ? "rgba(255, 255, 0, 0.1)"
                        : "transparent",
                  },
                  onClick() {
                    handleLineClick(lineNumber);
                  },
                };
              }}
              wrapLongLines={true}
              showLineNumbers={true}
              language={language}
              style={docco}
            >
              {fileContent}
            </SyntaxHighlighter>
          )}
        </div>
        
        {isOwnSubmission ? (
        <p>End of submission</p>
        ) : isPastCommentingDeadline ? (
        <p>The commenting deadline has passed. No new comments can be submitted.</p>
        ) : (
        <div className="comment-form">
          <h3>
            Add Comment{" "}
            {selectedLineForComment
              ? `(Line ${selectedLineForComment})`
              : "(Select Line to Comment)"}
          </h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            rows={4}
          />
          <div>
            <button className="submit-button" onClick={handleAddComment}>Submit Comment</button>
            {selectedLineForComment && (
              <button onClick={() => setSelectedLineForComment(null)}>
                Cancel Line Selection
              </button>
            )}
          </div>
        </div>
      )}
        
      </div>

      <Comments
        showAllComments={showAllComments}
        selectedLine={selectedLine}
        commentsByLine={commentsByLine}
        user={user}
      />
    </div>
  );
};
