NeuraDesk Backend (Option 1 - Separate Contexts per Agent)

Setup:
1. Copy .env.example to .env and fill credentials.
2. npm install
3. npm run dev

This backend includes:
- Auth (signup/signin)
- Finance, Career, Health, Nutrition, Lifestyle, Notes contexts (separate models)
- Basic CRUD for finance (expense/income/goal)
- Context updater services to keep agent contexts in sync
- Groq AI integration endpoints for each agent (placeholders)
