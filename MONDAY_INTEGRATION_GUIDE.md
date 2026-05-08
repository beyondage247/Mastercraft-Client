# monday.com + Netlify Integration Guide

This project uses Netlify Functions as the secure backend between the React portal and the monday.com GraphQL API.

Do not call monday.com directly from React. A browser request would expose the API token to every visitor.

## 1. Revoke the exposed token

If a monday.com token has been pasted into chat, email, screenshots, Git commits, or any other shared place, revoke it and create a new one before deployment.

In monday.com:

1. Open your profile menu.
2. Go to **Developers**.
3. Open **API token**.
4. Regenerate the token.
5. Store the new token only in Netlify environment variables or a local `.env` file.

## 2. Prepare monday.com boards

Recommended boards:

### Projects board

Required columns:

- Status: `Pending`, `In Design`, `In Fabrication`, `Completed`
- Category: `Commercial`, `Residential`, `Installation`, etc.
- Location
- Due date
- Progress

### Quotes board

Required columns:

- Status: `Draft`, `Sent`, `Accepted`, `Expired`, `Rejected`
- Amount
- Valid until
- Description

Enable monday.com Developer Mode so you can copy board IDs and column IDs.

## 3. Add Netlify environment variables

In Netlify:

1. Open your site.
2. Go to **Site configuration**.
3. Open **Environment variables**.
4. Add the variables from `.env.example`.

Minimum required variables:

```env
MONDAY_API_TOKEN=your_new_token
MONDAY_API_VERSION=2026-04
MONDAY_PROJECTS_BOARD_ID=your_projects_board_id
MONDAY_QUOTES_BOARD_ID=your_quotes_board_id
```

If your monday.com column IDs differ from the defaults, add these too:

```env
MONDAY_PROJECT_STATUS_COLUMN=status
MONDAY_PROJECT_CATEGORY_COLUMN=category
MONDAY_PROJECT_LOCATION_COLUMN=location
MONDAY_PROJECT_DUE_DATE_COLUMN=due_date
MONDAY_PROJECT_PROGRESS_COLUMN=progress

MONDAY_QUOTE_STATUS_COLUMN=status
MONDAY_QUOTE_AMOUNT_COLUMN=amount
MONDAY_QUOTE_VALID_UNTIL_COLUMN=valid_until
MONDAY_QUOTE_DESCRIPTION_COLUMN=description
```

## 4. Local development

Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Fill in the values, then run the app through Netlify Dev so redirects and functions work:

```bash
npx netlify dev
```

The React app calls these internal API routes:

```txt
GET  /api/monday-discovery
GET  /api/dashboard
GET  /api/projects
GET  /api/quotes
POST /api/quotes/:mondayItemId/accept
```

Use `/api/monday-discovery` first if you only have the monday.com token and need to find board IDs and column IDs.

## 5. How the data flow works

```txt
React page
  -> src/services/portalApi.ts
    -> /api/projects, /api/quotes, /api/dashboard
      -> Netlify Functions
        -> monday.com GraphQL API
```

The monday.com token is only read inside `netlify/functions/_monday.mjs`.

## 6. Mapping monday data to the portal

Projects are mapped in `netlify/functions/projects.mjs`.

Quotes are mapped in `netlify/functions/quotes.mjs`.

If you add columns later, update those mapper files and the TypeScript types in `src/data/portal.ts`.

## 7. Quote acceptance

The Accept button calls:

```txt
POST /api/quotes/:mondayItemId/accept
```

The Netlify function updates the monday.com quote status column to:

```json
{ "label": "Accepted" }
```

Your monday.com status column must contain an `Accepted` label.

## 8. Deployment checklist

Before deploying:

1. Regenerate the monday.com token.
2. Add all Netlify environment variables.
3. Confirm the board IDs are correct.
4. Confirm the column IDs are correct.
5. Confirm status labels match the portal labels exactly.
6. Run `npm run lint`.
7. Run `npm run build`.
8. Deploy to Netlify.

## 9. Future additions

The current backend is ready for Projects, Quotes, Dashboard metrics, and quote acceptance.

Next useful endpoints:

```txt
GET  /api/documents
GET  /api/messages
GET  /api/invoices
GET  /api/payments
POST /api/projects
POST /api/monday/webhook
```

Use monday.com webhooks later if you want near real-time updates when board items change.
