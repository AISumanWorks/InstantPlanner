# 📅 Instant Study Planner

**Transform your Gemini/ChatGPT chaos into clarity.**

A modern, hierarchy-based study planner that lets you paste raw schedules from AI tools and instantly converts them into an interactive, cloud-synced dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

## 🔗 Live Demo
**[CLICK HERE TO VIEW LIVE SITE](#)** *(Paste your Hosted URL here, e.g., https://my-planner.netlify.app)*

---

## ✨ Key Features

*   **🧠 Magic Parser**: Paste any text (e.g., "Day 1: Math, Day 2: Science") and it auto-generates task cards.
*   **📂 Hierarchical Navigation**: Organize by **Year > Month > Week > Day**.
*   **☁️ Cloud Sync**: Optional integration with **Supabase** to sync tasks across your phone and laptop.
*   **🎨 Premium UI**: Dark mode with Glassmorphism aesthetics and smooth animations.
*   **✅ Interactive Tracking**:
    *   Radio-style status buttons (Pending ⏳, In Progress 🚧, Completed ✅).
    *   Inline editing for time and details.
*   **📅 Smart Calendar**:
    *   Highlights the **Current Month**.
    *   Dims **Past Months**.
    *   Supports a 5-Week view for comprehensive planning.

## 🛠️ Tech Stack
*   **Frontend**: HTML5, Vanilla CSS3 (Variables, Flexbox, Grid), Vanilla JavaScript.
*   **Backend (Optional)**: Supabase (PostgreSQL) for data persistence.
*   **Icons**: Native UTF-8 Emojis (Lightweight).

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/InstantPlanner.git
cd InstantPlanner
```

### 2. Run Locally
Simply open `index.html` in your browser.
*   *Tip: Use "Live Server" in VS Code for the best experience.*

### 3. (Optional) Setup Cloud Sync
To enable saving tasks to the cloud:
1.  Create a free project at [Supabase.com](https://supabase.com).
2.  Go to the **SQL Editor** in your project dashboard.
3.  Paste and run the following command to create the `tasks` table:

```sql
create table public.tasks (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  content text null,
  day_raw text null,
  week_number numeric null,
  status text null default 'pending'::text,
  time_slot text null,
  date date null,
  user_id uuid null default auth.uid (),
  constraint tasks_pkey primary key (id)
);
```

4.  In the Planner App, click the **Settings (⚙️)** icon.
5.  Enter your **Supabase URL** and **Anon Key**.

---

## 📖 How to Use

1.  **Navigate**: Click **2026** > **Current Month** > **Current Week**.
2.  **Create**: Click **+ New Plan**.
3.  **Paste**: Copy your schedule from ChatGPT or Gemini.
    *   *Example format:* `Day 1, 9:00 AM, Study Math`
4.  **Generate**: Click "Generate Schedule".
5.  **Track**: Click the icons to change status (Pending -> Completed).

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built by AISumanWorks using AI Partner*
