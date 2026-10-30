# Northstar product improvement design

## Intent

Northstar is a mock-data cloud security triage product for analysts. Improve its usability and credibility while preserving the existing routes, data, risk model, React stack, and navy/teal identity. The work focuses on defects observed in the running product rather than adding speculative features.

## Baseline evidence

- At 390px, the app retains a 214px desktop sidebar. The dashboard is clipped to the remaining width and its controls cannot be used comfortably.
- At 390px, the public explainer overflows horizontally. Its first headline and launch action are cut off.
- Login presents Google, Okta, and GitHub buttons that all enter the same local demo role. The password field is ignored. This suggests authentication that does not exist.
- The desktop dashboard builds and works, but gradients, shadows, tinted cards, and very small labels compete with the risk data.
- The repository has no automated UI tests. Production TypeScript/Vite build passes. The original checkout has user edits to `package.json` and `package-lock.json`; they remain untouched.

## Approaches

1. **CSS patches only:** Fast, but leaves misleading sign-in behavior and mobile navigation without a usable interaction.
2. **Focused product repair (chosen):** Add a real mobile menu to the existing shell, adapt the dashboard and public page layouts, make demo entry explicit, and quiet the interface using the existing brand. This addresses observed failures without replacing working product flows.
3. **Full redesign:** Could produce a new visual direction, but risks the dense analyst workflow and expands the change far beyond what the evidence requires.

The user's request to improve the project “in every way you see fit” delegates the approach choice. The focused repair gives the largest practical gain and keeps the work reviewable.

## Experience

- On desktop, keep the navigation and triage hierarchy. Use a subtly tinted shell, a white work surface, quieter separators, flat controls, and color primarily for risk data and the primary action. This follows Taste's **Framed sheet** app direction with Northstar's existing palette and typography.
- At 980px and below, replace the fixed sidebar with a 48px top bar containing a menu button, page title, and account control. The menu opens a full-screen navigation sheet; route selection, Escape, and its close control dismiss it. Main content spans the viewport.
- At phone widths, show dashboard KPIs in two columns, stack chart and contributors, keep filters reachable without page-level sideways scrolling, and let issue rows retain their identity and action.
- On the public explainer, use one `h1`, readable type at narrow widths, one-column personas, stacked evidence sections, and contained tables/preview. The page itself never scrolls sideways.
- On login, explicitly label access as a local demo. Email entry chooses a demo identity without a password, and role buttons are named Analyst demo and Admin demo. Remove third-party sign-in labels and mark sample metrics as sample data.

## Constraints and acceptance

- Preserve existing route URLs, role guards, risk scoring, mock data, and local storage behavior.
- Avoid new dependencies and preserve the user's package edits in the original checkout.
- Maintain keyboard focus visibility, 44px touch targets for primary mobile controls, and reduced-motion handling.
- `npm.cmd run build` passes in the isolated worktree.
- At 390px, 768px, and 1440px, the public page, login, and dashboard have no page-level horizontal overflow; the dashboard's first useful content is visible without sideways panning.
- Analyst and Admin demo entry reach their intended routes; mobile navigation opens, closes, and changes routes.
