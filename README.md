# 🏢 Gajjar Hub — Mobile-First Hostel Web Application

> **Everything hostel, in one place.**  
> A mobile-first, dark-themed progressive web application for hostel residents, designed to streamline complaints, official notices, weekly mess menus, advisory food polls, and hostel management contacts.

Built strictly according to the **Gajjar Hub Product Requirements Document (PRD v2.0)** and design system specifications.

---

## 📸 Overview & Features

| Route | Feature | Student Permissions | Captain / Warden Permissions |
| :--- | :--- | :--- | :--- |
| **`/`** | **Home** | View hero, 3 feature shortcuts, Today's menu (Mess 1 & 2), and Latest notices. Quick complaint submission. | Same + access to all management tools. |
| **`/notices`** | **Notices & Complaints** | Read announcements. Submit complaints **only for assigned wing** (limit: 1 complaint/hour). Thumbs-up/down voting (optimistic + persistent). Delete own complaints. | Post official notices (`+ New notice`), edit/delete notices, change complaint status (`Open`, `In progress`, `Resolved`), delete any complaint. |
| **`/mess`** | **Weekly Menu & Polls** | View 7-day repeating menu with 4 meals/day (Breakfast, Lunch, Snacks, Dinner). Auto-expands today. Vote anonymously in own mess polls. | Edit menu food items via chips modal (`Edit meal`). Create new polls (`+ New poll`), close polls early, delete polls. |
| **`/hs`** | **Hostel Management** | View student council & hostel leadership directory. One-tap actions: Call (`tel:`), WhatsApp (`wa.me`), Email (`mailto:`). | Add, edit, delete, and reorder leaders up and down. |
| **`/login`** | **Authentication** | Sign up with email/password, sign in, password reset. Optional restriction to college email domain. | Sign in with elevated captain account. |
| **`/onboarding`** | **Hostel Onboarding** | Mandatory first-time setup: Full Name, Wing selection (Wing A–D), Room number, Mess (1 or 2). | Initial profile creation. |
| **`/profile`** | **Profile & Settings** | Update personal room/mess details, view non-editable role badge, and sign out. | Manage profile. |

---

## 📝 How to Edit Website Text & Content (Customization Guide)

Want to customize the website's text, headings, descriptions, buttons, or branding? Here is the exact directory and file map where you can easily find and edit any text:

### 1. 🏠 Home Page Heading & Description
- **File**: [`src/app/page.tsx`](./src/app/page.tsx)
- **What you can edit**:
  - **Eyebrow Tag** (Line ~65):
    ```tsx
    <EyebrowBadge>HOSTEL PORTAL</EyebrowBadge>
    ```
  - **Main Hero Heading** (Lines ~68–74):
    ```tsx
    <h1 className="flex flex-col gap-1 sm:gap-2 mb-5 font-bold tracking-[-0.025em]">
      <span className="text-[38px] sm:text-[54px] lg:text-[62px] leading-[1.08] sm:leading-[1.05] text-[#dea32c]">
        Gajjar Hub
      </span>
      <span className="text-[22px] min-[375px]:text-[25px] min-[410px]:text-[28px] sm:text-[42px] lg:text-[50px] leading-snug sm:leading-[1.08] text-primary">
        For you, for all of us
      </span>
    </h1>
    ```
    *(Change "Everything hostel," or "in one place." to your desired tagline)*
  - **Hero Description / Subheading** (Line ~73):
    ```tsx
    <p className="text-[17px] sm:text-[19px] ... text-text-muted ...">
      Raise a complaint, read the latest notices and check today's mess menu without chasing anyone.
    </p>
    ```
  - **Action Buttons** (Lines ~79–98):
    - `"Submit a complaint"`
    - `"View notices"`
    - `"Mess"`
  - **3 Feature Cards** (Lines ~109–176):
    - **Complaints Card**: Title `"Complaints"` and description `"Report an issue with your room, water, power or Wi-Fi and track its status."`
    - **Notices Card**: Title `"Notices"` and description `"Official announcements from the warden and hostel office, newest first."`
    - **Mess Card**: Title `"Mess"` and description `"See what's served for breakfast, lunch, snacks and dinner, every day of the week."`
  - **Section Titles** (Lines ~184 & ~266):
    - `"Today's menu"`
    - `"Latest notices"`

---

### 2. 🌐 Browser Tab Title & Meta Description
- **File**: [`src/app/layout.tsx`](./src/app/layout.tsx)
- **What you can edit** (Lines ~24–31):
  ```typescript
  export const metadata: Metadata = {
    title: "Gajjar Hub — Everything hostel, in one place",
    description: "Raise a complaint, read the latest notices and check today's mess menu without chasing anyone.",
  };
  ```
  *(This controls the browser tab label and the preview description shown in Google or social media links)*

---

### 3. 🧭 Header Logo, Brand Name & Navigation Menu
- **File**: [`src/components/Header.tsx`](./src/components/Header.tsx)
- **What you can edit**:
  - **Logo Title** (Line ~62):
    ```tsx
    <span className="font-semibold text-[20px] tracking-tight text-[#E5E7EB]">
      Gajjar Hub
    </span>
    ```
  - **Navigation Links** (Lines ~28–34):
    ```typescript
    const desktopNavLinks = [
      { href: "/notices?tab=complaints", label: "Complaints" },
      { href: "/notices?tab=notices", label: "Notices" },
      { href: "/mess", label: "Mess" },
      { href: "/hs", label: "Contact" },
    ];
    ```

---

### 4. 📢 Notices & Complaints Page
- **File**: [`src/app/notices/page.tsx`](./src/app/notices/page.tsx)
- **What you can edit**:
  - Page title and subtitles
  - Tab names: `"Notices"` and `"Complaints"`
  - Filter labels: `"All Wings"`, `"My Wing"`, etc.
  - Button text: `"+ New Notice"`, `"+ New Complaint"`

---

### 5. 🍽️ Weekly Mess Menu & Polls Page
- **File**: [`src/app/mess/page.tsx`](./src/app/mess/page.tsx)
- **What you can edit**:
  - Page header: `"Weekly Menu & Polls"`
  - Tab names: `"Weekly Menu"` and `"Advisory Polls"`
  - Meal headings: `"Breakfast"`, `"Lunch"`, `"Snacks"`, `"Dinner"`

---

### 6. 👥 Hostel Management / Committee Directory
- **File**: [`src/app/hs/page.tsx`](./src/app/hs/page.tsx)
- **What you can edit**:
  - Page header: `"Hostel Management"`
  - Subtitle: `"Contact information for hostel warden, supervisors, and student committee"`
  - Button text: `"+ Add Member"`

---

### 7. 🔐 Login & Registration Portal
- **File**: [`src/app/login/page.tsx`](./src/app/login/page.tsx)
- **What you can edit**:
  - Portal title: `"Gajjar Hub"`
  - Portal switcher: `"Student Portal"` vs `"Management Portal"`
  - Input placeholders and login helper hints

---

### 8. 📄 Footer
- **File**: [`src/components/Footer.tsx`](./src/components/Footer.tsx)
- **What you can edit**:
  - Copyright and subtitle: `"© Gajjar Hub"`, `"Campus Hostel Portal"`
  - Warden office phone and email contact links

---

### ⚡ How Changes Take Effect
1. Open any of the files listed above in your code editor (e.g., VS Code).
2. Modify the text inside the quotes or JSX tags (e.g., `"Everything hostel,"` $\rightarrow$ `"Your Hostel Name,"`).
3. Save the file (`Ctrl + S` / `Cmd + S`).
4. **Fast Refresh** will instantly update your browser page at `http://localhost:3000` without needing a manual restart!

---

---

## 🎨 Design System & Scrolling Animations

- **Palette**: Dark charcoal vertical gradient (`#222223` to `#131314`), card surfaces (`rgba(255,255,255,0.04)`), subtle 1px borders (`rgba(255,255,255,0.10)`).
- **Accents**:
  - Primary Action Blue: `#6B95FF` with soft ambient glow (`box-shadow: 0 0 32px rgba(107,149,255,0.35)`). Text on primary: `#0D1224`.
  - Monospace Accent & Headings: `#E6A835` (Amber).
  - Status Indicators: `#4ADE80` (Resolved / Success), `#6B95FF` (In progress), `#E6A835` (Open), `#F87171` (Danger).
- **Typography**: `Manrope` (headings and card body) and `JetBrains Mono` (labels, meal tags, metadata).
- **Scrolling Animations**:
  - **Hero Diamond & Parallax**: Rotated 45° dark charcoal geometric tiles with a primary blue diamond border and soft blue glow that float and respond to scroll depth.
  - **Dynamic Sticky Header**: Header starts fully transparent over the hero and smoothly blurs into a frosted glass backdrop (`bg-[#171718]/90 backdrop-blur-md`) as soon as the user scrolls down.
  - **Staggered Card Reveals**: Every section, card, and list item glides into view with custom cubic-bezier easing (`whileInView`).
  - **Spring-Loaded Bottom Sheets**: All creation and editing forms open as native-feeling bottom sheets over the current page.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`
- **Backend / Database**: Supabase (PostgreSQL, Auth, Row Level Security, Views, Triggers)
- **Date Handling**: `date-fns` & `date-fns-tz` (Asia/Kolkata timezone)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+ installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> **Note**: The application includes an intelligent **Mock / Demo Engine**. If Supabase credentials are not yet entered, Gajjar Hub will automatically run with a rich sample dataset in local storage. You can instantly test both **Student** and **Captain** roles using the floating role switcher on the bottom left!

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Use Mobile View (390px width) in Chrome DevTools for the ideal hostel resident experience.

---

## 🗄️ Supabase Integration Guide

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose a name (e.g. `gajjar-hub`), set a strong database password, and select the region closest to your campus (e.g., *Mumbai / ap-south-1*).

### Step 2: Apply Database Schema & Policies
1. In your Supabase dashboard, navigate to the **SQL Editor** on the left menu.
2. Click **"New query"**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
4. Click **Run**. This automatically sets up:
   - 10 Relational Tables (`wings`, `profiles`, `notices`, `complaints`, `complaint_votes`, `mess_menu`, `polls`, `poll_options`, `poll_votes`, `hostel_leaders`).
   - Secure Views: `complaint_feed` and `poll_results`.
   - Security Definer Function: `is_captain()`.
   - Automatic user profile trigger: `handle_new_user()`.
   - Strict Row Level Security (RLS) policies ensuring students cannot tamper with other wings or access raw vote identities.

### Step 3: Populate Initial Seed Data
1. Open a new query in the **SQL Editor**.
2. Copy the entire contents of [`supabase/seed.sql`](./supabase/seed.sql) and paste it.
3. Click **Run**. This populates:
   - Default wings (`Wing A`, `Wing B`, `Wing C`, `Wing D`).
   - Complete 7-day breakfast, lunch, snacks, and dinner menus for both **Mess 1** and **Mess 2**.
   - Official hostel notices.
   - Initial hostel committee leaders directory.

### Step 4: Configure Project Credentials
1. In your Supabase dashboard, go to **Project Settings** (gear icon) -> **API**.
   2. Copy:
   - **Project URL**
   - **Project API Keys** -> `anon` (public)
3. Open your `.env.local` file and replace the placeholders:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN= # optional, e.g. @college.edu
```
4. Restart your Next.js server (`npm run dev` or `npm run build && npm run start`). Gajjar Hub will now read and write directly to your live Supabase cloud database!

---

## 🔐 Authentication Portals & Sample Credentials

The login page at **`/login`** features two dedicated portals:

### 1. 🎓 Student Portal
- For hostel residents to submit complaints for their assigned wing, upvote issues, view menus, and participate in mess polls.
- Supports both **Sign In** and **New Account Registration**.
- **Sample Student**:
  - **Email**: `student@hostel.edu`
  - **Password**: `password123` (or `Student@2026`)

### 2. 🛡️ Hostel Management Portal
- For the Warden, Hostel Captain, and Mess Conveners to publish announcements, edit weekly meal menus, create polls, update complaint statuses, and manage committee contacts.
- Includes a **1-Click Auto-Fill** button on the UI for quick access.
- **Sample Admin / Captain Credentials**:
  - **Admin ID**: `admin@gajjarhub.edu`
  - **Password**: `Admin@2026`

---


## 👑 Managing Roles (Elevating a Captain or Warden)

Per the PRD security architecture, **roles can never be altered by clients or students directly**. Role elevation is handled strictly through the Supabase Dashboard:

1. Have the captain or hostel warden sign up in the app at `/login`.
2. In your Supabase Dashboard, go to **Table Editor** -> `profiles`.
3. Locate the row for the captain's email/ID.
4. Change the `role` column from `'student'` to `'captain'`.
5. Alternatively, run this SQL command in the SQL Editor:
```sql
UPDATE public.profiles
SET role = 'captain'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'captain@hostel.edu'
);
```
Once updated, when this user signs in, they unlock the blue **CAPTAIN** badge and can publish notices, edit weekly menus, launch polls, update complaint statuses, and manage the hostel leadership roster.

---

## 🌐 Hosting & Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: Gajjar Hub v2.0"
   git push origin main
   ```
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN`: (Optional) e.g. `@svnit.ac.in`.
5. Click **Deploy**. Vercel will build and host your production app globally on edge servers in under 60 seconds!

---

## 📋 Website Management & Routine Maintenance

### 1. Weekly Mess Menu Rotation & Poll Application
- Every Wednesday/Thursday, the Mess Convener creates a new poll in `/mess?tab=polls` asking residents to vote on the upcoming Sunday Feast or special snacks menu.
- Once the poll closes, the winner is highlighted with a gold trophy icon.
- The Captain or Mess Convener clicks the **pencil icon** next to that meal in `/mess?tab=menu` and updates the menu items with the winning dish chips.

### 2. Complaint Triaging Workflow
1. When a student reports an issue (e.g. Geyser leakage in Wing A), it enters the feed as `OPEN` (amber).
2. Fellow students in that wing upvote the complaint to signal severity.
3. The Captain / Maintenance Head inspects the issue and sets the status dropdown to `IN PROGRESS` (primary blue).
4. Once repaired by the hostel electrician or plumber, the Captain marks it `RESOLVED` (green).

### 3. End-of-Semester Roster Updates
- When students graduate or switch rooms, they can update their wing and room in `/profile`.
- To update the student council or warden contacts, the Captain opens `/hs` and updates phone numbers, emails, or adds new incoming leaders.

### 4. Deleting a Student's Data
- Because our schema uses PostgreSQL `ON DELETE CASCADE` across all foreign keys, deleting a student from **Authentication -> Users** automatically cascades and wipes all their profile data, submitted complaints, upvotes/downvotes, and mess poll votes in one step.
- See [`supabase/delete_student.sql`](./supabase/delete_student.sql) for SQL queries to delete by email, delete by user ID, or bulk-delete graduating batches.

---

## 📂 Project Directory Structure

```text
Hostel Web/
├── images/                       # PRD reference images and mockups
├── src/
│   ├── app/
│   │   ├── globals.css           # Global dark theme tokens & scroll styling
│   │   ├── layout.tsx            # Root layout, fonts (Manrope, JetBrains Mono)
│   │   ├── page.tsx              # Home screen (Hero, 3 Cards, Menu, Notices)
│   │   ├── notices/page.tsx      # Notices & Complaints tabs with voting
│   │   ├── mess/page.tsx         # Weekly 7-day Menu & Live Advisory Polls
│   │   ├── hs/page.tsx           # Hostel Management contact directory
│   │   ├── login/page.tsx        # Authentication & password reset
│   │   ├── onboarding/page.tsx   # First-time resident room & wing assignment
│   │   └── profile/page.tsx      # User profile edit & sign out
│   ├── components/
│   │   ├── Header.tsx            # Sticky header with blurred scroll transition
│   │   ├── HeroDecoration.tsx    # Rotated diamond cluster with primary glow
│   │   ├── BottomSheet.tsx       # Reusable animated sliding form sheet
│   │   ├── SegmentedControl.tsx  # Monospace segmented toggle
│   │   ├── Badge.tsx             # Eyebrow and Status badges
│   │   ├── ScrollReveal.tsx      # Smooth viewport scroll animations
│   │   ├── DemoRoleSwitcher.tsx  # Floating role toggle for instant testing
│   │   └── forms/
│   │       ├── NewComplaintSheet.tsx
│   │       ├── NewNoticeSheet.tsx
│   │       ├── EditMealSheet.tsx
│   │       ├── NewPollSheet.tsx
│   │       └── LeaderSheet.tsx
│   ├── context/
│   │   ├── AuthContext.tsx       # Supabase auth state + demo fallback
│   │   └── DataContext.tsx       # Complaints, Notices, Menus, Polls, Leaders
│   └── lib/
│       ├── types.ts              # TypeScript domain interfaces
│       ├── mockData.ts           # PRD-accurate sample dataset
│       └── supabase/
│           └── client.ts         # Supabase browser client
├── supabase/
│   ├── schema.sql                # Complete Postgres DDL, RLS, triggers & views
│   └── seed.sql                  # Initial menu, wings, notices & leaders seed
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies and scripts
└── tailwind.config.ts            # Custom design tokens & colors
```
---

*Created for Gajjar Hostel residents and management.*
