# Next.js Starter Template

Production-ready Next.js 16 starter with opinionated architecture, pre-configured tooling, and AI-friendly instructions.

## Tech Stack

| Category      | Technology                            |
| ------------- | ------------------------------------- |
| **Framework** | Next.js 16 (App Router)               |
| **Language**  | TypeScript (Strict Mode)              |
| **Styling**   | Tailwind CSS 4 + Shadcn UI            |
| **State**     | nuqs (URL) + TanStack Query + Zustand |
| **Database**  | PostgreSQL + Prisma 7                 |
| **Auth**      | Better Auth                           |
| **Forms**     | React Hook Form + Zod                 |
| **i18n**      | next-intl                             |
| **Email**     | Nodemailer + React Email              |
| **Animation** | Motion (Framer) + GSAP + Lenis        |
| **Testing**   | Vitest + Playwright                   |
| **Linting**   | Biome                                 |

## Project Structure

```
├── app/                 # Next.js App Router (Pages & API Routes)
├── components/          # UI Components (Shadcn + Custom)
├── lib/                 # Infrastructure & Configs (db, auth, mail)
├── helpers/             # Pure Utilities (formatters, validators)
├── hooks/               # React Hooks
├── services/            # Business Logic Layer
├── repositories/        # Data Access Layer
├── stores/              # Zustand Stores
├── dictionaries/        # i18n Translation Files
├── emails/              # React Email Templates
├── e2e/                 # Playwright E2E Tests
├── tests/               # Vitest Integration Tests
└── .instructions/       # AI Context Files
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma generate
pnpm prisma db push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command                 | Description            |
| ----------------------- | ---------------------- |
| `pnpm dev`              | Start dev server       |
| `pnpm build`            | Build for production   |
| `pnpm email`            | Start email dev server |
| `pnpm lint`             | Lint with Biome        |
| `pnpm format`           | Format with Biome      |
| `pnpm test:integration` | Run Vitest tests       |
| `pnpm test:e2e`         | Run Playwright tests   |

## AI Instructions

The `.instructions/` directory contains context files for AI assistants:

| File                        | Purpose                              |
| --------------------------- | ------------------------------------ |
| `00-master-context.md`      | Project identity, conventions, rules |
| `01-product-context.md`     | Product vision, UI/UX guidelines     |
| `02-system-context.md`      | Architecture, layers, patterns       |
| `03-quality-ops-context.md` | Testing, CI/CD, monitoring           |
| `99-active-context.md`      | Current development log              |

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"
SMTP_FROM="noreply@example.com"
```

## License

MIT
