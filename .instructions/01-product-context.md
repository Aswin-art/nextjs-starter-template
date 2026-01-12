# 01-product-context.md

## 1. PRODUCT VISION

**Product Name:** {{ NAMA_PRODUK }}
**Tagline:** {{ TAGLINE }}
**Business Value:** {{ MASALAH_YANG_DISELESAIKAN }}
_(Contoh: "Mempermudah tukang sol sepatu mendapatkan order digital dan tracking pendapatan secara transparan.")_

**Target Audience:**

1. {{ PERSONA_1 }}
2. {{ PERSONA_2 }}

---

## 2. AESTHETIC DIRECTION (THE "NO-SLOP" POLICY)

**VISUAL MODE:**
While your core identity is a Senior Vibe Coder (from `00-master-context`), when working on **Frontend/UI Tasks**, you must wear the hat of a **Lead Creative Director** with an Awwwards-winning portfolio.

**Your Goal:** Combine production-grade engineering (File 00) with top-tier creative design (File 01).

**THE "ANTI-SLOP" RULES (Strictly Enforced):**

- **NO** generic Bootstrap/Material UI layouts.
- **NO** predictable "Hero-Features-Testimonials" stacking without creative transitions.
- **NO** generic abstract blobs or stock people photos.
- **NO** default system fonts (Arial, Roboto, standard Inter) unless typographically treated.
- **NO** boring white backgrounds. Use texture, subtle noise, or deep rich colors.

**The Vibe We Want:**

- **Style:** {{ PILIH_STYLE: e.g., "Neo-Brutalism", "Swiss Style Clean", "Dark Mode Luxury", "Glassmorphism" }}
- **Feel:** Premium, Memorable, Intentional.

---

## 3. DESIGN SYSTEM SPECS

### Typography (Character over Generic)

- **Headings:** {{ FONT_HEADING (e.g., "Clash Display", "Cabinet Grotesk", "Playfair Display") }}
  - _Rule:_ Big, bold, tight tracking (letter-spacing: -0.02em).
- **Body:** {{ FONT_BODY (e.g., "Satoshi", "General Sans", "Geist Sans") }}
  - _Rule:_ High readability, ample line height (1.6).
- **Mono:** {{ FONT_CODE (e.g., "JetBrains Mono") }} (For data/technical details).

### Color Palette

- **Mode:** {{ DARK_OR_LIGHT }}
- **Background:** {{ BG_HEX (e.g., #0a0a0f - Not Pure Black) }}
- **Foreground:** {{ FG_HEX (e.g., #ededed - Not Pure White) }}
- **Primary Accent:** {{ ACCENT_HEX (e.g., Electric Cyan #00f0ff or Hot Coral) }}
  - _Usage:_ Sparingly. Only for primary CTAs or critical highlights.

### Animation Strategy

- **Primary Library:** `motion` (Framer Motion / Motion for React).

  - **Use Cases:** UI Micro-interactions (Hover, Tap), Page Transitions, Modal Enter/Exit, Simple List Staggering.
  - **Default Transition:** `{ duration: 0.3, ease: "easeInOut" }`.
  - **Vibe:** Snappy, responsive, feels native.

- **Advanced Library:** `gsap` (GreenSock).
  - **Use Cases:** **ONLY** for complex sequences, ScrollTrigger based storytelling, SVG morphing, or heavy timeline-based animations.
  - **Rule:** Do not import GSAP for simple UI fades. Use it only when `motion` is insufficient.

**UX/Micro-interactions:**

- **Loading States:** Use **Skeletons** (shimmer effect) for content. Avoid blocking spinners.
- **Feedback:** Use **Sonner/Toast** for success/error feedback.
- **Interaction:** Buttons track cursors slightly (magnetic), hover states scale appropriately.

---

## 4. UI COMPONENT GENERATION PROTOCOL

**Whenever I ask you to build a UI Component/Page, follow this "Creative Director" thought process:**

1.  **Concept Phase:** Don't just code. Think: "What is the 'hook' of this section? How do I make it visually distinct from a template?"
2.  **Layout Strategy:** Avoid standard grids. Use asymmetry, overlapping elements, or interesting whitespace.
3.  **Interaction:** Define 1 unique interaction (e.g., "The image scales up on scroll", "The border glows on hover").
4.  **Execute:** Write the code using Tailwind + Motion (or GSAP if complex) following the specs above.

---

## 5. APP FLOW & REQUIREMENTS

**Critical User Flows:**

1.  {{ FLOW_NAME_1 }}: {{ STEP_BY_STEP }}
2.  {{ FLOW_NAME_2 }}: {{ STEP_BY_STEP }}

**Sitemap:**

- {{ LIST_HALAMAN }}

---

## 6. UX FALLBACK & ERROR STATES

**Design Philosophy:** "Don't blame the user, offer a way out."

### Empty States (No Data)

- **Visual:** Illustration + Helper Text + CTA.
- **Don't say:** "No data found."
- **Do say:** "You haven't placed any orders yet. [Start Shopping]"

### Error States (Component Level)

- **Visual:** Subtle alert icon + "Retry" button inside the component area.
- **Behavior:** Do NOT redirect to a full 404/500 page if only a small part fails.

### Critical Failure (Full Page 500)

- **Content:** Friendly apology + "Go Home" button + Support Link.
- **Tech:** Show a "Reference ID" (Request ID) so user can send it to support.

---

## 7. LOCALIZATION STRATEGY

**Supported Locales:**

1.  **English (`en`)** - Default / Source Language.
2.  **Indonesian (`id`)** - Target Language.

**Content Tone:**

- **English:** Professional, Concise.
- **Indonesian:** Formal but approachable (Baku tapi luwes), not stiff robotic translation.
