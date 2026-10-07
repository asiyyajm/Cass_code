export const MOCK_USER_1 = {
  username: "test_user",
  isTeacher: false,
};

export const MOCK_SUBMISSION_USER = {
  username: "Person B",
  id: "submission456",
  fileName: "example.js",
  fileContent: `
    function Test() {
      console.log("Test");
    }
  `,
};

export const MOCK_SUBMISSION = {
  username: "test_user",
  id: "submission123",
  fileName: "valid_song.js",
  fileContent: `
  /**
 * Author Nick DeBaise
 * This file contains a function that checks if a given song (string of notes) is valid
 */

// Sets up the valid types of notes that we can expect
const invalidNotes = ["B#", "Cb", "E#", "Fb"];
const validNotes = ["A", "B", "C", "D", "E", "F", "G"].flatMap((note) => {
    return [note, note + "b", note + "#"];
}).filter((note) => !invalidNotes.includes(note));

/**
 * Returns a boolean indicating whether the song is a valid sequence of notes
 * @param song the song to check
 * @returns {boolean} true if all the notes are valid, false otherwise
 */
const validSong = (song) => {
    const trimmedSong = song.trim();
    if(trimmedSong === "") return false;

    const notes = trimmedSong.split(" ");

    for (let note of notes) {
        if(note === "") continue;

        if(!validNotes.includes(note)) {
            return false;
        }
    }

    return true;
};

export {validSong};
  `,
};

export const MOCK_ASSIGNMENT = {
  id: "assignment456",
  title: "Mock Assignment Title",
};

export const MOCK_CLASS = {
  id: "class789",
  name: "Mock Class Name",
};

export const MOCK_COMMENTS_FOR_SUBMISSION = [
  {
    line: 1,
    content: "This is a comment on line 1 of the submission.",
    author: "test-user-1",
  },
  {
    line: 2,
    content: "This is a comment on line 2 of the submission.",
    author: "test-user-2",
  },
  {
    line: 3,
    content: "This is a comment on line 3 of the submission.",
    author: "test-user-3",
  },
];

export const MOCK_GROUP = [
  {
    name: "Person A",
    submissionId: null,
  },
  {
    name: "Person B",
    submissionId: "submission456",
  },
  {
    name: "Person C",
    submissionId: null,
  },
];

export const SUBMISSIONS = {
  submission456: MOCK_SUBMISSION_USER,
  submission123: MOCK_SUBMISSION,
};
