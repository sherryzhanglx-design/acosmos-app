# AI Coach Platform - Project TODO

## Core Features
- [x] OpenAI Responses API integration with Prompt ID support
- [x] Multi-role coaching system (Career, Leadership, Relationships, Grief, Emotions, etc.)
- [x] Conversation state management with store:true parameter
- [ ] Real-time streaming responses
- [x] Voice input with automatic transcription
- [x] Conversation history view with resume capability
- [x] User authentication and profile management

## UI/UX Design
- [x] Cinematic aesthetic with deep teal and burnt orange gradient
- [x] Immersive, distraction-free chat interface
- [x] Bold, centered white sans-serif typography
- [x] Minimalist geometric accents in cyan and orange
- [x] Role selection interface
- [x] Dark, moody background with depth and sophistication

## Database Schema
- [x] Coaching roles table
- [x] Conversations table with role association
- [x] Messages table with streaming support
- [x] User preferences table

## Backend Implementation
- [x] tRPC procedures for chat, roles, and conversations
- [x] OpenAI Responses API wrapper with Prompt ID
- [x] Voice transcription integration
- [x] Session continuity logic

## Testing
- [x] API integration tests
- [x] Conversation flow tests

## Prompt Integration
- [x] Replace generic Career Coach prompt with Andy (Career) professional prompt
- [x] Update coach name from "Career Coach" to "Andi" for career role
- [x] Implement Andy's coaching presence style (calm, minimal, Ray Dalio style)
- [x] Add session goal structure (clarify tension, surface beliefs, identify micro-action)

## A.Cosmos Branding
- [x] Update app name from "AI Coach" to "A.Cosmos"
- [x] Replace logo with A.Cosmos golden logo
- [x] Add intro/splash video on first visit
- [x] Update page title and favicon
- [ ] Integrate role-specific UI designs (pending user upload)

## UI/UX Improvements (Phase 2)
- [x] Deep space starfield background with cosmic atmosphere
- [x] Update 8 coach names to match video naming (Andy, Alma, Anya, Alan, Axel, Atlas, Amos, Annie)
- [x] Add footer with legal/support/about sections
- [x] Design dual-module interface (Deep Coaching + Reflection & Integration)
- [x] Create Apex/Reflection module placeholder page
- [x] Ensure UI aligns with user psychological rhythm and usage patterns

## Anya Prompt Integration
- [x] Integrate Anya's professional inner-strength coach prompt
- [x] Update Anya's description in database seed data

## Alma Prompt Integration
- [x] Integrate Alma's professional relationship coach prompt
- [x] Include safety protocols for violence/harm situations

## Axel Prompt Integration
- [x] Integrate Axel's challenger-style mirror coach prompt
- [x] Implement Detection → Exposure → Movement pattern
- [x] Include emotional overload protocol and conversation exit options

## Bug Fixes
- [ ] Fix Axel prompt not being applied correctly (showing generic coach style instead of challenger style)

## Admin Dashboard Feature
- [ ] Create admin-only tRPC procedures for analytics
- [ ] User statistics: total users, daily active, growth trends
- [ ] Coach usage analytics: conversations per coach, popularity ranking
- [ ] Topic analysis: extract common themes from conversations
- [ ] Build admin dashboard UI with charts and tables
- [ ] Add admin role check for dashboard access

## Apex Prompt Integration
- [x] Integrate Apex high-level integrative coach prompt
- [x] Include role definition (clarity-seeking, identity integration, life-level decisions)
- [x] Implement core stance (calm, grounded, precise, spacious)
- [x] Add working with shared materials protocol
- [x] Include conversation rhythm guidelines (one insight at a time, clear pauses)
- [x] Add question style examples and boundaries/ethics

## Apex Roundtable Page Update
- [x] Replace page copy with new professional Roundtable content
- [x] Update visual hierarchy (smaller font for "How the Roundtable Works")
- [x] De-emphasize "Deep Coaching Sessions" link (lower brightness)
- [x] Maintain existing button structure and functionality

## Apex Roundtable Full Functionality
- [x] Build conversation selector UI on Reflection page
- [x] Display user's past conversations grouped by coach
- [x] Allow multi-select of conversations to bring to Apex
- [x] Create backend API to fetch full conversation content
- [x] Implement Apex chat entry with selected conversations as context
- [x] Pass conversation summaries/excerpts to Apex system prompt
- [x] Add text import option for external conversation content
- [ ] Test complete Roundtable flow end-to-end

## Coach Avatar Images Update
- [x] Crop Axel avatar (top portion with head)
- [x] Copy all avatar images to project public folder
- [x] Update database schema to support avatar URLs
- [x] Update database with avatar URLs for all coaches
- [x] Update Home.tsx coach cards with avatar images
- [x] Update Chat.tsx header and welcome screen with avatars
- [x] Update History.tsx conversation list with avatars

## Legal Pages for App Store Compliance
- [x] Create Privacy Policy page with AI data security emphasis
- [x] Create Terms of Use page with AI disclaimers and EULA
- [x] Create Support page with contact info and FAQ
- [x] Add footer links to legal pages
- [x] Add routes for /privacy, /terms, /support

## Bug Fixes - Coach Avatars & Video
- [x] Module 1: Remove Apex from 8 coaches list (Apex belongs to Module 2)
- [x] Module 1: Add Amos to the 8 coaches list
- [x] Fix avatar sizing - some heads are cut off (140% scale with object-top)
- [x] Fix avatar sizing - increased container to w-24 h-24
- [x] Adjust avatar positioning for consistent display
- [x] Fix intro video sizing - character heads being cut off (object-contain)
- [x] Fix intro video audio - added mute toggle button

## Homepage Web-First Refinement
- [x] Remove intro video entirely (calm entry hall, not media-driven)
- [x] Reduce Hero section vertical height (70vh with flex center)
- [x] Keep logo, product name, tagline centered and elegant
- [x] Ensure "Your Constellation of Guardians" section is glimpsed at bottom of first screen
- [x] Change Hero text from descriptive to invitational tone ("Choose a guardian. Begin a conversation with yourself.")
- [x] Make Guardian cards feel clickable with hover/focus states (glow, scale, motion)
- [x] Reorder Guardians: First row (active): Andy, Alma, Anya, Axel
- [x] Reorder Guardians: Second row (coming soon): Alan, Atlas, Amos, Annie
- [x] Add lock icon and "Coming Soon" label to second row guardians
- [x] Overall feel: calm, spacious, confident, like entering a world

## Official Legal Pages Update for App Store
- [x] Extract content from Terms of Use PDF
- [x] Extract content from Privacy Policy PDF
- [x] Update Terms.tsx with official legal content
- [x] Update Privacy.tsx with official legal content
- [x] Verify pages are publicly accessible (no login required)
- [x] Ensure stable URLs: /terms and /privacy

## URL Accessibility Fix
- [ ] Diagnose why /terms and /privacy URLs are not directly accessible
- [ ] Fix server-side routing for SPA direct URL access
- [ ] Verify URLs work when accessed directly (not just via navigation)


## Apple-Review-Safe Terminology Updates (January 2026)
- [x] client/index.html - Update title and meta description (remove "coaching")
- [x] client/src/pages/Home.tsx - Replace "Deep Coaching", "AI coach", "coaches" with approved terms
- [x] client/src/pages/Chat.tsx - Replace "coaching role", "ICF MCC Level Coach"
- [x] client/src/pages/History.tsx - Replace "Coach" fallback, "coaching session"
- [x] client/src/pages/Support.tsx - Update FAQ answers (remove coach/coaching references)
- [x] client/src/pages/Reflection.tsx - Replace "Deep Coaching Sessions", coach grouping labels
- [x] client/src/pages/ApexChat.tsx - Replace "High-Level Integrative Coach"
- [x] client/src/pages/AdminDashboard.tsx - Update internal labels (lower priority)
- [x] Add safety positioning statement to footer (Home.tsx)
- [x] Add safety positioning statement to Support page top
- [x] Verify no public page contains "coach/coaching" (except legal docs)
- [ ] Save checkpoint after all changes


## Purchase & Subscription Terms Page (January 2026)
- [x] Create PurchaseTerms.tsx page component
- [x] Add /purchase-terms route in App.tsx
- [x] Add link in footer (Home.tsx) next to Terms of Use and Privacy Policy
- [x] Add link in Support.tsx legal section
- [x] Save checkpoint


## Axel Safety & Boundary Guardrails (January 2026)
- [x] Find Axel's current system prompt in database
- [x] Append safety guardrails to Axel's system prompt
- [x] Verify update in database
- [x] Save checkpoint


## Axel Dynamic Intensity Control (January 2026)
- [x] Add Dynamic Intensity Control section to Axel's system prompt
- [x] Save checkpoint


## Axel Scheme C Complete Instructions (January 2026)
- [x] Replace Axel's system prompt with complete Scheme C instructions
- [x] Include Entry Requirement (Clarity Reminder)
- [x] Include Internal Clarity Reset
- [x] Include Behavioral Boundaries
- [x] Include Model Independence Clause
- [x] Save checkpoint


## Axel Immediate Clarity Reminder (January 2026)
- [x] Modify Axel's welcome message to show clarity reminder immediately on chat entry
- [x] Save checkpoint


## Customize Welcome Messages & Reorder Guardians (January 2026)
- [x] Add custom welcome message for Andy (career)
- [x] Add custom welcome message for Anya (emotion → now grounding/boundaries)
- [x] Add custom welcome message for Alma (relationship → now love/intimacy)
- [x] Rename Andi to Andy in system prompt
- [x] Swap Alma and Anya order (Anya before Alma)
- [x] Reorder first row: Andy, Anya, Alma, Axel
- [x] Save checkpoint


## Anya Reflection Card Feature (January 2026)
- [x] Upload test card image to S3 storage
- [x] Create ReflectionCard component with card data structure
- [x] Add "Draw a reflection card" button to Anya's chat
- [x] Implement card display with image and text
- [x] Add "Reflect with Anya" and "Draw another" buttons
- [x] Send card payload to chat when reflecting
- [x] Update Anya's system prompt with card interaction instructions
- [x] Test the complete flow
- [x] Save checkpoint


## Anya Card Expansion (January 2026)
- [x] Extract 6 new card images from zip file
- [x] Copy all card images to project public folder
- [x] Update ReflectionCard component with all 7 cards data
- [x] Add draw card button next to chat input field
- [x] Update Anya's system prompt with card style boundary note
- [x] Test the complete flow
- [x] Save checkpoint


## Card Drawing History Feature (January 2026)
- [x] Add card history state to track drawn cards
- [x] Create history panel UI with card thumbnails
- [x] Add "View History" button to access drawn cards
- [x] Allow clicking on history card to view full size
- [x] Test the complete flow
- [x] Save checkpoint


## Persistent Card History (January 2026)
- [x] Add card_history table to database schema
- [x] Run database migration (pnpm db:push)
- [x] Create tRPC procedures for saving and fetching card history
- [x] Update Chat.tsx to load history from database on mount
- [x] Update Chat.tsx to save cards to database when drawn
- [x] Test persistent history across sessions
- [x] Save checkpoint


## Bug Fix: Star Button Not Working (January 2026)
- [x] Fix star button click handler to open card drawer during conversation
- [x] Test the fix


## Anya "No Inaction" Guidance (January 2026)
- [x] Add guidance to Anya's system prompt for handling strong feelings
- [x] Ensure Anya offers at least two valid paths as options
- [x] User explicitly chooses direction and pace
- [x] Save checkpoint


## Alma "No Inaction" Guidance (January 2026)
- [x] Add 'Active Response to Strong Feelings' section to Alma's system prompt
- [x] Include relationship-focused example for offering options
- [x] Save checkpoint


## Bug Fix: Mobile History Not Visible (January 2026)
- [x] Investigate History button visibility on mobile
- [x] Check conversation persistence on mobile browsers (uses 1-year session cookie)
- [x] Fix mobile responsiveness for History navigation (compact button on mobile, icon-only)
- [x] Add History button to Chat page header for easy access
- [x] Test on mobile viewport
- [x] Save checkpoint


## Session Persistence Guidance (January 2026)
- [x] Add session persistence FAQ to Support page (2 new FAQs added)
- [x] Add first-login tip about staying logged in (mobile banner for new users)
- [x] Save checkpoint


## Background Color Change (January 2026)
- [x] Change background from black to dark blue night sky
- [x] Update cosmos-bg class with dark blue gradient and nebula effects
- [x] Save checkpoint


## Phase Closure Mechanism V1 (January 2026)
- [x] Add phase closure awareness to Andy's system prompt
- [x] Add phase closure awareness to Anya's system prompt
- [x] Add phase closure awareness to Alma's system prompt
- [x] Add phase closure awareness to Axel's system prompt
- [x] Create frontend detection for closure signals in coach responses
- [x] Implement inline notice component for space transition options (PhaseClosureNotice.tsx)
- [x] Add "explore other coaches" option with available coaches list
- [x] Add "return later" gentle suggestion
- [x] Add "App coming soon" future hint (non-intrusive)
- [x] Ensure no commercial language (quota/limit/free) appears
- [x] Ensure closure suggestion appears max once per session
- [x] Test natural conversation flow with closure mechanism (16 tests passing)
- [ ] Save checkpoint


## Black & White Line Art Avatars (January 2026)
- [x] Generate black and white line art avatar for Andy (career coach)
- [x] Generate black and white line art avatar for Anya (anxiety/grounding coach) - no glasses, holding coffee
- [x] Generate black and white line art avatar for Alma (relationships coach) - no pattern, hands not visible
- [x] Generate black and white line art avatar for Axel (transformation coach)
- [x] Present avatars for user review
- [x] Integrate into website (replaced colorful versions)
- [x] Save checkpoint


## Replace Coach Avatars with B&W Versions (January 2026)
- [x] Copy final B&W avatars to replace colorful versions
- [x] Avatars use local file paths (no database update needed)
- [x] Test website to verify avatar changes
- [x] Save checkpoint


## Fix Avatar Head Cropping (January 2026)
- [x] Regenerate Andy avatar with complete head/hair visible, cropped at shoulders
- [x] Regenerate Anya avatar with complete head/hair visible, cropped at V-neck collar
- [x] Regenerate Alma avatar with complete head/hair visible, cropped at collar
- [x] Regenerate Axel avatar with complete head/hair visible, cropped at suit collar
- [x] Replace avatars on website
- [ ] Save checkpoint



## Avatar Improvements Round 2 (January 2026)
- [ ] Regenerate Anya avatar with more shoulder lines on left and right
- [ ] Regenerate Alma avatar with shoulder lines added (not just collar)
- [ ] Regenerate Axel avatar with improved beard (current one looks odd)
- [ ] Adjust CSS so heads are lower (fully show hair, shoulders/collar at bottom not middle)
- [ ] Present all changes to user for confirmation
- [ ] Apply approved changes and save checkpoint

## Avatar Improvements Round 3 (January 2026)
- [x] Regenerate Anya with neutral East-West appearance (less Asian, reference original)
- [x] Regenerate Axel with casual attire (not formal suit/tie)
- [x] Present updated avatars for user confirmation
- [x] Replace avatars on website (anya_v5, alma_v5, axel_v4)
- [x] Adjust CSS for face-centered positioning



## Fix Avatar Line Clarity (January 2026)
- [ ] Regenerate Anya with thicker, bolder lines (current lines too thin/faint)
- [ ] Regenerate Alma with thicker, bolder lines (current lines too thin/faint)
- [ ] Regenerate Axel with thicker, bolder lines (current lines too thin/faint)
- [ ] Match line thickness to Andy's avatar style
- [ ] Replace avatars and verify display quality
- [ ] Save checkpoint

## Fix Avatar Head Size (January 2026)
- [ ] Regenerate Anya with larger head, minimal clothing visible
- [ ] Regenerate Alma with larger head, minimal clothing visible
- [ ] Regenerate Axel with larger head, casual shirt (NO suit/tie)
- [ ] All avatars: thick bold lines, head fills most of frame
- [ ] Replace and verify on website


## Fix Avatar Positioning Per Character (January 2026)
- [ ] Andy: Move down on homepage and chat (head too high, hair cut off)
- [ ] Anya: Move down on homepage and chat (head too high, hair cut off)
- [ ] Alma: Reduce size/zoom out on homepage and chat (too big, too full)
- [ ] Reference Axel's positioning as the correct standard
- [ ] Verify all avatars display correctly on both homepage and chat dialog


## Design Unique Backgrounds for Each AI Coach (January 2026)
- [ ] Review current coach role settings (Andy, Anya, Alma, Axel)
- [ ] Design background theme for Andy (North Star - career/purpose)
- [ ] Design background theme for Anya (Jupiter - anxiety/calm)
- [ ] Design background theme for Alma (Venus - love/relationships)
- [ ] Design background theme for Axel (Mirror - truth/transformation)
- [ ] Implement backgrounds in Home.tsx coach cards
- [ ] Implement backgrounds in Chat.tsx header/welcome screen
- [ ] Verify display and get user confirmation
- [ ] Save checkpoint


## Anya Avatar Redesign & Coach Backgrounds (January 2026)
- [ ] Review original Anya reference image
- [ ] Review Alma avatar positioning as reference
- [ ] Generate new Anya B&W avatar with complete shoulders/clothing
- [ ] Present new Anya avatar to user for confirmation
- [ ] Implement Andy background (deep blue + constellation lines)
- [ ] Implement Anya background (soft purple-blue + nebula)
- [ ] Implement Alma background (rose gold/coral + soft glow)
- [ ] Implement Axel background (silver-gray to blue + prism effect)
- [ ] Update Anya avatar on website
- [ ] Verify all changes
- [ ] Save checkpoint


## Fix Andy Avatar Line Thickness (January 2026)
- [ ] Review current Andy avatar and compare with Anya, Alma, Axel
- [ ] Generate new Andy B&W avatar with thicker, bolder lines
- [ ] Present to user for confirmation before updating website
- [ ] Replace Andy avatar on website
- [ ] Save checkpoint


## PWA Implementation (February 2026)
- [x] Create manifest.json with app metadata
- [x] Generate PWA icons in multiple sizes (192x192, 512x512)
- [x] Set up Service Worker for caching
- [x] Add splash screen configuration for iOS
- [x] Optimize mobile UI for fullscreen experience
- [x] Add apple-touch-icon and theme-color meta tags
- [x] Test PWA installation on mobile
- [x] Upload large avatar images to S3 CDN
- [x] Upload card images to S3 CDN
- [x] Upload logo and apex avatar to S3 CDN
- [x] Update database with CDN avatar URLs
- [x] Update ReflectionCard.tsx with CDN card URLs
- [x] Update all logo references to CDN URLs
- [x] Add PWA install prompt component
- [x] Move large files to webdev-static-assets folder
- [x] Save checkpoint


## PWA Installation Instructions (February 2026)
- [x] Add PWA hint next to "Mobile App coming soon" announcement on homepage
- [x] Add PWA installation FAQ to Support page (iOS Safari, Android Chrome, Desktop)
- [x] Save checkpoint


## Usage Tracking Infrastructure (February 2026)
- [x] Create user_usage table in database schema (daily/weekly/monthly counts)
- [x] Create usage_logs table for detailed tracking
- [x] Run database migration
- [x] Create tRPC procedures for checking and updating usage
- [x] Integrate usage tracking into chat message flow
- [x] Integrate usage tracking into conversation creation
- [x] Integrate usage tracking into Apex sessions
- [x] Integrate usage tracking into card draws
- [x] Add admin endpoints for usage analytics
- [x] Write tests for usage tracking
- [x] Save checkpoint


## Admin Usage Dashboard (February 2026)
- [x] Create UsageDashboard.tsx page component
- [x] Add usage overview cards (total users, conversations, messages)
- [x] Add daily/weekly/monthly usage trend charts
- [x] Add Guardian usage breakdown chart
- [x] Add top users table
- [x] Add action type distribution chart
- [x] Integrate with admin navigation
- [x] Save checkpoint


## User Detail Page (February 2026)
- [x] Create backend API for fetching user detail by ID
- [x] Create API for fetching user's usage logs with pagination
- [x] Create UserDetail.tsx page component
- [x] Add user profile section (name, email, tier, join date)
- [x] Add usage summary cards (total conversations, messages, etc.)
- [x] Add usage history timeline/table
- [x] Add conversation history list
- [x] Add clickable links in Top Users table to navigate to detail page
- [x] Save checkpoint


## CSV Export Feature (February 2026)
- [x] Create backend API for exporting all users usage data as CSV
- [x] Create backend API for exporting usage logs as CSV
- [x] Add export buttons to Usage Dashboard header
- [x] Implement client-side CSV download functionality
- [x] Save checkpoint


## Email Notification Feature (February 2026)
- [x] Add notification trigger for new user registration
- [x] Add notification trigger for usage milestones (10, 25, 50, 100, 200, 500, 1000 conversations)
- [x] Integrate with notifyOwner system
- [x] Save checkpoint


## Daily/Weekly Summary Notifications (February 2026)
- [x] Create getDailySummary function for aggregating daily stats
- [x] Create getWeeklySummary function for aggregating weekly stats
- [x] Create scheduled endpoint for triggering summary notifications
- [x] Set up cron job for daily summary at 9am PST (17:00 UTC)
- [x] Set up cron job for weekly summary on Mondays at 9am PST (17:00 UTC)
- [x] Save checkpoint


## Anya Avatar and Prompt Update (February 2026)
- [x] Process new Anya avatar image with proper framing (face centered, hair not cut off)
- [x] Upload avatar to S3 CDN
- [x] Update Anya's avatar URL in database
- [x] Add Reflective Illumination Patch to Anya's system prompt
- [x] Save checkpoint


## Fix Andy and Alma Avatar Borders (February 2026)
- [x] Investigate why Andy and Alma avatars don't have smooth circular borders
- [x] Reprocess avatars with proper circular framing (removed hand-drawn circles)
- [x] Upload fixed avatars to S3 CDN
- [x] Update database with new avatar URLs
- [x] Save checkpoint


## Axel Prompt V4 Update (February 2026)
- [x] Replace Axel's system prompt in routers.ts with V4 version
- [x] Update Axel's welcome message in Chat.tsx to match new opening protocol
- [x] Update test assertions if needed (all existing tests pass, pre-existing failure unrelated to Axel)
- [x] Save checkpoint


## Anya Prompt V2 Update (February 2026)
- [x] Replace Anya's system prompt in routers.ts with new version
- [x] Preserve existing card-drawing functionality sections
- [x] Update Anya's welcome message in Chat.tsx to match new opening protocol
- [x] Run tests and verify (all pass, pre-existing unrelated failure only)
- [x] Save checkpoint

## Andy Prompt V2 Update (February 2026)
- [x] Replace Andy's system prompt in routers.ts with new version
- [x] Update Andy's welcome message in Chat.tsx to match new opening protocol
- [x] Run tests and verify (all pass, pre-existing unrelated failure only)
- [x] Save checkpoint

## Alma Prompt V4 Update (February 2026)
- [x] Replace Alma's system prompt in routers.ts with new version
- [x] Update Alma's welcome message in Chat.tsx to match new opening protocol
- [x] Run tests and verify (all pass, pre-existing unrelated failure only)
- [x] Save checkpoint

## Axel Prompt V4 Revised Update (February 2026)
- [x] Replace Axel's system prompt in routers.ts with latest V4 revision
- [x] Verify welcome message still matches (unchanged - opening protocol identical)
- [x] Run tests and verify (all pass, pre-existing unrelated failure only)
- [x] Save checkpoint

## LLM Thinking Budget Increase (February 2026)
- [x] Increase thinking budget from 128 to 4096 tokens in llm.ts
- [x] Run tests and verify (all pass, pre-existing unrelated failure only)
- [x] Save checkpoint

## Visual Enhancement - Cosmic Breath & Constellation Map (February 2026)
- [x] Build CosmicBreath.tsx component with 5-layer particle system (Canvas-based)
- [x] Build InnerConstellationMap.tsx component with Guardian node mapping (SVG/Canvas)
- [x] Redesign Home.tsx with 3-section scroll narrative structure
- [x] Section 1: "Inside each of us..." - hero with Cosmic Breath background
- [x] Section 2: "When life shifts..." - constellation map fade-in
- [x] Section 3: "A constellation of guardians" - Guardian cards mapped to nodes
- [x] Implement scroll-driven animations and section transitions
- [x] Add cursor trail effect (Layer 5)
- [x] Performance optimization: device detection, reduced-motion support
- [x] Preserve existing functionality: navigation, auth, mobile tip, footer
- [x] Run tests and verify (pre-existing unrelated test failure only)
- [x] Save checkpoint

## Visual Refinements V2 (February 2026)
- [ ] Process 8 color avatar images into properly cropped circular format (face centered, no hair cut off)
- [ ] Upload processed avatars to S3 and update code references
- [ ] Remove center logo/black box from Section 1, keep gold pulsing glow behind text
- [ ] Enhance InnerConstellationMap: silver orbits, gold Guardian names, pulsing star nodes
- [ ] Ensure Guardian cards show perfect circles with proper face centering
- [ ] Run tests and verify
- [ ] Save checkpoint


## Visual Refinements - Section 1, Constellation Map, Color Avatars (February 2026)
- [x] Remove central logo from Section 1 hero, reveal golden pulsing glow behind text
- [x] Add goldPulse keyframe animation to index.css
- [x] Fix subtitle layout (separate line from title)
- [x] Enhance InnerConstellationMap visibility: silver orbits, golden names, pulsing 4-point stars
- [x] Process 8 color avatar images with circular cropping (400x400 PNG)
- [x] Upload color avatars to S3 CDN
- [x] Update database with new color avatar URLs for all 8 guardians
- [x] Simplify avatar CSS in Home.tsx, Chat.tsx, History.tsx (pre-cropped circles)
- [x] Update seedDefaultRoles with new avatar URLs


## Visual Refinements Round 2 (February 2026)
- [x] Enhance golden pulsing glow behind hero text (much more visible/prominent)
- [x] Make constellation map scroll-responsive (dynamic, not static/fixed)
- [x] Fix avatar cropping — show full head including hair (reduce image scale in circle)
- [x] Create radiant golden energy glow (star/sun with light rays) Canvas animation behind hero text

## Avatar Fixes Round 3 (February 2026)
- [x] Fix hair being cropped off — reprocess all 8 avatars with more headroom
- [x] Fix Amos missing avatar — check DB and ensure URL is correct

## Visual Refinements Round 4 (February 2026)
- [x] Replace geometric constellation map with cosmic nebula/star cloud image
- [x] Remove circular border from guardian avatar cards
- [x] Replace text labels on nebula constellation map with Guardian color avatar images

## Requirements 3 & 4 Implementation (February 2026)
- [x] Remove nebula constellation map section entirely
- [x] Integrate narrative copy into Hero area (A.Cosmos / Illuminate the stars within you / Inside each of us...)
- [x] Add Guardians area narrative copy (But when life shifts... / In the realm of stars... / Wherever you are...)
- [x] Add fade-in animations for text appearing as user scrolls
- [x] Build Smart Triage backend: LLM-based coach matching tRPC procedure
- [x] Build Smart Triage frontend: dialogue bubble "What's on your mind today?" between Hero and Guardians
- [x] Smart Triage recommendation display with coach avatar + reason + start conversation button

## Homepage Layout Adjustment (February 2026)
- [x] Move "Choose a guardian..." text below narrative and above Smart Triage
- [x] Remove large gap between Section 1 and narrative text (flow as connected paragraphs)

## Guardian Theme Keywords on Homepage (February 2026)
- [x] Replace long descriptions with short theme keywords on guardian cards
- [x] Andy=Career, Anya=Calm, Alma=Love, Axel=Blind Spots, Alan=Leadership, Atlas=2nd Act, Amos=Family, Annie=Grief

## Guardian Theme Keywords on Homepage (February 2026)
- [x] Replace long descriptions with short theme keywords on guardian cards
- [x] Andy=Career, Anya=Calm, Alma=Love, Axel=Blind Spots, Alan=Leadership, Atlas=2nd Act, Amos=Family, Annie=Grief

## OpenAI GPT-5.2 Integration for Axel (February 2026)
- [x] Collect and store OpenAI API Key via webdev_request_secrets
- [x] Add OpenAI GPT-5.2 LLM call helper for Axel in backend
- [x] Route Axel conversations through GPT-5.2, other guardians stay on built-in LLM
- [x] Test Axel with GPT-5.2 and verify prompt responsiveness

## Prompt Protection (February 2026)
- [x] Add Prompt Protection instructions to all 4 active Guardian system prompts (career, anxiety, relationships, transformation)

## Switch All Guardians to OpenAI GPT-4o (February 2026)
- [x] Route Andy, Anya, Alma through OpenAI GPT-4o (same as Axel)
- [x] Update tests to reflect all guardians using OpenAI

## Upgrade to GPT-5.2 (February 2026)
- [x] Switch API model from gpt-4o to gpt-5.2 for all 4 active Guardians

## Bug Fix: Total Users Count in Notification (February 2026)
- [x] Fix string concatenation bug in oauth.ts (SQL SUM returns strings, causing "1001" instead of 3)
- [x] Use COUNT(*) from users table for accurate total user count
