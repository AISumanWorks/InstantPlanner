document.addEventListener('DOMContentLoaded', () => {
    // --- State & Config ---
    const state = {
        view: 'year', // year, month, week, day
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        week: 1, // 1-52
        supabase: null
    };

    // --- DOM Elements ---
    const views = {
        year: document.getElementById('year-view'),
        month: document.getElementById('month-view'),
        week: document.getElementById('week-view'),
        day: document.getElementById('day-view')
    };
    const breadcrumbs = document.getElementById('breadcrumbs');
    const settingsModal = document.getElementById('settings-modal');

    // --- Initialization ---
    initSupabase();
    renderView();

    // --- Event Listeners ---
    document.getElementById('settings-btn').addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        loadSettings();
    });

    document.getElementById('close-settings').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    document.getElementById('save-settings').addEventListener('click', async () => {
        const url = document.getElementById('supabase-url').value.trim();
        const key = document.getElementById('supabase-key').value.trim();

        if (url && key) {
            localStorage.setItem('supabaseUrl', url);
            localStorage.setItem('supabaseKey', key);
            initSupabase();
            settingsModal.classList.add('hidden');

            // Verify connection
            if (state.supabase) {
                const { error } = await state.supabase.from('tasks').select('count', { count: 'exact', head: true });
                if (!error) {
                    showToast('Connected to Cloud Database!', 'success');
                    await loadData();
                } else {
                    console.error(error);
                    showToast('Connected, but check your Table permissions.', 'warning');
                }
            }
        } else {
            showToast('Please enter both URL and Key.', 'error');
        }
    });

    document.getElementById('toggle-magic-box').addEventListener('click', () => {
        const box = document.getElementById('magic-box');
        box.classList.toggle('hidden');
    });

    document.getElementById('generate-btn').addEventListener('click', () => {
        const text = document.getElementById('magic-input').value.trim();
        if (!text) return;

        const tasks = parseSchedule(text);
        if (tasks.length > 0) {
            saveTasks(tasks);
            document.getElementById('magic-input').value = '';
            document.getElementById('magic-box').classList.add('hidden');
            renderDayView();
            showToast(`Generated ${tasks.length} tasks!`, 'success');
        } else {
            showToast('No valid tasks found. Try "Day 1, 9am, Math"', 'error');
        }
    });

    // --- View Management ---
    function navigateTo(view, params = {}) {
        state.view = view;
        if (params.year) state.year = params.year;
        if (params.month !== undefined) state.month = params.month;
        if (params.week) state.week = params.week;
        renderView();
    }

    function renderView() {
        // Hide all
        Object.values(views).forEach(el => el.classList.add('hidden'));
        breadcrumbs.classList.remove('hidden');

        // Update Breadcrumbs
        updateBreadcrumbs();

        // Show Current
        views[state.view].classList.remove('hidden');

        if (state.view === 'year') renderYearView();
        else if (state.view === 'month') renderMonthView();
        else if (state.view === 'week') renderWeekView();
        else if (state.view === 'day') renderDayView();
    }

    function updateBreadcrumbs() {
        // Simple logic for now
        const crumbs = [];
        crumbs.push(`<span class="breadcrumb-item" onclick="window.app.nav('year')">${state.year}</span>`);

        if (['month', 'week', 'day'].includes(state.view)) {
            const monthName = new Date(state.year, state.month).toLocaleString('default', { month: 'long' });
            crumbs.push(`<span class="breadcrumb-separator">></span>`);
            crumbs.push(`<span class="breadcrumb-item" onclick="window.app.nav('month')">${monthName}</span>`);
        }

        if (['week', 'day'].includes(state.view)) {
            crumbs.push(`<span class="breadcrumb-separator">></span>`);
            crumbs.push(`<span class="breadcrumb-item" onclick="window.app.nav('week')">Week ${state.week}</span>`);
        }

        breadcrumbs.innerHTML = crumbs.join('');
    }

    // Expose nav for HTML onclicks
    window.app = {
        nav: (view) => navigateTo(view),
        selectYear: (y) => navigateTo('month', { year: y }),
        selectMonth: (m) => navigateTo('week', { month: m }),
        selectWeek: (w) => navigateTo('day', { week: w })
    };

    // --- Renderers ---
    function renderYearView() {
        const container = views.year;
        container.innerHTML = '<div class="grid-container"></div>';
        const grid = container.querySelector('.grid-container');

        // Show only 2026 as requested
        const targetYear = 2026;
        const card = document.createElement('div');
        card.className = `grid-card ${targetYear === state.year ? 'current' : ''}`;
        card.innerHTML = `<h3>${targetYear}</h3><p>Current Year</p>`;
        card.onclick = () => window.app.selectYear(targetYear);
        grid.appendChild(card);
    }

    function renderMonthView() {
        const container = views.month;
        container.innerHTML = '<div class="grid-container"></div>';
        const grid = container.querySelector('.grid-container');

        const months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];

        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const currentYear = now.getFullYear();

        months.forEach((m, index) => {
            const card = document.createElement('div');
            let className = 'grid-card';

            // Logic for Past/Current/Future styling
            // strictly for 2026
            if (state.year === 2026) {
                // If we are actually in 2026, comparing to real months makes sense.
                // If the user's computer date is not 2026, this logic might be odd, 
                // but assuming they want to simulate 2026 being the "active" year.

                // Let's assume for this specific request, 2026 is the "Base" year.
                // If current real year is 2026:
                if (currentYear === 2026) {
                    if (index === currentMonthIndex) {
                        className += ' current-month'; // Active
                    } else if (index < currentMonthIndex) {
                        className += ' past-month'; // Past
                    }
                }
                // If real year is > 2026, everything in 2026 is past.
                else if (currentYear > 2026) {
                    className += ' past-month';
                }
                // If real year < 2026, everything is future (default).
            }

            card.className = className;
            card.innerHTML = `<h3>${m}</h3>`;
            card.onclick = () => window.app.selectMonth(index);
            grid.appendChild(card);
        });
    }

    function renderWeekView() {
        const container = views.week;
        container.innerHTML = '<div class="grid-container"></div>';
        const grid = container.querySelector('.grid-container');

        // 5 Weeks per month as requested (covers up to 35 days)
        for (let i = 1; i <= 5; i++) {
            const card = document.createElement('div');
            card.className = `grid-card ${i === state.week ? 'current' : ''}`;
            card.innerHTML = `<h3>Week ${i}</h3><p>Manage Tasks</p>`;
            card.onclick = () => window.app.selectWeek(i);
            grid.appendChild(card);
        }
    }

    async function renderDayView() {
        const container = document.getElementById('planner-container');
        container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">Loading tasks...</p>';

        const tasks = await loadData();
        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = '<p class="text-center" style="color:var(--text-secondary); text-align:center;">No tasks for this week. Click "+ New Plan" above to add some.</p>';
            return;
        }

        // Group by Day
        const grouped = {};
        tasks.forEach(t => {
            if (!grouped[t.day]) grouped[t.day] = [];
            grouped[t.day].push(t);
        });

        Object.keys(grouped).forEach(day => {
            const dayTasks = grouped[day];
            const card = document.createElement('div');
            card.className = 'day-card';

            const tasksHtml = dayTasks.map(t => createDayTaskHtml(t)).join('');

            card.innerHTML = `
                <div class="day-header"><h3>${day}</h3></div>
                <div class="task-list">${tasksHtml}</div>
            `;
            container.appendChild(card);
        });

        attachTaskListeners();
    }

    function createDayTaskHtml(task) {
        return `
            <div class="task-item ${task.status}" data-id="${task.id}" data-day="${task.day}">
                <div class="task-content">
                    <div class="task-time" contenteditable="true">${task.time || ''}</div>
                    <div class="task-details" contenteditable="true">${task.content || ''}</div>
                </div>
                 <div class="task-actions">
                    <div class="status-radio-group">
                        <button class="status-btn pending ${task.status === 'pending' ? 'active' : ''}" 
                                onclick="window.updateStatus('${task.id}', 'pending', this)" title="Pending">⏳</button>
                        <button class="status-btn in_progress ${task.status === 'in_progress' ? 'active' : ''}" 
                                onclick="window.updateStatus('${task.id}', 'in_progress', this)" title="In Progress">🚧</button>
                        <button class="status-btn completed ${task.status === 'completed' ? 'active' : ''}" 
                                onclick="window.updateStatus('${task.id}', 'completed', this)" title="Completed">✅</button>
                        <button class="status-btn delete-btn" 
                                onclick="window.deleteTask('${task.id}', this)" title="Delete">❌</button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachTaskListeners() {
        // Inline Edit listeners (Time & Details)
        document.querySelectorAll('.task-time, .task-details').forEach(el => {
            el.addEventListener('blur', (e) => {
                const taskItem = el.closest('.task-item');
                const id = taskItem.dataset.id; // Corrected from taskItem.dataset.id
                // For simplicity, we just save everything on blur in future if needed
                // Currently updateStatus logic handles status, content edits are local visual only unless we implement robust field update
                // Implementing simple field update:
                const newVal = el.innerText;
                const field = el.classList.contains('task-time') ? 'time' : 'content';
                const day = taskItem.dataset.day;
                updateTaskField(id, field, newVal);
            });
        });
    }

    // --- Data Manager (Supabase) ---
    function initSupabase() {
        const url = localStorage.getItem('supabaseUrl');
        const key = localStorage.getItem('supabaseKey');
        if (url && key && window.supabase) {
            state.supabase = window.supabase.createClient(url, key);
        }
    }

    function loadSettings() {
        document.getElementById('supabase-url').value = localStorage.getItem('supabaseUrl') || '';
        document.getElementById('supabase-key').value = localStorage.getItem('supabaseKey') || '';
    }

    async function loadData() {
        // If Supabase is connected, fetch from DB
        if (state.supabase) {
            const { data, error } = await state.supabase
                .from('tasks')
                .select('*')
                // .eq('week_number', state.week) // In real app, enable this
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Supabase Error:', error);
                return [];
            }
            return data.map(t => ({
                id: t.id,
                day: t.date ? new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' }) : (t.day_raw || 'Unassigned'),
                time: t.time_slot,
                content: t.content,
                status: t.status
            }));
        }

        // Fallback to LocalStorage
        const local = JSON.parse(localStorage.getItem('instantPlannerData') || '[]');
        return local;
    }

    async function saveTasks(newTasks) {
        if (state.supabase) {
            const user_id = (await state.supabase.auth.getUser()).data.user?.id || null;

            const dbTasks = newTasks.map(t => ({
                content: t.task,
                time_slot: t.time,
                week_number: state.week,
                status: 'pending',
                day_raw: t.dayRaw, // We need to store this string if we don't calculate dates
                date: null
            }));

            const { error } = await state.supabase.from('tasks').insert(dbTasks);
            if (error) {
                console.error(error);
                showToast('Cloud Save Error: ' + error.message, 'error');
            }
        } else {
            // LocalStorage Fallback (Append)
            const current = JSON.parse(localStorage.getItem('instantPlannerData') || '[]');
            const formatted = newTasks.map(t => ({
                id: t.id,
                day: t.dayRaw,
                content: t.task,
                time: t.time,
                status: 'pending'
            }));
            localStorage.setItem('instantPlannerData', JSON.stringify([...current, ...formatted]));
        }
    }

    window.updateStatus = async (id, status, btnElement) => {
        // 1. Visual Update (Instant)
        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskItem) {
            // Update row style
            taskItem.classList.remove('pending', 'in_progress', 'completed');
            taskItem.classList.add(status);

            // Update buttons
            const buttons = taskItem.querySelectorAll('.status-btn');
            buttons.forEach(b => b.classList.remove('active'));
            if (btnElement) btnElement.classList.add('active');
        }

        // 2. Data Update
        if (state.supabase) {
            await state.supabase.from('tasks').update({ status }).eq('id', id);
        } else {
            const current = JSON.parse(localStorage.getItem('instantPlannerData') || '[]');
            const task = current.find(t => t.id == id);
            if (task) {
                task.status = status;
                localStorage.setItem('instantPlannerData', JSON.stringify(current));
            }
        }
    };

    window.deleteTask = async (id, btnElement) => {
        if (!confirm('Delete this task?')) return;

        // 1. Visual Remove
        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskItem) {
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateX(20px)';
            setTimeout(() => taskItem.remove(), 300);
        }

        // 2. Data Remove
        if (state.supabase) {
            await state.supabase.from('tasks').delete().eq('id', id);
            showToast('Task deleted', 'success');
        } else {
            const current = JSON.parse(localStorage.getItem('instantPlannerData') || '[]');
            const filtered = current.filter(t => t.id != id); // Filter out the deleted one
            localStorage.setItem('instantPlannerData', JSON.stringify(filtered));
            showToast('Task deleted', 'success');
        }
    };

    function updateTaskField(id, field, value) {
        // Simplified local update for now
        const current = JSON.parse(localStorage.getItem('instantPlannerData') || '[]');
        const task = current.find(t => t.id == id);
        if (task) {
            if (field === 'time') task.time = value;
            if (field === 'content') task.content = value;
            localStorage.setItem('instantPlannerData', JSON.stringify(current));
        }
    }

    // --- UI Helpers ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Parse Logic ---
    function parseSchedule(text) {
        const lines = text.split('\n');
        const tasks = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let currentDay = null;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            if (line.toLowerCase().startsWith('day,time')) return;

            // CSV
            const csvMatch = line.match(/^((?:Day\s+\d+)|(?:[A-Za-z]+))\s*,\s*(.*?)\s*,\s*(.*)/i);

            if (csvMatch) {
                let taskPart = csvMatch[3].trim();
                if (taskPart.startsWith('"') && taskPart.endsWith('"')) {
                    taskPart = taskPart.slice(1, -1).replace(/""/g, '"');
                }
                tasks.push({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    dayRaw: csvMatch[1].trim(), // e.g., "Day 1"
                    time: csvMatch[2].trim(),
                    task: taskPart
                });
                return;
            }

            // Standard
            const cleanLine = line.replace(/[*#_]/g, '').trim();
            const dayMatch = days.find(day => cleanLine.toLowerCase().startsWith(day.toLowerCase()));
            const genericDayMatch = line.match(/^Day\s+\d+/i);

            if ((dayMatch || genericDayMatch) && line.length < 30 && !line.includes(',')) {
                currentDay = dayMatch || (genericDayMatch ? genericDayMatch[0] : null);
                return;
            }

            if (currentDay) {
                const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:\s*[-–—]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)/;
                const match = line.match(timeRegex);
                if (match) {
                    let task = line.replace(match[0], '')
                        .replace(/^[:\-\s]+/, '')
                        .replace(/^[*•-]\s*/, '')
                        .replace(/\*\*/g, '')
                        .trim();
                    tasks.push({
                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                        dayRaw: currentDay,
                        time: match[0].trim(),
                        task: task
                    });
                }
            }
        });
        return tasks;
    }
});
