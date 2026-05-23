# Folio — Webflow Diagram

A comprehensive map of every screen, user journey, state transition, and interactive element in the prototype. Use this to identify gaps, friction points, and design opportunities before building out the real backend.

---

## Contents

1. [App Shell & Navigation Model](#1-app-shell--navigation-model)
2. [Feed Tab](#2-feed-tab)
3. [My Clubs — Grid View](#3-my-clubs--grid-view)
4. [Club Detail — Discussion](#4-club-detail--discussion-sub-tab)
5. [Club Detail — Chat](#5-club-detail--chat-sub-tab)
6. [Club Detail — Members & Past Items](#6-club-detail--members--past-items-sub-tabs)
7. [Discover Tab](#7-discover-tab)
8. [Leaderboard Tab](#8-leaderboard-tab)
9. [Stats Tab](#9-stats-tab)
10. [Profile Tab](#10-profile-tab)
11. [Loading, Empty & Responsive States](#11-loading-empty--responsive-states)
12. [Interactive Element Inventory](#12-interactive-element-inventory)
13. [Data Flow & Component Map](#13-data-flow--component-map)
14. [Identified Gaps & Opportunities](#14-identified-gaps--opportunities)

---

## 1. App Shell & Navigation Model

The top-level routing model. The `activeTab` state lives in `App.jsx` and is passed into `NavBar`.

```mermaid
flowchart TD
    ENTRY([User opens app]) --> SHELL

    SHELL["App Shell
    ─────────────────────────
    NavBar — persistent, sticky top
    main — renders active tab content
    key=tab → triggers fade-up animation on switch"]

    SHELL --> NAV{"activeTab\nuseState — default: feed"}

    NAV -->|feed| FEED["Global Feed"]
    NAV -->|clubs| CLUBS["My Clubs"]
    NAV -->|recs| DISCOVER["Discover"]
    NAV -->|board| RANKS["Leaderboard"]
    NAV -->|stats| STATS["Stats"]
    NAV -->|profile| PROFILE["Profile"]

    FEED & CLUBS & DISCOVER & RANKS & STATS & PROFILE -->|"setActive(tabId)"| NAV

    SHELL --> TOPNAV["Desktop NavBar ≥640px
    ─────────────────────────
    Folio logo — amber F badge
    6 tab buttons with icons + labels
    Active tab: amber tint + amber text
    Bell icon — amber pulse dot badge
    User avatar AC — top right"]

    SHELL --> BOTTOMNAV["Mobile BottomTabBar <640px
    ─────────────────────────
    Fixed to viewport bottom
    6 icon + label tab buttons
    Active tab: amber icon + text
    pb-20 padding on main to clear bar"]
```

---

## 2. Feed Tab

```mermaid
flowchart TD
    ENTER([Enter Feed tab]) --> LOADSTATE

    LOADSTATE{"useState: loaded\ndefault = false"}

    LOADSTATE -->|"useEffect: setTimeout 600ms"| SKELETON["3× Skeleton shimmer cards
    Shimmer animation: CSS linear-gradient
    background-position 400px keyframe
    1.6s loop"]

    SKELETON -->|"600ms → setLoaded(true)"| CARDS["8 FeedCard components
    Rendered from FEED mock array"]

    CARDS --> CARD

    CARD["FeedCard
    ──────────────────────────────
    Avatar — initials circle, unique colour per user
    Username — medium weight
    ActivityBadge — finished / started / rated / recommended / discussed
    Timestamp — muted
    Club name — sage green
    ──────────────────────────────
    Content type icon — book / film / mic / gamepad
    Content title — Playfair Display, semibold
    Star rating — rendered if item.rating exists
    Note excerpt — 1–2 lines, muted, line-clamp-2
    ──────────────────────────────
    Like button — Heart icon
    Comment count — MessageCircle icon"]

    CARD -->|"onMouseEnter / Leave"| HOVER["translateY(-2px)
    border opacity increases
    150ms transition"]

    CARD --> LIKE_BTN["Like button
    useState: liked = false
    onClick: toggles liked
    Heart fill + colour changes
    Count increments by 1"]

    CARD --> COMMENT_BTN["Comment count
    Static display only
    No action on click"]

    CARDS --> SCROLL["Scrollable column
    max-w-2xl centered
    No pagination — all 8 items rendered"]
```

---

## 3. My Clubs — Grid View

```mermaid
flowchart TD
    ENTER([Enter Clubs tab]) --> STATE

    STATE{"useState: selected\ndefault = null"}

    STATE -->|"selected === null"| GRID_VIEW["Grid view"]

    GRID_VIEW --> HDR["Header row
    'My Clubs' heading + '4 active clubs'
    New Club button — amber — non-functional"]

    GRID_VIEW --> GRID["2-col grid on ≥640px
    1-col on mobile
    4 ClubCard components"]

    GRID --> CLUBCARD

    CLUBCARD["ClubCard
    ──────────────────────────────────────
    Background — unique deep colour per club
    Border — accent colour at low opacity
    ──────────────────────────────────────
    Club type badge — accent colour, uppercase
    Club name — Playfair Display, bold
    Member count
    ──────────────────────────────────────
    Progress ring (SVG)
    Radius calc from size, -90deg rotated
    stroke-dashoffset animated 0.6s
    Shows group average % in centre
    ──────────────────────────────────────
    Current item panel — dark inset
    Context label: Now reading/watching/listening/playing
    Item title — Playfair, semibold
    Item subtitle — author / director / host / studio
    ──────────────────────────────────────
    Bottom row:
    Clock icon + Next meetup date — accent colour
    Unread badge — amber circle with count"]

    CLUBCARD -->|"onMouseEnter"| CARD_HOVER["translateY(-3px)
    border accent brightens to 55 opacity"]

    CLUBCARD -->|"onClick"| SET_SELECTED["setSelected(club)
    Passes full club object"]

    SET_SELECTED --> STATE2{"selected !== null"}

    STATE2 --> DETAIL["Club Detail view
    See sections 4–6"]
```

---

## 4. Club Detail — Discussion Sub-tab

```mermaid
flowchart TD
    DETAIL([Club Detail renders]) --> DETAIL_HDR

    DETAIL_HDR["Club Detail Header
    ─────────────────────────────────
    Back to clubs button → setSelected(null)
    ─────────────────────────────────
    Rounded panel — club bg colour
    Club type badge + accent
    Club name — Playfair, xl bold
    Member avatar stack — max 4 + overflow count
    ─────────────────────────────────
    Current item panel — dark inset
    Cover placeholder — coloured block + type icon
    Context label — amber
    Title — Playfair bold
    Subtitle
    Progress bar — group avg — club accent
    Description text — muted
    ─────────────────────────────────
    Next meetup · Member count row"]

    DETAIL_HDR --> SUBTAB_NAV

    SUBTAB_NAV["Sub-tab bar
    useState: subTab = 'discussion'
    4 buttons: Discussion · Chat · Members · Past
    Active: club accent bg, navy text
    Inactive: transparent, muted text"]

    SUBTAB_NAV -->|"subTab === 'discussion'"| DISC_TAB

    DISC_TAB["Discussion tab renders"]

    DISC_TAB --> NEW_DISC["New Discussion button
    Accent colour border + text
    Non-functional"]

    DISC_TAB --> DISC_LIST["List of discussion posts
    From club.discussions mock array"]

    DISC_LIST --> DISC_POST

    DISC_POST["Discussion post card
    ─────────────────────────────
    User avatar + name + timestamp
    Post title — Playfair, semibold
    Post body — muted text
    ─────────────────────────────
    Heart icon + like count — static
    MessageCircle + reply count — clickable"]

    DISC_POST -->|"onClick reply button"| EXPAND_STATE{"useState: expanded\n=== post.id ?"}

    EXPAND_STATE -->|"no — setExpanded(id)"| SHOW_REPLIES["Reply list — border-top panel
    For each reply:
    Avatar + name + timestamp
    Reply text
    border-b between replies"]

    EXPAND_STATE -->|"yes — setExpanded(null)"| COLLAPSE["Replies hidden"]

    SHOW_REPLIES --> COLLAPSE
    COLLAPSE --> DISC_POST
```

---

## 5. Club Detail — Chat Sub-tab

```mermaid
flowchart TD
    CHAT_ENTER([Chat sub-tab selected]) --> MOUNT

    MOUNT["useEffect on mount
    bottomRef.current.scrollIntoView()
    Scrolls to latest message automatically"]

    MOUNT --> MSG_LIST["Message list
    From club.chat mock array
    Rendered in chronological order"]

    MSG_LIST --> MSG_LOOP["For each message"]

    MSG_LOOP --> IS_OWN{"msg.user.id === 1\ncurrent user?"}

    IS_OWN -->|"yes"| OWN["Own message
    ─────────────────────
    flex-row-reverse — right aligned
    No avatar shown
    Bubble: amber bg #E8A020, navy text
    Border radius: 18 18 4 18 — tail bottom-right
    Timestamp right-aligned below"]

    IS_OWN -->|"no"| OTHER["Other's message
    ─────────────────────
    flex-row — left aligned
    Avatar shown left of bubble
    Sender name above bubble — muted
    Bubble: translucent white bg, off-white text
    Border radius: 18 18 18 4 — tail bottom-left
    Timestamp left-aligned below"]

    MSG_LIST --> INPUT_ROW["Input row — pinned bottom
    ─────────────────────────────
    Text input — readOnly, styled
    Placeholder: 'Send a message…'
    Send button — amber — non-functional"]
```

---

## 6. Club Detail — Members & Past Items Sub-tabs

```mermaid
flowchart TD
    MEM_ENTER([Members sub-tab selected]) --> MEM_LIST

    MEM_LIST["Member list
    From club.memberDetails array
    One row per member"]

    MEM_LIST --> MEM_ROW["Member row
    ─────────────────────────────
    Avatar — initials + colour
    Name — medium weight
    Progress bar — club accent colour
    Completion % — accent, right side
    'Last active X' — muted, small"]

    PAST_ENTER([Past Items sub-tab selected]) --> PAST_GRID

    PAST_GRID["2-column grid
    From club.pastItems array"]

    PAST_GRID --> PAST_CARD["Past item card
    ─────────────────────────────
    Top block — unique deep colour
    Type icon in corner
    ─────────────────────────────
    Surface panel:
    Title — Playfair, xs semibold
    Star rating — rounded to nearest whole
    Numeric rating / 5 — muted"]

    PAST_CARD -->|"hover"| PAST_HOVER["border opacity +
    translateY(-1px) — subtle lift"]
```

---

## 7. Discover Tab

```mermaid
flowchart TD
    ENTER([Enter Discover tab]) --> PAGE

    PAGE --> HERO["Featured hero card — RECS.featured
    ──────────────────────────────────────
    Full-width rounded panel — deep navy colour
    Left: large cover placeholder block + type icon (40px)
    Right:
      'PICKED FOR YOU' amber pill badge
      Title — Playfair, 2xl bold
      Author name — muted
      Star rating + numeric score + genre pill
      2–3 line description
      'Add to a Club' — amber button — non-functional"]

    PAGE --> ROWS["3 recommendation rows
    From RECS.rows array"]

    ROWS --> ROW_BLOCK["Each row:
    ────────────────────────────
    Section label — contextual
    'Because you're in The Midnight Readers'
    'Trending in Film Clubs this week'
    'Members of Deep Dive Pods also loved'
    ────────────────────────────
    Horizontal scroll container
    overflow-x-auto, no-scrollbar
    4 RecCard components per row"]

    ROW_BLOCK --> REC_CARD["RecCard — fixed width 150px
    ────────────────────────────
    Top block — unique deep colour
    Type icon centred (24px)
    ────────────────────────────
    Surface panel:
    Title — Playfair, xs semibold, line-clamp-2
    Sub — author/director/host — muted, truncate
    Star rating (9px stars)
    Numeric score — amber
    Genre pill — muted"]

    REC_CARD -->|"onMouseEnter\nsetHovered(true)"| HOVERED{"hovered?"}

    HOVERED -->|"yes"| OVERLAY["Absolute overlay
    Dark translucent backdrop
    'Add to Club' amber button — centred
    Non-functional"]

    HOVERED -->|"no — onMouseLeave"| REC_CARD
```

---

## 8. Leaderboard Tab

```mermaid
flowchart TD
    ENTER([Enter Leaderboard tab]) --> PAGE

    PAGE --> TOP_ROW["Header row
    'Leaderboard' heading
    Period toggle — useState: period = 'month'"]

    TOP_ROW --> PERIOD{"period"}

    PERIOD -->|"'month'"| MONTH_BTN["This Month — selected
    Amber bg, navy text"]
    PERIOD -->|"'alltime'"| ALL_BTN["All Time — selected
    Amber bg, navy text
    Note: same mock data rendered both ways
    filter not yet implemented"]

    MONTH_BTN & ALL_BTN --> POINTS_ROW["Points key row
    ──────────────────────────────────
    Finish item: 50 pts
    Start discussion: 20 pts
    Rate item: 10 pts
    Reply: 5 pts"]

    POINTS_ROW --> PODIUM["Top 3 Podium — flex items-end justify-center
    ──────────────────────────────────────────
    Rank 2 — left — height 100px — silver border
    Rank 1 — centre — height 130px — gold border
    Rank 3 — right — height 80px — bronze border
    Each: Avatar above platform
    First name + pts below avatar
    Medal emoji + rank label on platform"]

    PODIUM --> TABLE["Full leaderboard — 10 rows
    LeaderRow component per entry"]

    TABLE --> LROW["LeaderRow
    ──────────────────────────────────────────
    Rank number — gold/silver/bronze top 3
    Avatar — initials + colour
    Name + Club — stacked
    Items completed
    Discussion posts
    Streak — red flame icon
    Total points — amber bold
    Alex's row (rank 8): amber tinted background"]

    LROW --> MY_RANK_NUDGE["'Your rank' nudge card
    ──────────────────────────────────
    Zap icon — amber
    'You're ranked #8'
    'X more points and you move up to #7'
    Amber tint background + border"]
```

---

## 9. Stats Tab

```mermaid
flowchart TD
    ENTER([Enter Stats tab]) --> PAGE

    PAGE --> SUMMARY["Summary cards — 2×2 on mobile, 4-col on ≥640px
    ──────────────────────────────────
    Items finished: 47 — amber check icon
    Clubs joined: 4 — sage users icon
    Discussions: 38 — blue speech icon
    Day streak: 8🔥 — red flame icon"]

    PAGE --> ROW1["Middle row — 2-col on ≥640px"]

    ROW1 --> BAR["Monthly bar chart — div-based, no library
    ────────────────────────────────────
    6 months: Jan–Jun
    Each bar: stacked divs by type
    Heights proportional to monthly total
    Stack order top-to-bottom: Games / Podcasts / Films / Books
    Colours: purple / sage / blue / terra
    Max height 108px container
    Legend row: colour dot + label"]

    ROW1 --> DONUT["Media type donut chart — CSS only
    ────────────────────────────────────
    conic-gradient built from ANALYTICS.types
    Segments: Books 38% / Films 32% / Podcasts 21% / Games 9%
    Inner cutout: absolute circle — navy bg
    Legend: dot + label + % in accent colour"]

    PAGE --> HEATMAP["Activity heatmap — div grid, no library
    ────────────────────────────────────
    52 columns × 7 rows = 364 cells
    Deterministic RNG seed 42 — stable on re-render
    5 intensity levels (0–4)
    Colours: near-invisible → dark sage → bright sage
    Day labels M W F on left side
    Less → More legend below
    Horizontal scroll on narrow viewports"]

    PAGE --> ROW2["Bottom row — 2-col on ≥640px"]

    ROW2 --> GENRES["Top genres — horizontal bar chart
    ────────────────────────────────
    5 genres from ANALYTICS.genres
    Bar width proportional to count vs max
    Amber fill, 0.6s width transition
    Count label right-aligned"]

    ROW2 --> RECENT_RATINGS["Recent ratings
    ────────────────────────────────
    5 items from ANALYTICS.recentRatings
    Type icon + title + stars + score /5
    Score in amber bold"]
```

---

## 10. Profile Tab

```mermaid
flowchart TD
    ENTER([Enter Profile tab]) --> PAGE

    PAGE --> HEADER_CARD["Profile header card
    ──────────────────────────────────────────
    Large avatar — 72px, amber ring
    Display name — Playfair, xl bold
    Username @alexchen — muted
    'Member since March 2023' — muted small
    Edit button — top right — non-functional
    ──────────────────────────────────────────
    Bio text — 2 lines
    ──────────────────────────────────────────
    4-col stats strip:
    47 Finished · 4 Clubs · 23 Following · 31 Followers"]

    PAGE --> BADGES["Club badges section
    ────────────────────────────────────
    One pill per club
    Club type icon + club name
    Pill background + border — club accent colour"]

    PAGE --> SHELF["Ratings shelf
    ────────────────────────────────────
    Horizontal scroll — no-scrollbar
    5 book-spine cards — 60px wide each
    Top: type icon
    Middle: truncated title (18 chars)
    Bottom: star + score
    Each card has unique dark colour"]

    PAGE --> FEED_SECTION["Recent activity section
    ────────────────────────────────────
    'Recent activity' heading
    FEED items filtered to user.id === 1"]

    FEED_SECTION --> EMPTY_CHECK{"PROFILE_FEED\nlength > 0?"}

    EMPTY_CHECK -->|"yes"| FEED_CARDS["FeedCard list
    Same component as Global Feed tab
    Reused without modification"]

    EMPTY_CHECK -->|"no"| EMPTY_STATE["Empty state panel
    Coffee icon — muted
    'No activity yet' — medium weight
    'Join a club to start logging' — muted small"]
```

---

## 11. Loading, Empty & Responsive States

```mermaid
flowchart LR
    subgraph LOADING ["Loading States"]
        direction TB
        L1["Feed tab skeleton
        3 SkeletonCard components
        shimmer CSS animation
        bg linear-gradient scrolling
        600ms setTimeout delay
        Replaced by real cards on resolve"]
    end

    subgraph EMPTY ["Empty States"]
        direction TB
        E1["Profile activity feed
        Coffee icon + copy
        Shown when PROFILE_FEED is empty"]
        E2["Future / not yet wired:
        Empty clubs grid
        'You haven't joined any clubs yet'
        — spec'd but not implemented"]
    end

    subgraph BREAKPOINTS ["Responsive Breakpoints"]
        direction TB
        B1["≥640px — sm breakpoint
        Top nav visible — bottom bar hidden
        2-col club grid
        2-col analytics rows
        Recommendation cards visible full width"]
        B2["<640px — mobile default
        Top nav hidden — bottom bar fixed
        1-col club grid
        1-col analytics rows
        pb-20 clears bottom bar
        Horizontal scroll rows remain"]
    end

    subgraph MOTION ["Transitions & Motion"]
        direction TB
        M1["Tab switch: fade-up keyframe
        0.22s ease — translateY 10→0 + opacity 0→1
        Triggered by key=tab on main element"]
        M2["Feed / club cards: hover lift
        translateY(-2px) / (-3px)
        150ms transition"]
        M3["Progress rings: stroke-dashoffset
        0.6s ease on mount — SVG animation"]
        M4["Progress bars: width
        0.6s ease — progress-fill class"]
        M5["Bell badge: pulse-dot
        1.8s pulseDot keyframe
        opacity 1 → 0.35 → 1"]
        M6["Sub-tab switch: fade-up
        Same keyframe as tab switch"]
    end
```

---

## 12. Interactive Element Inventory

```mermaid
flowchart TD
    subgraph FUNCTIONAL ["Stateful / Functional"]
        direction LR
        F1["Tab buttons — 6 — setActive"]
        F2["Feed like button — toggles liked + count"]
        F3["Club card click — opens detail"]
        F4["Back to clubs button — closes detail"]
        F5["Club sub-tab buttons — 4 — switches sub-tab"]
        F6["Discussion reply button — expand / collapse"]
        F7["RecCard hover — show Add to Club overlay"]
        F8["Leaderboard period toggle — This Month / All Time"]
    end

    subgraph NON_FUNCTIONAL ["Non-functional — UI only"]
        direction LR
        N1["New Club button"]
        N2["New Discussion button"]
        N3["Chat input + Send button"]
        N4["Add to Club / Add to a Club buttons"]
        N5["Profile Edit button"]
        N6["Bell icon — notifications"]
        N7["User avatar top-right"]
        N8["Feed comment count button"]
        N9["Discussion like count"]
        N10["Ratings shelf cards"]
        N11["Past item cards"]
        N12["Podium cards"]
    end
```

---

## 13. Data Flow & Component Map

```mermaid
flowchart TD
    subgraph DATA ["Mock Data — App.jsx module scope"]
        ME["ME — current user object"]
        USERS_D["USERS — 8 user objects"]
        CLUBS_D["CLUBS — 4 club objects
        Each contains: memberDetails
        discussions, chat, pastItems
        currentItem, memberIds"]
        FEED_D["FEED — 8 feed items
        References USERS by index"]
        RECS_D["RECS — featured + 3 rows × 4 items"]
        LB_D["LEADERBOARD — 10 entries
        References USERS by index"]
        ANALYTICS_D["ANALYTICS — summary, monthly
        types, genres, recentRatings"]
        PF_D["PROFILE_FEED — FEED filtered id===1"]
    end

    subgraph COMPONENTS ["Component Tree"]
        APP["App
        useState: activeTab"]
        NAVBAR["NavBar
        Props: active, setActive"]
        GLOBALFEED["GlobalFeed
        Uses: FEED"]
        MYCLUBS["MyClubs
        Uses: CLUBS
        useState: selected"]
        CLUBDETAIL["ClubDetail
        Props: club, onBack
        useState: subTab"]
        DISC_C["DiscussionTab
        Props: club
        useState: expanded"]
        CHAT_C["ChatTab
        Props: club
        useRef: bottomRef"]
        MEM_C["MembersTab
        Props: club"]
        PAST_C["PastItemsTab
        Props: club"]
        RECS_C["Recommendations
        Uses: RECS"]
        LB_C["Leaderboard
        Uses: LEADERBOARD
        useState: period"]
        ANALYTICS_C["Analytics
        Uses: ANALYTICS
        useMemo: heatmap data"]
        PROFILE_C["Profile
        Uses: ME, CLUBS, ANALYTICS
        Uses: PROFILE_FEED"]
    end

    APP --> NAVBAR & GLOBALFEED & MYCLUBS & RECS_C & LB_C & ANALYTICS_C & PROFILE_C
    MYCLUBS --> CLUBDETAIL
    CLUBDETAIL --> DISC_C & CHAT_C & MEM_C & PAST_C

    FEED_D --> GLOBALFEED
    CLUBS_D --> MYCLUBS & CLUBDETAIL & PROFILE_C
    RECS_D --> RECS_C
    LB_D --> LB_C
    ANALYTICS_D --> ANALYTICS_C & PROFILE_C
    ME --> NAVBAR & PROFILE_C
    PF_D --> PROFILE_C
```

---

## 14. Identified Gaps & Opportunities

Areas where the current prototype ends and a real product would begin.

```mermaid
flowchart TD
    subgraph AUTH ["Authentication"]
        A1["No login / signup flow
        Current user hardcoded as ME object
        Needed: auth screen, session management"]
        A2["No user switching
        All data is Alex Chen's POV"]
    end

    subgraph NAV_GAPS ["Navigation Gaps"]
        N1["No deep linking — tab state not in URL
        Refreshing always returns to Feed"]
        N2["No notification panel
        Bell has unread dot but no drawer"]
        N3["Club detail has no URL — not shareable
        Uses local state, not routing"]
    end

    subgraph CLUBS_GAPS ["Clubs Gaps"]
        C1["New Club button — non-functional
        Needs: creation flow, type selection
        member invite, item selection"]
        C2["No search / filter on clubs grid"]
        C3["Progress ring shows mock avg
        Real: needs per-user + aggregate tracking"]
        C4["Chat is fully static — read-only
        Needs: real-time messaging, send"]
        C5["Discussion posts non-interactive
        Like button static, no compose flow"]
        C6["Past Items has no detail view
        Tap on past item goes nowhere"]
    end

    subgraph DISCOVER_GAPS ["Discover Gaps"]
        D1["Add to Club button non-functional
        Needs: club selector modal → add item flow"]
        D2["Recommendation logic is fully static
        Real: personalisation engine needed"]
        D3["No search bar
        Users can't look up specific titles"]
    end

    subgraph LEADERBOARD_GAPS ["Leaderboard Gaps"]
        L1["Period toggle renders same data
        Real: time-bucketed scoring API needed"]
        L2["No tap action on leaderboard rows
        Could navigate to that user's profile"]
        L3["Points system is label-only
        No actual point calculation in prototype"]
    end

    subgraph PROFILE_GAPS ["Profile Gaps"]
        P1["Edit profile non-functional
        Needs: form, avatar upload, bio edit"]
        P2["Following / Followers counts are static
        No follow / unfollow interaction"]
        P3["Ratings shelf items not tappable
        Should navigate to item detail"]
        P4["No way to see other users' profiles
        Only self-profile exists"]
    end

    subgraph SYSTEM_GAPS ["System-level Gaps"]
        S1["No item detail view
        Tapping a title in feed / shelf
        goes nowhere — needs own screen"]
        S2["No notifications system
        Bell dot is cosmetic only"]
        S3["No onboarding flow
        First-time user sees populated data
        Needs: empty state → join clubs flow"]
        S4["No search / discovery entry point
        Discover tab is curated only
        No free-text search"]
        S5["Analytics heatmap uses seeded RNG
        Real: needs activity event logging"]
    end
```

---

*Generated from the `src/App.jsx` source. Update this document when screens or flows change.*
