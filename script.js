class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.editingTaskId = null;
        this.deletingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeElements() {
        // Form elements
        this.taskForm = document.getElementById('taskForm');
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskDueDate = document.getElementById('taskDueDate');
        
        // Task list and controls
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.sortSelect = document.getElementById('sortSelect');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Stats elements
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        
        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editTitle = document.getElementById('editTitle');
        this.editDescription = document.getElementById('editDescription');
        this.editDueDate = document.getElementById('editDueDate');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.saveEdit = document.getElementById('saveEdit');
        
        this.deleteModal = document.getElementById('deleteModal');
        this.cancelDelete = document.getElementById('cancelDelete');
        this.confirmDelete = document.getElementById('confirmDelete');
    }

    bindEvents() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Sort and filter controls
        this.sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.saveEdit.addEventListener('click', () => this.handleSaveEdit());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });
        
        this.cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        this.confirmDelete.addEventListener('click', () => this.handleConfirmDelete());
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const title = this.taskTitle.value.trim();
        const description = this.taskDescription.value.trim();
        const dueDate = this.taskDueDate.value;
        
        if (!title) return;
        
        const task = {
            id: this.generateId(),
            title,
            description,
            dueDate: dueDate || null,
            completed: false,
            created: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Reset form
        this.taskForm.reset();
        this.taskTitle.focus();
        
        // Show success animation
        this.showNotification('Task added successfully!', 'success');
    }

    handleTaskToggle(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending';
            this.showNotification(message, task.completed ? 'success' : 'info');
        }
    }

    handleEditTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        this.editTitle.value = task.title;
        this.editDescription.value = task.description || '';
        this.editDueDate.value = task.dueDate || '';
        
        this.openEditModal();
    }

    handleSaveEdit() {
        const title = this.editTitle.value.trim();
        if (!title) {
            this.editTitle.focus();
            return;
        }
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.title = title;
            task.description = this.editDescription.value.trim();
            task.dueDate = this.editDueDate.value || null;
            task.updated = new Date().toISOString();
            
            this.saveTasks();
            this.renderTasks();
            this.closeEditModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    handleDeleteTask(taskId) {
        this.deletingTaskId = taskId;
        this.openDeleteModal();
    }

    handleConfirmDelete() {
        if (this.deletingTaskId) {
            this.tasks = this.tasks.filter(t => t.id !== this.deletingTaskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeDeleteModal();
            this.showNotification('Task deleted successfully!', 'info');
        }
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.renderTasks();
    }

    handleFilterChange(e) {
        // Remove active class from all buttons
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') {
            this.closeEditModal();
            this.closeDeleteModal();
        }
    }

    openEditModal() {
        this.editModal.classList.add('active');
        this.editTitle.focus();
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        this.editModal.classList.remove('active');
        this.editingTaskId = null;
        document.body.style.overflow = '';
    }

    openDeleteModal() {
        this.deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeDeleteModal() {
        this.deleteModal.classList.remove('active');
        this.deletingTaskId = null;
        document.body.style.overflow = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    filterTasks(tasks) {
        const now = new Date();
        
        switch (this.currentFilter) {
            case 'completed':
                return tasks.filter(task => task.completed);
            case 'pending':
                return tasks.filter(task => !task.completed);
            case 'overdue':
                return tasks.filter(task => {
                    if (!task.dueDate || task.completed) return false;
                    return new Date(task.dueDate) < now;
                });
            default:
                return tasks;
        }
    }

    sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            switch (this.currentSort) {
                case 'dueDate':
                    // Handle null due dates
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'title':
                    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
                
                case 'status':
                    if (a.completed === b.completed) return 0;
                    return a.completed ? 1 : -1;
                
                default: // 'created'
                    return new Date(b.created) - new Date(a.created);
            }
        });
    }

    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < new Date();
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const options = {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (diffDays < 0) {
            return `Overdue: ${date.toLocaleDateString('en-US', options)}`;
        } else if (diffDays === 0) {
            return `Today: ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Tomorrow: ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', options);
        }
    }

    renderTasks() {
        const filteredTasks = this.filterTasks(this.tasks);
        const sortedTasks = this.sortTasks(filteredTasks);
        
        if (sortedTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3 class="empty-title">No tasks found</h3>
                    <p class="empty-description">
                        ${this.currentFilter === 'all' 
                            ? 'Create your first task to get started!' 
                            : `No ${this.currentFilter} tasks available.`}
                    </p>
                </div>
            `;
            return;
        }
        
        this.taskList.innerHTML = sortedTasks.map(task => {
            const isOverdue = this.isOverdue(task);
            const formattedDate = this.formatDate(task.dueDate);
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                             onclick="taskManager.handleTaskToggle('${task.id}')">
                        </div>
                        <div class="task-content">
                            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                        </div>
                    </div>
                    <div class="task-meta">
                        <div class="task-due ${isOverdue ? 'overdue' : ''}">
                            ${formattedDate ? `📅 ${formattedDate}` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="action-btn edit" onclick="taskManager.handleEditTask('${task.id}')" title="Edit task">
                                ✏️ Edit
                            </button>
                            <button class="action-btn delete" onclick="taskManager.handleDeleteTask('${task.id}')" title="Delete task">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            this.showNotification('Error saving tasks!', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            this.showNotification('Error loading tasks!', 'error');
            return [];
        }
    }

    // Public methods for external use
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateStats();
                    this.showNotification('Tasks imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing tasks!', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'info');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    
    // Add keyboard shortcut for quick task creation
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            document.getElementById('taskTitle').focus();
        }
    });
    
    // Set default due date to today
    const dueDateInput = document.getElementById('taskDueDate');
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dueDateInput.min = today.toISOString().slice(0, 16);
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}