# Health Kundali Backend

This backend moves the app's sensitive and persistent responsibilities out of the Expo client and into a Node.js + Express API.

## What should live on the backend

- Authentication and password verification
- User profile persistence
- Protected "current user" lookups
- Run session history and summaries
- Validation and consistent API errors

## Current frontend gaps this backend fixes

- The current `AuthProvider` stores passwords and logged-in state in React memory only.
- Profile data is lost when the app reloads.
- Run tracking stats are only logged locally and are not saved anywhere.
- There is no server-side validation or protected route layer today.

## API overview

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/runs`
- `POST /api/runs`

## Start the server

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Run `npm run dev`

The backend uses a small JSON file datastore in `src/data/db.json` so you get persistence immediately without setting up a database first.
