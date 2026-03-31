# Selector Pagination and Loading States Design

Date: 2026-03-28
Status: Approved

## Goal

Reduce selector clutter by showing cars and wraps in fixed-size pages while preserving fast search and the current selection flow.

## Confirmed Product Decisions

- Pagination approach: local page state in the visualizer page
- Page size: 4 items per page
- Search behavior: filter first, paginate filtered results second
- Loading behavior: cars and wraps panels should show inline spinners while the catalog is loading

## Approaches Considered

1. Keep page state in `VisualizerPage` and pass only the current slice to `SelectorGrid` (recommended)
2. Move pagination behavior into `SelectorGrid`
3. Replace pagination with virtualization or infinite scrolling

Chosen approach: **option 1** for the smallest footprint, the clearest search + pagination interaction, and easy control over upload/delete edge cases.

## Visual Thesis

A dark studio control surface where each selector reads as a deliberate four-up shelf, with compact transport controls that keep the interface calm even when the catalog grows.

## Content Plan

1. Primary workspace:
   - Cars and Wraps remain the core selector panels
   - each panel shows exactly four filtered items at a time
2. Support detail:
   - a slim footer under each grid shows page position plus previous and next controls
3. Result detail:
   - the preview panel remains unchanged so the generate flow still feels familiar
4. Final action:
   - `Generate` stays the strongest CTA

## Interaction Thesis

- Search updates results immediately and resets that panel to page 1 so matching items are always visible.
- Page transitions use a light motion shift so the shelf changes feel intentional instead of abrupt.
- Pagination controls show strong disabled states and keep orientation visible with current-page feedback.

## Data Flow

1. Catalog loads into `cars` and `wraps`.
2. Search query derives `filteredCars` and `filteredWraps`.
3. Pagination derives a page count and current visible slice for each filtered array.
4. `SelectorGrid` renders only the current 4-item slice.
5. Pager controls update only their own panel state.
6. Upload and delete operations refresh the catalog and clamp the current page to a valid range.

## Behavior Rules

- Cars and wraps paginate independently.
- Page size is fixed at 4 for now.
- Search resets the current page for that panel to 1.
- If filtering returns fewer pages than the current page, the page clamps to the last valid page.
- Selected items remain selected even if they are not currently visible on the active page.
- Empty-state messages continue to reflect the filtered result set.

## Loading States

- While the catalog is loading:
  - Cars panel shows an inline loading spinner and short status copy
  - Wraps panel shows an inline loading spinner and short status copy
- The preview panel keeps its existing state handling.

## Accessibility

- Pagination controls use real buttons with accessible labels.
- Disabled buttons remain visually and semantically disabled.
- Loading indicators expose status text for screen readers.

## Non-Goals

- Server-side pagination
- Sorting or ranking changes
- Infinite scroll
- Changes to preview generation behavior
