# Environment and Third-Party Setup

This frontend relies on a small set of public environment variables. Copy `.env.example` to `.env` or `.env.local` and fill in the values.

## Required

| Variable | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://art-bay-e7451b528caa.herokuapp.com` | Base API URL. The app appends `/api/v1`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` | Google OAuth client ID. |

## Optional

| Variable | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://art-bay-e7451b528caa.herokuapp.com/` | Base site URL for Open Graph/Twitter metadata. |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | `pk_test_...` | Required for checkout UI. |
| `NEXT_PUBLIC_LOGGING_ENABLED` | `true` | Enables client error logging. |
| `NEXT_PUBLIC_LOGGING_ENDPOINT` | `https://logs.example.com/ingest` | Endpoint for error payloads. |

## Stripe

1) Create a Stripe project and grab the publishable key.
2) Set `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` in `.env.local`.
3) Start the app and verify the checkout page loads Stripe Elements.

## Google OAuth

1) Create OAuth credentials in the Google Cloud console.
2) Add the app origin to Authorized JavaScript origins.
3) Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`.

## Notes

- Keep secrets out of the repo; only `NEXT_PUBLIC_*` vars are exposed to the browser.
- If you point the API to a non-standard base, confirm the backend serves `/api/v1`.
- If `NEXT_PUBLIC_SITE_URL` is unset, metadata defaults to `http://localhost:3000`.
