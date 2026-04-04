# Health Kundali

This repository is now split into two clean apps:

- `frontend/` contains the Expo Router mobile app
- `backend/` contains the Node.js + Express API

## Run the frontend

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

## Run the backend

- `npm run server`
- `npm run server:start`

## Structure

- `frontend/app/` Expo Router routes and screens
- `frontend/contexts/` client-side auth state and UI session logic
- `frontend/services/` app-side services like GPS tracking
- `backend/src/routes/` API route definitions
- `backend/src/controllers/` request handlers
- `backend/src/services/` business logic and persistence
- `backend/src/middleware/` auth, validation, and error handling

The root package only coordinates the two apps. Each side keeps its own dependencies and config.
