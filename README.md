# QR Quiz Platform - Run Instructions

This guide explains how to run the frontend and backend services for the QR Quiz Platform.

## Prerequisites

- Node.js installed on your machine.
- MongoDB running (locally or remotely).

## Backend

The backend is a Node.js/Express application connecting to MongoDB.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies (if not already done):**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the server using `nodemon` (auto-restarts on changes) on port 5000 (usually).

## Frontend

The frontend is a Next.js application.

1.  **Navigate to the frontend directory:**
    Open a new terminal window and navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  **Install dependencies (if not already done):**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js app, typically available at `http://localhost:3000`.

## Accessing the Application

- **Frontend:** Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API:** The API will be running at `http://localhost:5000` (check terminal output for exact port).
