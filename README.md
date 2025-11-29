# NeuraDesk Backend Boilerplate

This is a starter Node.js + Express backend for the NeuraDesk frontend.

## Features
- Express server
- MongoDB (Mongoose) models for User, Expense, Income, Goal
- Auth (JWT) middleware
- Finance routes (add/list expenses & incomes, goals, stats)
- AI endpoint placeholder for integration with OpenAI
- Ready for deployment (Render / Railway / Vercel functions)

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```
   npm install
   ```
3. Start dev server:
   ```
   npm run dev
   ```
4. API root: `http://localhost:4000/api`
