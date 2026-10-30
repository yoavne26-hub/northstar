# Northstar Product Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Northstar's analyst workflow usable on phones, its demo sign-in truthful, and its visual hierarchy calmer without changing the risk model.

**Architecture:** Keep the existing React router, contexts, page components, and CSS files. Add responsive state only to the app shell. Use CSS media queries for layout, then revise demo copy and affordances in the login and explainer components.

**Tech Stack:** React 18, TypeScript, Vite, plain CSS.

**Spec:** `docs/superpowers/specs/2026-10-29-northstar-product-design.md`

## Global Constraints

- Preserve routes, role guards, risk scoring, mock data, and local storage behavior.
- Add no dependencies. Do not alter package files in the original checkout.
- Keep Northstar's navy/teal identity and use the Taste Framed sheet app direction for the work screens.
- Every interactive control must have a visible focus state; mobile menu and primary controls must reach 44px.

## Review Focus

- Phone viewport with a long page title: the title and menu control remain usable without horizontal overflow.
- Mobile menu after route change: the sheet closes and focus returns to the new page context.
- Analyst account at `/analytics`: the existing role guard still redirects.
- Saved filters and risk weights after layout changes: local storage state still applies.
- Public explainer at 390px: embedded product content stays within its frame and the document never scrolls sideways.

---

### Task 1: Responsive app shell and navigation

**Files:** Modify `src/components/layout/AppShell.tsx`, `src/components/dashboard/Sidebar.tsx`, `src/components/dashboard/TopBar.tsx`, `src/styles/dashboard.css`, `src/styles/product.css`.

**Interfaces:** `AppShell` owns `menuOpen`; `Sidebar` accepts `open` and `onClose`; `TopBar` accepts `onOpenMenu`. Route changes close the sheet. Desktop navigation remains visible.

- [ ] Record the existing 390px dashboard screenshot and overflow/visibility result. Expected: fixed 214px sidebar and clipped work area.
- [ ] Add semantic mobile menu and close buttons, route-close behavior, Escape handling, and a backdrop. Keep navigation links and account access.
- [ ] Add phone/tablet shell media rules: 48px top bar, full-width main region, full-screen menu sheet, no page-level sideways scroll, 44px menu targets.
- [ ] Verify `npm.cmd run build` passes and capture 390px, 768px, 1440px dashboard screenshots. Expected: menu and content visible at 390px; desktop shell still intact.
- [ ] Commit this task with the plan/spec documents.

### Task 2: Dashboard density and responsive data layout

**Files:** Modify `src/styles/dashboard.css`, `src/styles/product.css`, and only page-local CSS that a route check shows overflowing.

**Interfaces:** Existing component props and data remain unchanged. CSS aligns KPI, chart, filters, issue list, and drawer inside the shell from Task 1.

- [ ] Capture baseline 390px dashboard and note controls/sections that overflow or sit outside the first viewport.
- [ ] Apply the Framed sheet treatment to app chrome: tinted frame, white work surface, flat resting cards, quieter navigation and labels; keep risk red/amber and chart teal on data.
- [ ] Stack chart and contributors, use two-column KPIs, wrap or contain filters, and adapt issue/drawer widths for 390px and 768px.
- [ ] Run `npm.cmd run build` and visual checks at 390px, 768px, 1440px. Expected: no page-level horizontal overflow; the queue can be reached and acted on by touch.
- [ ] Commit the task.

### Task 3: Public explainer hierarchy and phone layout

**Files:** Modify `src/pages/ExplainerPage.tsx`, `src/styles/explainer.css`.

**Interfaces:** The launch link keeps routing to `/dashboard`; the embedded triage content keeps its current data and actions.

- [ ] Capture the baseline 390px public page. Expected: cropped headline and launch link, document-level sideways overflow.
- [ ] Promote the main heading to `h1`, make the header and personas adapt to one column, stack content sections, and contain wide table/preview content in their own scroll area if needed.
- [ ] Replace preview-only action links that have no destination with honest noninteractive text or a real dashboard link.
- [ ] Run `npm.cmd run build` and capture 390px, 768px, 1440px public screenshots. Expected: complete first-screen copy, working launch link, no document-level sideways scroll.
- [ ] Commit the task.

### Task 4: Honest demo entry and final interaction review

**Files:** Modify `src/pages/LoginPage.tsx`, `src/styles/product.css`, `src/styles/tokens.css`; adjust adjacent styles only when screenshots show a concrete defect.

**Interfaces:** `signIn`, `signInDemo`, and role routing keep their signatures. Email entry remains local demo access and never asks for a password.

- [ ] Record the current login behavior: ignored password and Google/Okta/GitHub buttons that all enter the Analyst demo.
- [ ] Remove false authentication affordances, label the flow as demo access, retain email and Analyst/Admin role entry, and label sample metrics as sample data.
- [ ] Improve type fallback and focus/touch states without adding dependencies or changing authentication storage.
- [ ] Run `npm.cmd run build`; exercise analyst and admin entry, mobile menu route change, and keyboard close; capture login/dashboard/public at 390px and 1440px. Expected: correct routes, no horizontal overflow, consistent visual hierarchy.
- [ ] Run Taste source lint and record remaining warnings; commit the task.

### Final review

- [ ] Review the whole branch against the spec and screenshots. Fix important regressions, rerun the build and visual/interaction checks, and report any deferred minor findings.
