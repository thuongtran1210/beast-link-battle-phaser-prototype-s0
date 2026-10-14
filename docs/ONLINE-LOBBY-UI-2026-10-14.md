# Online lobby UI — 2026-10-14

Implemented presentation: warm village palette; dedicated dialog header/44px close; desktop two-column create/join cards; mobile tabs and single form; bounded scrolling body and short-landscape spacing; 48px inputs with 16px text; visible keyboard focus and reduced-motion support.

Waiting room: selectable room code, clipboard success/failure feedback, two player positions, safe text rendering for player names, ready/cancel action and countdown status. Pending create/join blocks duplicate submissions; dialog close/Escape removes DOM and lobby subscriptions, disconnecting unless the adapter transfers to the match. Room updates received before initial room rendering are retained.

Gameplay modes/protocol unchanged. Automated checks and TypeScript pass; production build tracked separately. Live PC/mobile, software keyboard and two-device visual QA remain open.

Owner screenshot refinement: removed menu online emoji and card icons; mobile header reduced to title/close; landscape dialog capped at 560px, tighter cards/gaps and 44px controls. Flex dialog reserves header and scrolls body within available viewport. Automated checks and production build pass; real-device visual review remains open.
