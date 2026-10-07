import React from "react";
import "../styles/submission.css";

/**
 * Comments component displays code comments in a sidebar
 * @param {boolean} showAllComments - Whether to show all comments or just selected line
 * @param {number|null} selectedLine - The currently selected line number
 * @param {Object} commentsByLine - Comments organized by line number
 * @param {Object} user - User information
 */
export const Comments = ({
  showAllComments,
  selectedLine,
  commentsByLine,
  user,
}) => {
  const linesWithComments = Object.keys(commentsByLine).map(Number);

  if (!Object.keys(commentsByLine).length) {
    return null;
  }

  return (
    <div className="comments-sidebar">
      {showAllComments ? (
        <div className="all-comments">
          <h3>All Comments</h3>
          {linesWithComments.map((lineNumber) => (
            <div key={lineNumber} className="comment-group">
              <h4>Line {lineNumber}</h4>
              {commentsByLine[lineNumber].map((comment, idx) => (
                <div key={idx} className="comment">
                  <p className="comment-author">
                    AnonymousCommenter
                  </p>
                  <p className="comment-content">{comment.comment}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        selectedLine &&
        commentsByLine[selectedLine] && (
          <div className="line-comments selected">
            <h4>Line {selectedLine}</h4>
            {commentsByLine[selectedLine].map((comment, idx) => (
              <div key={idx} className="comment">
                <p className="comment-author">
                  AnonymousCommenter
                </p>
                <p className="comment-content">{comment.comment}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
