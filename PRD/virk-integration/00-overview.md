# Virk.dk Integration - Overview

> **Note:** This is the practical implementation guide. For complete technical design and rationale, see [`../11-rfc-virk-enrichment.md`](../11-rfc-virk-enrichment.md).

## Purpose

Virk.dk company enrichment feature extends LinkedIn Lead Exporter to augment leads with official Danish company data from Central Business Register (CVR).

## Document Structure

- `00-overview.md` - Navigation guide
- `01-key-features.md` - User-facing and technical features
- `02-implementation-steps.md` - Development phases
- `03-testing-checklist.md` - QA and edge cases
- `04-future-enhancements.md` - Post-MVP improvements

## Related Documents

**New RFC:** `../11-rfc-virk-enrichment.md`

**Updated PRD Files:**
- `../03-functional-requirements.md` - Section 6
- `../04-architecture.md` - Flow diagram
- `../05-scope.md` - MVP scope
- `../06-ui-sketch.md` - UI mockups
- `../10-implementation-notes.md` - Schema

## Quick Reference

**User Flow:**
LinkedIn scrape → Enrich with Virk → Search virk.dk → Extract CVR → Display → Export

**Data Added:** 9 fields (CVR, address, postal code, city, start date, company form, status, enriched flag, timestamp)

**Files Created:** 5 modules (~310 lines total)

**Current Branch:** `codex/extend-chrome-utils-for-domain-specific-functionality`
