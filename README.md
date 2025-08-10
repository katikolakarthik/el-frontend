# Educational Platform Frontend

A React-based frontend application for an educational platform that connects with a Node.js/Express backend. This application provides separate interfaces for administrators and students to manage educational content and track progress.

## Features

### Admin Features
- **Dashboard**: Overview of platform statistics including total students, assignments, submissions, and average progress
- **Student Management**: Add, edit, and delete student records with course and payment information
- **Assignment Management**: Create, edit, and delete assignments with PDF uploads and answer keys
- **Student Progress Tracking**: Monitor individual student performance and submission statistics

### Student Features
- **Dashboard**: Personalized overview of assignments, progress, and recent activity
- **Assignment Viewing**: Browse and download assignment materials
- **Assignment Submission**: Submit answers for assignments with progress tracking
- **Profile Management**: Update personal information, course details, and profile images

## Technology Stack

- **Frontend Framework**: React 19 with Vite
- **UI Components**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **Form Management**: React Hook Form
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend server running on `http://localhost:5000`

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Login with your credentials:
   - **Admin**: Use admin credentials to access the admin dashboard
   - **Student**: Use student credentials to access the student dashboard

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── Dashboard.jsx      # Admin overview dashboard
│   │   ├── Students.jsx       # Student management
│   │   └── Assignments.jsx    # Assignment management
│   ├── student/
│   │   ├── StudentDashboard.jsx   # Student overview
│   │   ├── StudentAssignments.jsx # Assignment viewing/submission
│   │   └── StudentProfile.jsx     # Profile management
│   ├── auth/
│   │   └── Login.jsx          # Authentication component
│   └── Layout.jsx             # Main application layout
├── context/
│   └── AuthContext.jsx        # Authentication state management
├── App.jsx                    # Main application component
└── main.jsx                   # Application entry point
```

## API Endpoints

The frontend communicates with the following backend endpoints:

- **Authentication**: `POST /login`
- **Students**: `GET /admin/students`, `POST /admin/students`, etc.
- **Assignments**: `GET /admin/assignments`, `POST /admin/assignments`, etc.
- **Submissions**: Various submission-related endpoints

## Environment Configuration

Make sure your backend server is running on `http://localhost:5000` or update the API base URL in the components if needed.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development Notes

- The application uses Material-UI components for consistent styling
- Authentication is handled through JWT tokens stored in localStorage
- Protected routes ensure users can only access appropriate sections
- Form validation is implemented using React Hook Form
- File uploads are supported for assignments and profile images

## Troubleshooting

- **CORS Issues**: Ensure your backend has CORS properly configured
- **Authentication Errors**: Check that your backend is running and accessible
- **File Upload Issues**: Verify Cloudinary configuration in your backend
- **Routing Issues**: Ensure all components are properly imported and exported
