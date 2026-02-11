document.addEventListener('DOMContentLoaded', () => {
    const magicInput = document.getElementById('magic-input');
    const generateBtn = document.getElementById('generate-btn');
    const dashboard = document.getElementById('dashboard');
    const plannerContainer = document.getElementById('planner-container');
    const clearBtn = document.getElementById('clear-btn');

    // Load saved data on startup
    loadData();

    generateBtn.addEventListener('click', () => {
        const text = magicInput.value.trim();
        if (!text) return;

        const schedule = parseSchedule(text);
        if (Object.keys(schedule).length > 0) {
            renderSchedule(schedule);
            saveData(schedule);
            toggleView(true);
            magicInput.value = ''; // Clear input after successful generation
        } else {
            alert('Could not detect a schedule. Please paste a valid plan.');
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your schedule?')) {
            localStorage.removeItem('instantPlannerData');
            renderSchedule({});
            toggleView(false);
        }
    });

    function toggleView(showDashboard) {
        if (showDashboard) {
            dashboard.classList.remove('hidden');
            // smooth scroll to dashboard
            dashboard.scrollIntoView({ behavior: 'smooth' });
        } else {
            dashboard.classList.add('hidden');
        }
    }

    // --- Parsing Logic ---
    function parseSchedule(text) {
        const schedule = {};
        const lines = text.split('\n');

        // Helper to normalize generic days "Day 1" -> "Day 1" (or map to current week if needed later)
        // For now, we accept "Day \d+" as valid keys.

        let currentDay = null;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Strategy 1: CSV-like "Day, Time, Task" detection
            // Regex handles: "Day 1, 7:00 PM ..., Task..."
            // We ignore the header line "Day,Time Slot,..."
            if (line.toLowerCase().startsWith('day,time')) return;

            // Check for CSV pattern: Day X, TimeRange, Task...
            // Matches "Day 1" or "Monday", followed by comma, then time
            const csvMatch = line.match(/^((?:Day\s+\d+)|(?:[A-Za-z]+))\s*,\s*(.*?)\s*,\s*(.*)/i);

            if (csvMatch) {
                const dayName = csvMatch[1].trim(); // e.g., "Day 1"
                const timePart = csvMatch[2].trim(); // e.g., "7:00 PM – 9:00 PM"
                let taskPart = csvMatch[3].trim(); // Rest of the line

                // Handle quoted CSV parts if simple split failed to capture robustly? 
                // For now, naive splitting on first 2 commas is usually enough for this specific format.
                // But the user has quotes: "Install Google Colab..., ..."
                // Let's clean the task part of wrapping quotes
                if (taskPart.startsWith('"') && taskPart.endsWith('"')) {
                    taskPart = taskPart.slice(1, -1).replace(/""/g, '"');
                }

                if (!schedule[dayName]) {
                    schedule[dayName] = [];
                }

                schedule[dayName].push({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    time: timePart,
                    task: taskPart,
                    completed: false
                });
                return;
            }

            // Strategy 2: Standard "Line by Line" (Header based)
            // Detect Day Headers
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const dayMatch = days.find(day => line.toLowerCase().startsWith(day.toLowerCase()));
            const genericDayMatch = line.match(/^Day\s+\d+/i);

            if ((dayMatch || genericDayMatch) && line.length < 30 && !line.includes(',')) {
                currentDay = dayMatch || (genericDayMatch ? genericDayMatch[0] : null);
                if (!schedule[currentDay]) {
                    schedule[currentDay] = [];
                }
                return;
            }

            if (currentDay) {
                // Time Regex trying to be flexible with en-dashes, em-dashes, etc.
                const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:\s*[-–—]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)/;
                const match = line.match(timeRegex);

                if (match) {
                    const time = match[0];
                    let task = line.replace(time, '')
                        .replace(/^[:\-\s]+/, '')
                        .replace(/^[*•-]\s*/, '')
                        .replace(/\*\*/g, '')
                        .trim();

                    if (task) {
                        schedule[currentDay].push({
                            id: Date.now() + Math.random().toString(36).substr(2, 9),
                            time: time.trim(),
                            task: task,
                            completed: false
                        });
                    }
                }
            }
        });

        return schedule;
    }

    // --- Rendering Logic ---
    function renderSchedule(schedule) {
        plannerContainer.innerHTML = '';
        const dayNames = Object.keys(schedule);

        if (dayNames.length === 0) {
            // Optional: Show empty state
            return;
        }

        dayNames.forEach(day => {
            const tasks = schedule[day];
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';

            let tasksHtml = tasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" data-day="${day}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="task-content">
                        <div class="task-time">${task.time}</div>
                        <div class="task-details">${task.task}</div>
                    </div>
                </div>
            `).join('');

            dayCard.innerHTML = `
                <div class="day-header">
                    <h3>${day}</h3>
                </div>
                <div class="task-list">
                    ${tasksHtml}
                </div>
            `;

            plannerContainer.appendChild(dayCard);
        });

        attachTaskListeners();
    }

    function attachTaskListeners() {
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const day = item.dataset.day;
                toggleTaskCompletion(day, id);
            });
        });
    }

    function toggleTaskCompletion(day, id) {
        const data = loadDataFromStorage();
        if (data && data[day]) {
            const task = data[day].find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveData(data);
                renderSchedule(data);
            }
        }
    }

    // --- Persistence ---
    function saveData(data) {
        localStorage.setItem('instantPlannerData', JSON.stringify(data));
    }

    function loadDataFromStorage() {
        const json = localStorage.getItem('instantPlannerData');
        return json ? JSON.parse(json) : null;
    }

    function loadData() {
        const data = loadDataFromStorage();
        if (data && Object.keys(data).length > 0) {
            renderSchedule(data);
            toggleView(true);
        }
    }
});
