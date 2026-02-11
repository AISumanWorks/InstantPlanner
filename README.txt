# What We Are Creating
We are building the **Instant Study Planner**, a web app that helps you organize your study schedule.

## Current Features (What Works)
1.  **Hierarchical Navigation**:
    *   **Year View**: Shows 2025-2029. Click a year to enter.
    *   **Month View**: Shows Jan-Dec. Click a month to drill down.
    *   **Week View**: Shows Weeks 1-5. Click a week to see tasks.
    *   **Day View**: The final level where you see your actual tasks.

2.  **Magic Generator**:
    *   Paste your study plan (from Gemini or CSV).
    *   It automatically detects "Day X" or "Monday" and time slots.
    *   It creates cards for each day.

3.  **Cloud Sync (Supabase)**:
    *   If you enter your Supabase keys (settings icon), it saves data to the cloud.
    *   **If you DON'T enter keys**, it still works! It just saves to your browser (LocalStorage).

## What Might Seem "Not Working"
*   **"Nothing happens when I paste"**: Ensure you are in the **Day View** (navigate Year > Month > Week first). The generator is inside the "+ New Plan" button there.
*   **"Cloud Error"**: If you see a connection error, it means the Supabase URL/Key is wrong or the Table `tasks` hasn't been created in Supabase yet.
*   **"Empty Dashboard"**: Tasks are linked to specific weeks. If you generated tasks in "Week 1" and then navigated to "Week 2", Week 2 will be empty.

## Visual Guide
1.  **Start**: You see Years. Click **2026**.
2.  **Next**: You see Months. Click **February**.
3.  **Next**: You see Weeks. Click **Week 2**.
4.  **Action**: Click **+ New Plan**, paste your CSV, click **Generate**.
5.  **Result**: You see cards for "Day 1", "Day 2", etc.
