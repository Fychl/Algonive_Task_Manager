document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'complete') return task.completed;
            if (filter === 'incomplete') return !task.completed;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) li.classList.add('task-completed');

            const header = document.createElement('div');
            header.className = 'task-header';

            const title = document.createElement('h3');
            title.className = 'task-title';
            title.textContent = task.title;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks(filter);
            });

            header.appendChild(checkbox);
            header.appendChild(title);

            const desc = document.createElement('p');
            desc.className = 'task-desc';
            desc.textContent = task.description;

            const dueDate = document.createElement('p');
            dueDate.className = 'task-due-date';
            dueDate.textContent = 'Due: ' + new Date(task.dueDate).toLocaleDateString();

            const actions = document.createElement('div');
            actions.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                editTask(task.id);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                deleteTask(task.id);
            });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(header);
            li.appendChild(desc);
            li.appendChild(dueDate);
            li.appendChild(actions);

            taskList.appendChild(li);
        });
    }

    function addTask(title, description, dueDate) {
        const newTask = {
            id: Date.now(),
            title,
            description,
            dueDate,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks(getCurrentFilter());
        checkReminders();
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newTitle = prompt('Edit Task Title:', task.title);
        if (newTitle === null) return; // Cancelled
        const newDesc = prompt('Edit Task Description:', task.description);
        if (newDesc === null) return; // Cancelled
        const newDueDate = prompt('Edit Task Due Date (YYYY-MM-DD):', task.dueDate);
        if (newDueDate === null) return; // Cancelled

        if (newTitle.trim() === '' || newDueDate.trim() === '') {
            alert('Title and Due Date cannot be empty.');
            return;
        }

        task.title = newTitle.trim();
        task.description = newDesc.trim();
        task.dueDate = newDueDate.trim();

        saveTasks();
        renderTasks(getCurrentFilter());
        checkReminders();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(getCurrentFilter());
    }

    function getCurrentFilter() {
        return document.querySelector('.filter-btn.active').dataset.filter;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTasks(button.dataset.filter);
        });
    });

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-desc').value.trim();
        const dueDate = document.getElementById('task-due-date').value;

        if (!title || !dueDate) {
            alert('Please provide both title and due date.');
            return;
        }

        addTask(title, description, dueDate);
        taskForm.reset();
    });

    function checkReminders() {
        const now = new Date();
        tasks.forEach(task => {
            if (!task.completed) {
                const due = new Date(task.dueDate);
                const diff = due - now;
                const oneDay = 24 * 60 * 60 * 1000;
                if (diff > 0 && diff <= oneDay) {
                    alert(`Reminder: Task "${task.title}" is due within 24 hours!`);
                }
            }
        });
    }

    renderTasks();
    checkReminders();
});
