
        let tasks = [];
        let selectedStrategy = 'smart-balance';

        // Sample tasks for demonstration
        function addSampleTasks() {
            tasks = [
                {
                    id: 1,
                    title: "Fix login bug",
                    due_date: "2025-11-28",
                    estimated_hours: 2,
                    importance: 9,
                    dependencies: []
                },
                {
                    id: 2,
                    title: "Update documentation",
                    due_date: "2025-12-05",
                    estimated_hours: 3,
                    importance: 5,
                    dependencies: [1]
                },
                {
                    id: 3,
                    title: "Code review for team",
                    due_date: "2025-11-30",
                    estimated_hours: 1,
                    importance: 7,
                    dependencies: []
                },
                {
                    id: 4,
                    title: "Refactor database queries",
                    due_date: "2025-12-10",
                    estimated_hours: 5,
                    importance: 6,
                    dependencies: [1]
                },
                {
                    id: 5,
                    title: "Write unit tests",
                    due_date: "2025-12-03",
                    estimated_hours: 4,
                    importance: 8,
                    dependencies: [1, 3]
                }
            ];
            updateTaskQueue();
            alert('Sample tasks loaded! Click "Analyze & Sort Tasks" to prioritize them.');
        }

        function validateTask(task) {
            if (!task.title || task.title.trim() === '') return { valid: false, error: 'Title is required' };
            if (!task.due_date) return { valid: false, error: 'Due date is required' };
            if (!task.estimated_hours || task.estimated_hours <= 0) return { valid: false, error: 'Estimated hours must be positive' };
            if (task.importance < 1 || task.importance > 10) return { valid: false, error: 'Importance must be 1-10' };
            return { valid: true };
        }

        function addTask() {
            const title = document.getElementById('taskTitle').value;
            const dueDate = document.getElementById('dueDate').value;
            const estimatedHours = parseFloat(document.getElementById('estimatedHours').value);
            const importance = parseInt(document.getElementById('importance').value);
            const dependenciesStr = document.getElementById('dependencies').value;

            const task = {
                id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
                title,
                due_date: dueDate,
                estimated_hours: estimatedHours,
                importance,
                dependencies: dependenciesStr ? dependenciesStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)) : []
            };

            const validation = validateTask(task);
            if (!validation.valid) {
                showAlert(validation.error, 'error');
                return;
            }

            tasks.push(task);
            clearForm();
            updateTaskQueue();
            showAlert(`Task "${title}" added successfully!`, 'success');
        }

        function clearForm() {
            document.getElementById('taskTitle').value = '';
            document.getElementById('dueDate').value = '';
            document.getElementById('estimatedHours').value = '';
            document.getElementById('importance').value = '5';
            document.getElementById('dependencies').value = '';
        }

        function loadFromJSON() {
            try {
                const json = document.getElementById('jsonBulkInput').value.trim();
                if (!json) {
                    showAlert('Please paste JSON data', 'error');
                    return;
                }
                const loadedTasks = JSON.parse(json);
                if (!Array.isArray(loadedTasks)) {
                    showAlert('JSON must be an array of tasks', 'error');
                    return;
                }

                loadedTasks.forEach((t, idx) => {
                    const task = {
                        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1 + idx,
                        title: t.title || 'Untitled',
                        due_date: t.due_date || new Date().toISOString().split('T')[0],
                        estimated_hours: t.estimated_hours || 1,
                        importance: t.importance || 5,
                        dependencies: t.dependencies || []
                    };
                    const validation = validateTask(task);
                    if (validation.valid) {
                        tasks.push(task);
                    }
                });

                updateTaskQueue();
                document.getElementById('jsonBulkInput').value = '';
                showAlert(`${loadedTasks.length} task(s) loaded successfully!`, 'success');
            } catch (e) {
                showAlert('Invalid JSON format: ' + e.message, 'error');
            }
        }

        function updateTaskQueue() {
            const queue = document.getElementById('taskQueue');
            document.getElementById('taskCount').textContent = tasks.length;

            if (tasks.length === 0) {
                queue.innerHTML = '<div class="empty-state"><p>No tasks added yet. Add tasks to see them here.</p></div>';
                return;
            }

            queue.innerHTML = tasks.map(task => `
                <div class="task-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                        <div style="flex: 1;">
                            <div class="task-title">${escapeHtml(task.title)}</div>
                            <div class="task-details" style="margin-top: 8px;">
                                <div class="detail-item"><span class="detail-label">📅 Due:</span> ${task.due_date}</div>
                                <div class="detail-item"><span class="detail-label">⏱️ Hours:</span> ${task.estimated_hours}</div>
                                <div class="detail-item"><span class="detail-label">⭐ Importance:</span> ${task.importance}/10</div>
                            </div>
                            ${task.dependencies.length > 0 ? `<div class="detail-item" style="margin-top: 6px;"><span class="detail-label">🔗 Blocks:</span> Task IDs ${task.dependencies.join(', ')}</div>` : ''}
                        </div>
                        <button class="btn-secondary btn-small" onclick="removeTask(${task.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        function removeTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            updateTaskQueue();
        }

        function selectStrategy(strategy) {
            selectedStrategy = strategy;
            document.querySelectorAll('.strategy-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }

        function calculateTaskScore(task, strategy) {
            const today = new Date();
            const dueDate = new Date(task.due_date);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            let urgencyScore = 0;
            if (daysUntilDue < 0) {
                urgencyScore = 100; // Past due
            } else if (daysUntilDue === 0) {
                urgencyScore = 90; // Due today
            } else if (daysUntilDue <= 3) {
                urgencyScore = 70 + (3 - daysUntilDue) * 5;
            } else if (daysUntilDue <= 7) {
                urgencyScore = 40 + (7 - daysUntilDue) * 4;
            } else {
                urgencyScore = Math.max(10, 40 - (daysUntilDue - 7) / 2);
            }

            const effortScore = 100 / (1 + task.estimated_hours);
            const importanceScore = task.importance * 10;
            const dependencyScore = task.dependencies.length * 15;

            let score = 0;
            let explanation = [];

            switch (strategy) {
                case 'deadline-driven':
                    score = urgencyScore * 0.6 + importanceScore * 0.3 + dependencyScore * 0.1;
                    explanation = [
                        `Urgency: ${Math.round(urgencyScore)}/100 (due in ${daysUntilDue} days)`,
                        `Importance: ${Math.round(importanceScore)}/100`,
                        `Blockers: ${task.dependencies.length} dependent task(s)`
                    ];
                    break;

                case 'high-impact':
                    score = importanceScore * 0.6 + urgencyScore * 0.2 + dependencyScore * 0.2;
                    explanation = [
                        `Importance: ${Math.round(importanceScore)}/100 (rated ${task.importance}/10)`,
                        `Urgency: ${Math.round(urgencyScore)}/100`,
                        `Blockers: ${task.dependencies.length} task(s) blocked`
                    ];
                    break;

                case 'fastest-wins':
                    score = effortScore * 0.5 + importanceScore * 0.3 + urgencyScore * 0.2;
                    explanation = [
                        `Quick Win: ${Math.round(effortScore)}/100 (${task.estimated_hours}h to complete)`,
                        `Importance: ${Math.round(importanceScore)}/100`,
                        `Urgency: ${Math.round(urgencyScore)}/100`
                    ];
                    break;

                case 'smart-balance':
                default:
                    score = urgencyScore * 0.35 + importanceScore * 0.35 + effortScore * 0.2 + dependencyScore * 0.1;
                    explanation = [
                        `Urgency: ${Math.round(urgencyScore)}/100 (due in ${daysUntilDue} days)`,
                        `Importance: ${Math.round(importanceScore)}/100 (rated ${task.importance}/10)`,
                        `Effort: ${Math.round(effortScore)}/100 (${task.estimated_hours}h task)`,
                        task.dependencies.length > 0 ? `Blockers: ${task.dependencies.length} task(s)` : null
                    ].filter(Boolean);
                    break;
            }

            return { score: Math.round(score * 100) / 100, explanation };
        }

        function getPriorityLevel(score) {
            if (score >= 70) return 'high';
            if (score >= 40) return 'medium';
            return 'low';
        }

        function analyzeTasks() {
            if (tasks.length === 0) {
                showAlert('Please add at least one task first', 'error');
                return;
            }

            const resultsSection = document.getElementById('resultsSection');
            resultsSection.style.display = 'block';
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing tasks...</p></div>';

            setTimeout(() => {
                const scoredTasks = tasks.map(task => {
                    const { score, explanation } = calculateTaskScore(task, selectedStrategy);
                    return { ...task, score, explanation, priority: getPriorityLevel(score) };
                }).sort((a, b) => b.score - a.score);

                const topThree = scoredTasks.slice(0, 3);
                const strategySuggestions = {
                    'smart-balance': 'This strategy balances urgency, importance, and effort to find the best overall tasks.',
                    'deadline-driven': 'Prioritizing by deadlines first to ensure nothing falls through the cracks.',
                    'high-impact': 'Focusing on high-impact tasks that deliver the most value.',
                    'fastest-wins': 'Getting quick wins to build momentum and maintain morale.'
                };

                let html = `
                    <div style="margin-bottom: 20px; padding: 12px; background: rgba(33, 128, 160, 0.1); border-radius: 6px; border-left: 3px solid var(--color-primary);">
                        <strong>Strategy: ${selectedStrategy.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong><br>
                        <span style="font-size: 13px; color: var(--color-text-light);">${strategySuggestions[selectedStrategy]}</span>
                    </div>

                    <h3 style="margin: 20px 0 15px 0; color: var(--color-text);">🎯 Top 3 Tasks for Today</h3>
                `;

                topThree.forEach((task, idx) => {
                    html += `
                        <div class="suggestion-item">
                            <div class="suggestion-header">
                                <span class="suggestion-number">${idx + 1}</span>
                                <span>${escapeHtml(task.title)}</span>
                                <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; font-size: 13px; margin-bottom: 10px;">
                                <div><strong>Score:</strong> ${task.score}/100</div>
                                <div><strong>Due:</strong> ${task.due_date}</div>
                                <div><strong>Effort:</strong> ${task.estimated_hours}h</div>
                                <div><strong>Impact:</strong> ${task.importance}/10</div>
                            </div>
                            <div class="suggestion-reason">
                                <strong>Why?</strong><br>${task.explanation.join(' • ')}
                            </div>
                        </div>
                    `;
                });

                html += `<h3 style="margin: 25px 0 15px 0; color: var(--color-text);">📋 All Sorted Tasks (${scoredTasks.length} total)</h3>`;

                scoredTasks.forEach(task => {
                    html += `
                        <div class="task-item priority-${task.priority}">
                            <div class="task-header">
                                <span>
                                    <div class="task-title">${escapeHtml(task.title)}</div>
                                </span>
                                <span style="text-align: right;">
                                    <div class="task-score">${task.score}</div>
                                    <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
                                </span>
                            </div>
                            <div class="task-details">
                                <div class="detail-item"><span class="detail-label">📅</span> ${task.due_date}</div>
                                <div class="detail-item"><span class="detail-label">⏱️</span> ${task.estimated_hours}h</div>
                                <div class="detail-item"><span class="detail-label">⭐</span> ${task.importance}/10</div>
                                ${task.dependencies.length > 0 ? `<div class="detail-item"><span class="detail-label">🔗</span> Blocks: ${task.dependencies.join(', ')}</div>` : ''}
                            </div>
                            <div class="task-explanation">
                                <strong>Analysis:</strong> ${task.explanation.join(' • ')}
                            </div>
                        </div>
                    `;
                });

                resultsContainer.innerHTML = html;
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 800);
        }

        function showAlert(message, type) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;

            const container = document.querySelector('header');
            container.appendChild(alert);

            setTimeout(() => alert.remove(), 4000);
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        // Set default due date to tomorrow
        window.addEventListener('load', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('dueDate').value = tomorrow.toISOString().split('T')[0];
        });
    