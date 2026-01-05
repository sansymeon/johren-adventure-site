/**
 * JOHREN JBS — VISIT & QR RULES (DO NOT SOFTEN)
 *
 * • Generic JBS QR codes may share a target URL.
 * • QR identity is preserved internally (qr_id), never exposed in UI.
 * • Passive merchants use generic JBS QR codes.
 * • Active merchants use merchant-specific QR codes.
 *
 * VISITS:
 * • Visits are recorded silently.
 * • At most once per calendar day, per user, per place.
 * • No visit count updates in real time.
 * • All visit counts publish once daily at local midnight.
 *
 * UI:
 * • Visit numbers are archival, not feedback.
 * • No animation, highlighting, ranking, or explanation.
 *
 * If a change conflicts with the above,
 * it is a DESIGN CHANGE, not a refactor.
 */
