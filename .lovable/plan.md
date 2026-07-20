## Mobile UI/UX fixes

### 1. Kebab (three-dots) menu on mobile
In `src/components/site-header.tsx`:
- Keep the current inline Home/Products links on `md+` screens.
- On mobile (`<md`), replace them with a `MoreVertical` (three-dots) icon button.
- Tapping it opens a small dropdown panel (absolute-positioned under the header) with Home and Products links. Tapping a link or tapping outside closes it.
- Hide the search input on mobile entirely (it currently already uses `hidden md:flex`, so keep that — search only shows on desktop; on mobile users can search from the Products page filter).

### 2. Products page mobile layout
In `src/routes/products.tsx`:
- The current `lg:grid-cols-[240px_1fr]` stacks the filter panel above the grid on mobile, so on a phone the user sees only filters (matches the screenshot).
- Collapse the filter sidebar into a "Filters" toggle button on mobile. Panel is hidden by default and expands when tapped. Product grid renders immediately below the toggle so products are visible on first load.
- Keep the desktop two-column layout unchanged.

### 3. Fix product card tap not opening detail page
Investigate why tapping a card on mobile doesn't navigate:
- `ProductCard` already wraps content in `<Link to="/products/$id" params={{ id }}>`, which is correct.
- Likely cause: the `Link` is a flex container with a nested `img` that has hover transforms; on some mobile taps the event may be swallowed, or the card renders inside the collapsed filter area. After fixing (2) so the grid is visible on mobile, verify tap works.
- Add `block` display and ensure no ancestor has `pointer-events: none`. If needed, add an explicit `role="link"` and remove `hover:-translate-y-0.5` on touch devices (`md:hover:...`) to avoid tap ghosting.

### 4. Verification
- Open preview at 390px width, tap the kebab → menu opens with Home/Products.
- On `/products`, grid is visible immediately; "Filters" toggle expands the panel.
- Tap any product card → navigates to `/products/$id`.

### Files touched
- `src/components/site-header.tsx`
- `src/routes/products.tsx`
- `src/components/product-card.tsx` (minor: touch-safe hover)

No backend, no data, no auth changes.
