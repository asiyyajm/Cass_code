
# Code Sharing Platform - Blue-footed Booby
This project is completed for CSC260 at Union College. The goal of the project is to implement a large scale software project in a team environment. The project is a code sharing platform. Teachers can create classes & assignments and add students to them. In groups, students can upload code to assignments and comment on other assignments within their group. In effect, it is a code sharing platform for students to share their code with each other and comment on each other's code to receive feedback.

# Running the Project

## Frontend

To run the frontend, navigate to the `frontend` directory and run the following commands:

```bash
npm install
npm run dev
```

This will start the frontend development server, and you can access the application at `http://localhost:5173`.

## Backend

For the backend, navigate to the `backend` directory and run the following commands:

```bash
pip install django django-cors-headers djangorest-framework
python manage.py runserver
```

# Using the Project
To use the project, go to http://localhost:5173. It should take you to the login page.

As a student, you can sign in using `elodie@union.edu`. With this student, you can view 2 classes. To see the assignments, press the "select class" button.

The `Current Assignment` has a group of 4 where 2 of them have submitted code. To view the code, click on the file name.

To make a new submission, logout using the button in the top right and log in using `anders@union.edu`. Navigate back to the `Current Assignment` page and then press "submit assignment" on the left side. Upload a file and press "submit" on the bottom.

To add and view comments, click into a submission and then click on highlighted lines to view comments. Furthermore, select a line to make a comment and use the text box on the bottom to submit.

As an instructor, you can sign in using `mcgonagall@union.edu`. This will take you to a similar page. To create a new class, fill out the form at the top. To add an assignment, click the "Add assignment" button at the top and fill out the form.

**Make sure to select dates! You will get an error if you don't manually input each date.**

Similarly, you can view assignments and user submissions, and make comments as detailed above.

# Project Structure

## Frontend
The frontend is built using React and Vite. The main components are located in the `src` directory, with the following structure:
```
src/
components/  # Contains reusable components
hooks/ # Contains the authentication hook
styles/ # Contains global styles
app.jsx # Contains routing logic
```

## Backend
The backend is built using Django and Django REST Framework. The main components are located in the `backend` directory.
