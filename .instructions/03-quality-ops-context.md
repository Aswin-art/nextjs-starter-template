# 03-quality-ops-context.md

## 1. TECHNICAL SEO STANDARDS (Next.js 16+)

**Goal:** Achieve 100/100 on Lighthouse SEO & Indexability.

### Metadata Strategy

- **API Usage:** Strictly use the **Next.js Metadata API** (`export const metadata: Metadata = { ... }`).
- **No HTML Head:** Do NOT manually populate `<head>` tags.
- **Templates:** Use `title.template` in `layout.tsx` to handle branding automatically.
  - _Format:_ `%s | {{ BRAND_NAME }}`.

### Dynamic SEO (Server Components)

- **For Dynamic Pages (e.g., Blog Post, Product Detail):**
  - Use `generateMetadata({ params })` function.
  - **Critical:** Ensure API calls for metadata are cached (deduplicated) so we don't fetch data twice (once for metadata, once for UI).

### Structured Data (JSON-LD)

- **Implementation:** Render a `<script type="application/ld+json">` inside the Server Component.
- **Schema:** Use strictly typed schema (e.g., `schema-dts`) for:
  - `Organization` (on Homepage)
  - `BreadcrumbList` (on Nested pages)
  - `Article` / `Product` (on Detail pages)

### Technical Assets

- **Sitemap:** Use `app/sitemap.ts` to generate dynamic sitemaps.
- **Robots:** Use `app/robots.ts` to manage crawling rules.
- **Open Graph:** Use `app/opengraph-image.tsx` (Image Response) for dynamic social sharing images. **Do not use static generic images for dynamic content.**

### Multilingual SEO (`next-intl`)

- **Hreflang:** Must be generated automatically via `generateMetadata` using `alternates.languages`.
- **Canonical:** Point to the specific locale URL.
- **Metadata:** Titles and Descriptions must be localized using `t('title')`.

---

## 2. PERFORMANCE & CORE WEB VITALS (The "Fast" Vibe)

**Goal:** LCP < 2.5s, CLS < 0.1, INP < 200ms.

### Rendering Rules

- **Images:** ALWAYS use `next/image`.
  - Set `priority={true}` for LCP element (Hero Image).
  - Set `sizes` prop correctly to avoid downloading 4k images on mobile.
- **Fonts:** Use `next/font` (Google Fonts or Local) to prevent Layout Shift (CLS).
- **Third-Party Scripts:** Use `next/script`.
  - `strategy="lazyOnload"` for non-critical (Chat widgets).
  - `strategy="afterInteractive"` for Analytics.

### Code Optimization

- **Lazy Loading:** Use `dynamic(() => import(...))` for heavy Client Components (e.g., Rich Text Editor, Charts, Maps) that are below the fold.
- **Bundle Size:** Monitor `import` costs. Don't import the whole `lodash` library if you only need `debounce`.

---

## 3. ACCESSIBILITY (A11y)

**Goal:** WCAG 2.1 AA Compliance.

- **Semantics:** Use proper HTML5 tags (`<main>`, `<article>`, `<nav>`, `<aside>`). Don't just use `<div>`.
- **Forms:** All inputs MUST have an associated `<label>` or `aria-label`.
- **Images:** All images MUST have descriptive `alt` text (unless purely decorative, then empty string).
- **Focus Management:** Ensure keyboard navigation works, especially for Modals and Dropdowns (Shadcn UI handles this well, don't break it).

---

## 4. TESTING STRATEGY (The Trophy Pattern)

**Philosophy:** Focus on **User Confidence**, not Code Coverage.
**Rule:** Skip Unit Tests for implementation details. Focus strictly on Integration and E2E.

### 1. Integration Tests (The Core)

**Tool:** `vitest` + `testcontainers` (or In-Memory DB).
**Target:** Server Actions, API Routes, & Services.
**Scope:**

- **Don't Mock DB:** Test against a real (containerized) Postgres/SQL instance if possible.
- **Flow:** Input (Data) -> Controller -> Service -> DB -> Output.
- **Goal:** Verify that the _whole backend pipeline_ works, not just individual functions.

### 2. E2E Tests (The Safety Net)

**Tool:** `Playwright`.
**Target:** Critical User Flows defined in `01-product-context.md`.
**Scope:**

- **Happy Path:** Login -> Create Item -> Verify Item Exists.
- **Critical Error:** Login -> Wrong Password -> Verify Error Message.
- **Environment:** Run against a local `preview` build or Staging URL.

### 3. Email Testing & Preview

- **Development:** Use the React Email Preview server (`pnpm run email`) to design templates visually.
- **Staging/E2E:**
  - **DO NOT** send to real addresses.
  - Use **Ethereal Email** or **Mailtrap** sandbox for trapping emails.
  - Or mock the `sendMail` function in Integration Tests to verify arguments only.

### 4. What NOT to Test (Skip)

- **UI Components:** Do not unit test "Button clicks" unless it's a complex custom library.
- **Utility Functions:** Unless it involves money/crypto math, skip unit testing simple helpers.

---

## 5. INFRASTRUCTURE SECURITY (The Shield)

**Goal:** Protect resources from abuse and attacks.

### Rate Limiting & Abuse Prevention

- **Mechanism:** {{ RATE_LIMITER (e.g., Upstash Ratelimit / Vercel KV) }}.
- **Scope:**
  - **Public API:** Strict limit (e.g., 10 req/10s per IP).
  - **Auth Routes:** Very strict limit (to prevent Brute Force).
  - **Heavy Jobs (Export/Import):** Limit per user (e.g., 1 export every 5 mins) to prevent resource exhaustion.

### Security Headers (Middleware)

- **Implementation:** Configure in `next.config.ts` or Middleware.
- **Mandatory Headers:**
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP): Strict mode, no inline scripts unless necessary.

### Data Handling Safety

- **File Uploads:**
  - Never allow direct upload to server disk (ephemeral).
  - Use **Presigned URLs** (S3/UploadThing) for direct client-to-storage upload.
  - Validate file magic bytes (MIME type check is not enough) in the separate Worker/Lambda function.

---

## 6. MEDIA MANAGEMENT & SECURITY STANDARDS

### Pre-Upload Rules (Client Side)

**Goal:** Save bandwidth and storage costs.

- **Compression:**
  - **Images:** MUST be compressed/resized on the client (browser) before upload using libs like `browser-image-compression` or `compressorjs`.
  - **Max Size:** Enforce strict limits (e.g., Avatar < 2MB, Documents < 5MB).
- **Validation:**
  - **MIME Types:** Validate strictly (e.g., `['image/jpeg', 'image/png', 'application/pdf']`).
  - **Magic Bytes:** (Optional but Recommended) Check file signature, not just extensions, to prevent malicious `.exe` renamed as `.jpg`.

### Access Control (Security)

- **Private by Default:** All user uploads (KTP, Invoices, Private Photos) must be stored in a **Private Bucket**.
- **Signed URLs:** NEVER expose the raw S3/Storage public URL for private files. Always generate a `signedUrl` via the Service Layer.
- **Hotlink Protection:** Configure Storage Bucket CORS to only allow requests from `{{ YOUR_DOMAIN }}`.

### Performance (Delivery)

- **Next.js Image:** ALWAYS use `<Image />` component for rendering uploads.
  - _Loader:_ Configure `next.config.js` to allow your storage domain.
  - _Blur:_ Use `placeholder="blur"` for better UX on large images.

---

## 7. OBSERVABILITY & LOGGING (The Black Box)

**Tooling:** {{ LOGGING_SERVICE (e.g., Sentry / Datadog / Pino / Axiom) }}

### Structured Logging (JSON)

**Rule:** Logs must be machine-parsable JSON, not plain text.

- **Bad:** `console.log("User login failed", email)`
- **Good:** `logger.warn({ event: "auth_failed", email: "...", ip: "..." })`

### Log Levels

1.  **ERROR:** System is broken, human intervention needed immediately (500 errors).
2.  **WARN:** Something odd happened, but system recovered (400 errors, Retry attempts).
3.  **INFO:** Normal lifecycle events (User logged in, Job started).
4.  **DEBUG:** Detailed payload data (Dev environment only).

### PII Scrubbing (Privacy)

**CRITICAL:** NEVER log sensitive data.

- **Blacklist:** Passwords, Credit Card Numbers, Access Tokens.
- **Action:** Redact them before logging (e.g., `password: "[REDACTED]"`).

### Correlation ID (Tracing)

- **Mechanism:** Every request must generate a unique `X-Request-ID`.
- **Flow:** Pass this ID from Frontend -> API -> Service -> DB Logger.
- **Benefit:** You can copy-paste the ID into your logs and see the entire journey of that specific crash.
