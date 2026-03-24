<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cocosil V2 Project Guidelines for Agents

## 1. API-First Design & Type-Safe Contracts
- **Strict Rule:** Frontend implementation MUST NOT start until API requests/responses are fully typed in TypeScript and merged to the main branch.
- **Contract-Driven Development:** Frontend development should use mock data based on agreed-upon types until backend implementation is complete to avoid delays and implementation rewrite hell.

## 2. Layered Architecture (Role Division)
- **Backend/Infra Layer:** Responsible for Supabase setup, DB schema design, Row Level Security (RLS) configuration, full API type definitions, and core logic. Ensures data structure and security.
- **Frontend/Requirements Layer:** Responsible for detailed requirements, UI/UX implementation, and efficient frontend development utilizing Next.js App Router Server Components.

## 3. Tech Stack & SOP
- **Stack:** Next.js (App Router mandatory), Supabase, Vercel, Tailwind CSS.
- **Environment:** Unix-based environments (Mac or WSL2) only. 
- **Initialization:** Use `npx create-next-app` with App Router, Tailwind CSS, and TypeScript.
- **Env Vars:** NEVER commit environment variables (e.g., Supabase Anon Key) to the repository. Manage them locally in `.env.local` securely.

## 4. Resource Constraints & Database Strategy
- **Strict Storage Limit:** Supabase is on a free tier (max 0.5GB). Design text data (e.g., chat histories) with minimal indexing and implement aggressive **data deletion/archiving strategies** to prevent exceeding this limit.
- **Project Limits:** Pause any old or unused Supabase projects to free up resources for V2.
