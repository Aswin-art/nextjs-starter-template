# 02-system-context.md

## 1. SYSTEM ARCHITECTURE & PHILOSOPHY

**System Type:** {{ TIPE_SISTEM (e.g., Fullstack Modular Monolith) }}

**CORE PHILOSOPHY: STRICT DECOUPLING**
The backend logic must be **strictly separated** from the Next.js framework (App Directory).

- **Goal:** Business logic must be framework-agnostic (pure TS).
- **Rule:** `NextRequest`, `NextResponse`, or `headers()` from `next/headers` NEVER leave the Controller layer.

**DATA FLOW (One-Way Street):**
`Client` -> `Controller (Route Handler / Server Action / Page)` -> `Service` -> `Repository` -> `Database`

**STATE MANAGEMENT STRATEGY (The "URL First" Rule):**
**Library:** `nuqs` (Type-safe Search Params).

**Rule: URL is the Source of Truth.**

- **Use `nuqs` (`useQueryState`) for:**
  - **Filters:** Category, Price Range, Status.
  - **Search:** Keywords/Query strings.
  - **Pagination:** `page`, `limit`, `offset`.
  - **Tabs:** Which tab is active.
  - **Dialogs/Modals:** Open state (e.g., `?modal=login`) - enables deep linking to modals.
- **Do NOT use `useState` for the above.**
  - _Why?_ Users must be able to copy-paste the URL and see the exact same UI state.

**Implementation Standard:**

1.  **Define Parsers:** Create a `searchParams.ts` file to define parsers (e.g., `parseAsInteger`, `parseAsString`).
2.  **Hook:** Use `const [search, setSearch] = useQueryState('q', parseAsString)` inside Client Components.
3.  **Server:** Use the parsers in Page props to ensure Type Safety between Client and Server.

---

## 2. LAYERED ARCHITECTURE STANDARDS (The Law)

### Layer 1: Repository Layer

- **Location:** `repositories/`
- **Naming:** `[entity].repository.ts`
- **Role:** The **ONLY** layer allowed to touch the Database/ORM.
- **Responsibilities:**
  - Handle CRUD, Transactions, Complex Joins.
  - Map raw DB results to clean DTOs before returning.
  - Return `null` if data not found (do not throw 404 here).
- **STRICTLY FORBIDDEN:**
  - Business logic.
  - Importing `next/*` or `react`.
  - Throwing HTTP Errors.

### Layer 2: Service Layer

- **Location:** `services/`
- **Naming:** `[entity].service.ts`
- **Role:** The "Brain" of the application. Pure TypeScript.
- **Responsibilities:**
  - Orchestration: Call multiple repositories if needed.
  - Semantic Validation: (e.g., "Is stock sufficient?", "Is user active?").
  - **Error Handling:** Throw `AppError` for logical failures (e.g., `throw new AppError(400, "Insufficient stock")`).
- **STRICTLY FORBIDDEN:**
  - Direct Database Access.
  - Importing `next/*` (No `NextResponse`).

### Layer 3: Controller Layer (The Interface)

In Next.js App Directory, "Controllers" exist in three forms:

1.  **API Routes:** `app/api/[resource]/route.ts` (REST endpoints).
2.  **Server Actions:** `actions/[domain].actions.ts` (Form handlers).
3.  **Server Components:** `app/(routes)/[page]/page.tsx` (Initial data fetch).

- **Role:** The "Traffic Cop" & Input Validator.
- **Responsibilities:**
  - **Input Validation:** Use `Zod` to validate request body/params/searchParams.
  - **Execution:** Call `[Entity]Service` methods.
  - **Response:** Return `NextResponse.json()` (API) or render UI (Page).
  - **Error Handling:** Catch `AppError` and convert to HTTP Response or UI Error Message.
- **STRICTLY FORBIDDEN:**
  - Writing business logic (IF/ELSE statements regarding business rules).
  - Direct Database Access (Prisma/Drizzle imports).

### Layer 4: Shared Infrastructure & Models

- **Location:** `lib/` & `models/`
- **Key Files:**
  - `models/[entity].dto.ts`: TypeScript Interfaces for data transfer.
  - `lib/AppError.ts`: Custom error class `{ statusCode, message }`.
  - `lib/apiHandler.ts`: Wrapper for API Routes to handle try-catch globally.
  - `lib/db.ts`: Database connection singleton.

---

## 3. PROJECT DIRECTORY STRUCTURE

**We follow a strict separation of concerns:**

**CORE DIRECTORIES:**

- `app`: Controllers (Pages & API Routes).
- `components`: UI Components only.
- `lib`: **Infrastructure & Configs** (e.g., `db.ts`, `stripe.ts`, `env.mjs`).
- `helpers`: **Pure Utilities** (No React dependency). Formatters, calculators, validators.
- `hooks`: **React Logic**. Custom hooks (`use...`).
- `services`: Business Logic.
- `repositories`: Database Access.

**RULE:** Do not create random files in root. Everything must have a home.

---

## 4. IMPLEMENTATION PROTOCOL (How to Code)

**Scenario: "User creates an Order"**

1.  **Define DTO (`models/order.dto.ts`):**

    - Create `CreateOrderInput` interface.

2.  **Repository (`repositories/order.repository.ts`):**

    - `create(data: CreateOrderInput)`: Inserts into DB. Returns `Order` object.

3.  **Service (`services/order.service.ts`):**

    - Check if stock exists (call `ProductRepository`).
    - If no stock -> `throw new AppError(400, "Out of stock")`.
    - If ok -> call `OrderRepository.create(data)`.

4.  **Controller (`app/api/orders/route.ts`):**
    - Validate `req.body` with Zod.
    - Call `OrderService.createOrder(validData)`.
    - Wrap entire logic in `apiHandler`.

---

## 5. DATABASE & DATA MODEL

**Database:** {{ JENIS_DB }}
**ORM:** {{ ORM_LIB }}

**SCHEMA CONVENTIONS:**

- **Table Names:** `snake_case` (e.g., `users`, `order_items`).
- **Column Names:** `snake_case`.

**CORE SCHEMA (High-Level ERD):**

- **{{ ENTITAS_A }}:** ...
- **{{ ENTITAS_B }}:** ...

---

## 6. ASYNC PROCESSING & BACKGROUND JOBS

**Philosophy:** Never block the User UI for tasks > 10 seconds.
**Tooling:** {{ JOB_QUEUE_PROVIDER (e.g., Inngest / Trigger.dev / BullMQ + Redis / Upstash QStash) }}

**PATTERNS:**

1.  **Fire-and-Forget (Emails/Notifications):**

    - **Flow:** Controller -> Push Event to Queue -> Return 200 OK immediately -> Worker processes email.
    - **Constraint:** Do NOT await the email sending in the `route.ts`.

2.  **Long-Running Tasks (Export/Import Data):**
    - **Flow:**
      1.  Client requests Export -> Server returns `job_id`.
      2.  Worker generates file -> Uploads to {{ STORAGE_PROVIDER }}.
      3.  Worker updates DB status to "COMPLETED".
      4.  Client polls status / Webhook notifies completion.

**STRICT RULE:**

- **NO** `setInterval` or `cron` logic inside standard Next.js API Routes (Serverless functions freeze when idle). Use the Job Queue provider's scheduling feature.

---

## 7. FILE STORAGE & MEDIA ARCHITECTURE

**Provider:** {{ STORAGE_PROVIDER (e.g., AWS S3 / Cloudflare R2 / Supabase Storage / UploadThing) }}

**UPLOAD STRATEGY (Direct-to-Cloud):**

1.  **Request URL:** Client requests a Presigned URL (Upload URL) from Server (Controller Layer).
2.  **Client Upload:** Client uploads file DIRECTLY to the Storage Provider (bypassing Next.js Server).
3.  **Verification:** Client notifies Server -> Server verifies file existence -> Server saves metadata (URL, size, type) to Database.

**RETRIEVAL STRATEGY:**

- **Public Assets:** Served via CDN.
- **Private/Protected Assets:** STRICTLY use **Signed URLs** with expiration (e.g., valid for 1 hour).
  - _Flow:_ Client requests file -> Server generates Signed URL -> Client displays image using that temporary URL.

**PROCESSING PIPELINE:**

- **Compression:** Must happen **Client-Side** (before upload) or via **Edge Function** (after upload hook).
- **Transformation:** Use Next.js `<Image />` component for on-the-fly resizing/format conversion (WebP/AVIF).

---

## 8. RESILIENCE & RECOVERY STRATEGY

### Global Error Handling (Backend)

- **API Wrapper:** All Controllers must be wrapped in `apiHandler`.
  - _Catches:_ `AppError` -> Returns JSON `{ status: 'error', message: ... }`.
  - _Catches:_ Unknown Error -> Logs strict error, Returns generic 500 "Internal Server Error" (Never leak stack trace to user).

### Retry & Circuit Breaker (External Calls)

- **Scenario:** Calling 3rd party API (Payment/Email).
- **Retry Policy:** Use exponential backoff (e.g., wait 1s, then 2s, then 4s) for network glitches (503/504).
- **Circuit Breaker:** If API fails 5 times in a row, stop calling it for 30 seconds. Return "Service Unavailable" immediately to save resources.

### Fallback Logic (Data Fetching)

- **Critical Data:** Fail hard (Show Error Page).
- **Non-Critical Data (e.g., Sidebar Recommendations):**
  - Catch error silently.
  - Return Empty Array `[]` or Cached Data.
  - **Goal:** The main page must render even if the sidebar fails.

---

## 9. INTERNATIONALIZATION (I18N) ARCHITECTURE

**Library:** `next-intl`

**DIRECTORY STRUCTURE:**

- **Messages:** `messages/[locale].json` (e.g., `en.json`, `id.json`).
- **Routing:** `app/[locale]/layout.tsx`. All pages must live inside `[locale]`.
- **Middleware:** `proxy.ts` handles locale detection and redirection.

**IMPLEMENTATION RULES:**

1.  **Type Safety:** Must use `global.d.ts` to strictly type the message keys. If a key doesn't exist in `.json`, build should fail.
2.  **Server Components:** Use `await getTranslations('Namespace')`.
3.  **Client Components:** Use `const t = useTranslations('Namespace')`.
4.  **Navigation:** Use the `Link` component from `next-intl` navigation wrapper (not standard `next/link`) to preserve locale.

**NAMESPACE CONVENTION:**
Organize JSON by Feature/Page context:

```json
{
  "Auth": {
    "login_button": "Login",
    "error_msg": "Invalid password"
  },
  "Dashboard": { ... }
}
```

---

## 10. EMAIL SERVICE ARCHITECTURE

**Stack:** Nodemailer + React Email.

**DIRECTORY STRUCTURE:**

- **Templates:** `emails/[name].tsx` (e.g., `welcome-email.tsx`, `reset-password.tsx`).
- **Transport Config:** `lib/mail.ts` (Singleton Nodemailer Transporter).
- **Business Logic:** `services/email.service.ts`.

**IMPLEMENTATION PROTOCOL:**

1.  **Template Creation:**

    - Build the visual in `emails/` using `@react-email/components` (`Html`, `Button`, `Text`).
    - Keep styles inline or use Tailwind (React Email supports it).

2.  **Service Layer (`services/email.service.ts`):**

    - Import the template.
    - Render to HTML: `const emailHtml = await render(<WelcomeEmail name={name} />)`.
    - Send via Nodemailer.

3.  **Async Execution:**
    - Email sending is SLOW. Always wrap calls in the **Job Queue** defined in Section 7 (Async Processing) if possible.
    - If synchronous (e.g., OTP), ensure strict timeout handling.
