# UI Changes - Health Videos Feature

## Overview
Added "Health" section in the CMS sidebar with full management interface similar to News page.

## New Files
- `src/pages/Health.tsx` - Main health management page
- `src/actions/health.ts` - API actions

## Modified Files
- `src/components/Sidebar.tsx` - Added "Salud" link
- `src/App.tsx` or router - Added route `/health`

## Features Implemented
- Full table view with search
- Modal to manage multiple videos
- MediaPicker integration for video selection
- Title and description per video
- Save/Load configuration from backend
- English UI texts

## How to Use
1. Go to "Health" in sidebar
2. Click "Manage Videos"
3. Add videos (select from media library)
4. Fill title and description
5. Click "Save"

## Technical Notes
- Uses React Query for data fetching and mutations
- Reuses MediaPicker component
- Follows same pattern as News page

---
**Date:** July 14, 2026