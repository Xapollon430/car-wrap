# Searchable Selectors and Generated Image Modal Design

Date: 2026-03-25
Status: Approved

## Goal

Enhance the current car wrap visualizer UI with:
- separate search inputs for car and wrap selectors
- a maximize action for the generated image that opens a large modal preview

## Confirmed Product Decisions

- Search UX: two separate search boxes (Cars and Wraps)
- Modal close interactions: close button, backdrop click, and `Esc` key

## Approaches Considered

1. Keep local `App` state + add small reusable modal component (recommended)
2. Introduce feature hooks (`useFilteredCatalog`, `useImageModal`)
3. Move all UI state into reducer-driven state machine

Chosen approach: **option 1** for low complexity and fast delivery while preserving clean component boundaries.

## Architecture Updates

- `App.tsx` adds:
  - `carSearchQuery`
  - `wrapSearchQuery`
  - `isModalOpen`
- `useMemo` filtering for cars/wraps based on search query
- New modal component:
  - `src/components/ImageModal.tsx`
  - receives `isOpen`, `imageUrl`, `caption`, `onClose`

## Component and UX Design

- Cars panel:
  - text input labeled `Search cars`
  - filtered car cards list
- Wraps panel:
  - text input labeled `Search wraps`
  - filtered wrap cards list
- Result panel:
  - existing generated preview image
  - new `Maximize` button shown only when generated image exists

Modal:
- large image display for generated result
- caption with generated prompt
- close button (`X`)
- closes on:
  - button click
  - backdrop click
  - `Esc`

## Data Flow

1. User types in car/wrap search input.
2. Filtered arrays derive from catalog labels.
3. Selector grids render filtered arrays.
4. User generates image as before.
5. User clicks `Maximize`.
6. Modal opens with generated image and prompt.
7. User closes modal by any configured interaction.

## Empty, Error, and Interaction States

- Search empty result state:
  - cars panel: `No cars match "<query>"`
  - wraps panel: `No wraps match "<query>"`
- Existing generate states remain:
  - loading text while generating
  - inline error on failure
  - placeholder text before first result
- Maximize button hidden when no generated image exists

## Accessibility and Keyboard Behavior

- Search inputs have visible labels and programmatic labels
- Modal semantics:
  - `role="dialog"`
  - `aria-modal="true"`
  - dialog title via `aria-labelledby`
- Keyboard:
  - `Esc` closes modal
  - close button is keyboard focusable and receives initial focus on open
- Backdrop close excludes clicks inside modal content

## Testing Scope

- Search tests:
  - cars search filters list
  - wraps search filters list
  - empty-result copy appears for no matches
- Modal tests:
  - maximize button only after generated image exists
  - modal opens on maximize
  - modal closes via close button
  - modal closes via backdrop click
  - modal closes via `Esc`
- Regression tests:
  - existing generate flow remains passing

## Non-Goals

- Server-side search
- Sorting/ranking search results
- Multi-image gallery modal
- Zoom/pan tools inside modal
