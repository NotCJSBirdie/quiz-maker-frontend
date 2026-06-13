# Quiz Maker

A React-based Quiz Maker application built as part of the Bookipi Frontend Take-Home Assessment.

## Features

### Quiz Builder

- Create quizzes with a title and description
- Add Multiple Choice questions
- Add Short Answer questions
- Mark correct answers
- Add and remove questions dynamically
- Client-side validation before saving
- Save quizzes to the backend API

### Quiz Player

- Load quizzes by Quiz ID
- Answer Multiple Choice and Short Answer questions
- Submit quiz attempts
- View score and per-question results
- Display expected answers for incorrect responses

### Anti-Cheat (Bonus)

- Track browser tab switches (blur/focus events)
- Track paste actions in answer inputs
- Display an anti-cheat summary after submission

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- TanStack Query v5

### Backend

- Node.js
- Express
- SQLite

## Project Structure

```text
src/
├── api/
│   ├── client.ts
│   └── quizzes.ts
├── hooks/
│   └── antiCheat.ts
├── pages/
│   ├── BuilderPage.tsx
│   └── PlayerPage.tsx
├── types/
│   └── quiz.ts
├── App.tsx
└── main.tsx
```

## Running the Backend

```bash
cd hiring-quiz-maker-backend-main

npm install

npm run seed

npm run dev
```

The backend runs at:

```text
http://localhost:4000
```

## Running the Frontend

```bash
cd quiz-maker-frontend

npm install

npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file in the frontend project:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TOKEN=dev-token
```

## Architecture Decisions

### API Layer

A dedicated API layer was created to centralize communication with the backend and keep page components focused on UI concerns.

### TanStack Query

TanStack Query was used for all server mutations and API interactions, providing a clean separation between client state and server state.

### Local State Management

React state is used for quiz creation, answer management, and result display because the application's state requirements are relatively small and do not require a global state management solution.

### Validation

Validation is performed on the client before submitting data to the backend to provide immediate feedback and reduce unnecessary API requests.

### Anti-Cheat Implementation

The optional anti-cheat feature records:

- Browser tab/window blur events
- Browser tab/window focus events
- Paste actions inside answer inputs

These events are logged through the provided backend API and summarized on the results screen.

## Assumptions

- Multiple Choice questions are graded using the selected option index.
- Short Answer questions are graded by the backend using case-insensitive matching.
- Code questions are supported by the backend but were not implemented because they were not required by the assignment.
