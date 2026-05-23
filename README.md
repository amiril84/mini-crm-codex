# Mini CRM

Mini CRM is a prototype customer relationship management application built with Next.js, SQLite, and Prisma. It helps sales users manage companies, contacts, activities, and deals through a clean dashboard-style interface.

## Overview

This application is designed as a lightweight CRM prototype for tracking sales pipeline progress, customer relationships, and follow-up activities. It includes a protected dashboard, company and contact management, activity logging, and a Kanban-style deals pipeline with drag-and-drop stage updates.

Core stack:

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- Prisma
- SQLite
- Playwright

## Features

- **As a sales user, I can sign in to the application** so that CRM pages are only accessible after a session is created.
- **As a sales user, I can view a performance dashboard** so that I can quickly understand total revenue, active deals, pending tasks, pipeline value by stage, top performing sales, and top client by deal value.
- **As a sales user, I can manage companies** so that prospect and client organizations are stored in one place.
- **As a sales user, I can manage contacts and link them to companies** so that relationships between people and organizations stay clear.
- **As a sales user, I can record tasks, events, and calls** so that follow-up activity is documented.
- **As a sales user, I can manage deals in a Kanban sales pipeline** so that every opportunity is visible by stage.
- **As a sales user, I can drag and drop deals between pipeline stages** so that stage totals update immediately with optimistic UI behavior.
- **As a sales user, I can open a right-side detail panel for companies, contacts, and deals** so that I can review record details without leaving the current page.
- **As a sales user, I can add a new deal from the Deals page** so that a new opportunity appears directly in the pipeline.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, TailwindCSS, lucide-react
- **Backend:** Next.js API Routes
- **Database:** SQLite
- **ORM:** Prisma
- **Testing:** Playwright

## Project Structure

```text
.
├── prisma/
│   ├── schema.prisma          # Prisma data model for User, Company, Contact, Deal, Task, Event, and Call
│   ├── seed.ts                # Seed script for initial dummy CRM data
│   ├── init.sql               # SQLite initialization SQL used to create local tables
│   └── dev.db                 # Local SQLite database file
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard with metrics, pipeline chart, top sales, and top client cards
│   │   ├── layout.tsx         # Root application layout
│   │   ├── globals.css        # Global Tailwind and base styles
│   │   ├── login/             # Dummy login page
│   │   ├── companies/         # Companies list, create modal, and detail panel UI
│   │   ├── contacts/          # Contacts list, create modal, company relation dropdown, and detail panel UI
│   │   ├── activities/        # Tasks, Events, and Calls tabs with create forms
│   │   ├── deals/             # Deals Kanban board, drag and drop, add deal modal, and detail panel UI
│   │   └── api/               # API routes for login, create records, and update deal stage
│   ├── components/
│   │   └── app-shell.tsx      # Main Sidebar and TopBar shell
│   └── lib/
│       └── prisma.ts          # Prisma Client singleton
├── tests/
│   ├── fase1.spec.ts          # Layout smoke test
│   ├── fase2.spec.ts          # Companies and Contacts create/read tests
│   ├── fase3.spec.ts          # Activities tab and Call creation test
│   ├── fase4.spec.ts          # Deals drag/drop optimistic total update test
│   ├── fase5.spec.ts          # Login protection and Dashboard revenue sync test
│   └── fase6.spec.ts          # Deal detail panel and Add Deal tests
├── src/middleware.ts          # Route protection using a cookie-based dummy session
├── package.json               # Scripts and dependencies
├── playwright.config.ts       # Playwright E2E test configuration
├── tailwind.config.ts         # TailwindCSS configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.mjs            # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js
- npm
- SQLite CLI available as `sqlite3`

### Install Dependencies

```bash
npm install
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Initialize SQLite Database

```bash
sqlite3 prisma/dev.db ".read prisma/init.sql"
```

### Seed Database

```bash
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Login

The application uses a dummy login flow for prototype purposes. The login form accepts the default values shown in the form, or any email/password input, and then creates a local cookie session.

After signing in, the user is redirected to the Dashboard.

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Builds the application for production.

```bash
npm run start
```

Starts the production server after a successful build.

```bash
npm run db:seed
```

Seeds the SQLite database with dummy CRM data.

```bash
npm run test:e2e
```

Runs the Playwright end-to-end test suite.

## Testing

Run all automated tests:

```bash
npm run test:e2e
```

The test suite covers:

- Phase 1: Basic layout, Sidebar, and TopBar rendering
- Phase 2: Companies and Contacts create/read flow, including Contact to Company relation
- Phase 3: Activities tabs and Call creation linked to a Contact
- Phase 4: Deals Kanban drag and drop with optimistic Total Value updates
- Phase 5: Login protection and Dashboard Total Revenue synchronization
- Phase 6: Deal detail panel and Add Deal flow

## Database

The application uses SQLite through Prisma. Main tables:

- `User`: CRM users or sales owners
- `Company`: Client or prospect organizations
- `Contact`: Individual people linked optionally to companies
- `Deal`: Sales pipeline opportunities
- `Task`: Follow-up tasks
- `Event`: Scheduled events
- `Call`: Logged call activities linked to contacts

Important relationships:

- A Company has many Contacts and Deals.
- A Contact may belong to a Company.
- A Deal may link to a Company and/or Contact.
- Tasks, Events, Calls, Companies, Contacts, and Deals are owned by Users.

## Known Notes

- Authentication is intentionally dummy/prototype-level.
- SQLite is intended for local development and prototype usage.
- Playwright tests create additional records in the local database.
- Prisma `schema.prisma` defines the ORM models, while `prisma/init.sql` is used to initialize SQLite tables in this local setup.

## Roadmap / Future Improvements

- Replace dummy auth with production-ready authentication.
- Add edit and delete actions for records.
- Add search, filter, and sorting controls for tables and pipeline.
- Add richer reporting and export capabilities.
- Add deployment configuration for a production database.

## License

TBD
