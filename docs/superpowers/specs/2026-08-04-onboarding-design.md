# Onboarding — Design Spec

**Date:** 2026-08-04  
**Status:** Approved  
**Product:** TableTap (ShowPOS)

## Goal

Help vendors understand features and show-day workflow via a public guide, a post-register welcome, and a dashboard checklist.

## Scope

### In scope (v1)

- Public `/guide` page (features, workflow, key concepts)
- Post-register `/welcome` page (4 quick steps + CTAs)
- Dashboard checklist banner (auto-complete from API + localStorage dismiss)
- Settings links to guide and checklist reset
- Content in `client/src/content/onboarding.ts`

### Out of scope (v1)

- Backend onboarding flags
- Interactive UI tours / tooltips
- Video embeds

## Routes

| Route | Auth | Layout |
|-------|------|--------|
| `/guide` | Public | `PublicMarketingShell` |
| `/welcome` | Required | Standalone (no app nav) |

Register → `/welcome` → dashboard. Login → `/dashboard` (unchanged).

## Checklist

| Step | Auto-complete |
|------|----------------|
| Create a sales event | `GET /api/events` length ≥ 1 |
| Add stock | `unsoldStockCount > 0` |
| Record a sale | `recentSales.length > 0` or any `profitByEvent.sales_count > 0` |
| Review profit | Always complete on dashboard view |

Dismiss: `localStorage` `tabletap_checklist_dismissed`. Welcome seen: `tabletap_welcome_seen`.

## Files

- `client/src/content/onboarding.ts`
- `client/src/lib/onboardingStorage.ts`
- `client/src/pages/GuidePage.tsx`
- `client/src/pages/WelcomePage.tsx`
- `client/src/components/GettingStartedChecklist.tsx`
- Updates: `App.tsx`, `RegisterPage.tsx`, `DashboardPage.tsx`, `SettingsPage.tsx`, `PublicMarketingShell.tsx`
