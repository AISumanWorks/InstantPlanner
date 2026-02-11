# How to Fix "Cloud Save Error"

The error `Could not find the table 'public.tasks'` means your Supabase database is empty. You need to create the table.

## Step 1: Go to Supabase
1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open your project.

## Step 2: Open SQL Editor
1.  On the left sidebar, click the **SQL Editor** icon (it looks like a terminal `>_`).
2.  Click **+ New Query**.

## Step 3: Run this Code
Copy and paste the following code into the editor and click **Run** (bottom right).

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

## Step 4: Reload App
1.  Go back to your Study Planner app.
2.  Reload the page.
3.  Click the Settings icon again and hit **Save & Connect**.
4.  You should now see: "✅ Connected to Cloud Database!"
