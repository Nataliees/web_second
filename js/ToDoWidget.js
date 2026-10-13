import { UIComponent } from './UIComponent.js';

const STORAGE_KEY = 'space_agency_todos';

export class ToDoWidget extends UIComponent {
    #todos;

    constructor(containerId) {
        super(containerId);
        this.#todos = this._loadFromStorage();
    }

    _loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    _saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#todos));
    }

    addTask(text) {
        if (!text.trim()) return;
        this.#todos.push({ id: Date.now(), text, done: false });
        this._saveToStorage();
        this.render();
    }

    toggleTask(id) {
        const task = this.#todos.find(t => t.id === id);
        if (task) {
            task.done = !task.done;
            this._saveToStorage();
            this.render();
        }
    }

    removeTask(id) {
        this.#todos = this.#todos.filter(t => t.id !== id);
        this._saveToStorage();
        this.render();
    }

    render() {
        const container = document.getElementById(this.getContainerId());
        if (!container) return;

        container.innerHTML = '';

        const widget = document.createElement('section');
        widget.className = 'widget todo-widget';
        widget.innerHTML = `
            <h2 class="widget-title">Задачи экипажа</h2>
            <form class="todo-form">
                <input type="text" placeholder="Новая задача..." class="todo-input" required>
                <button type="submit" class="btn btn-primary todo-add-btn">+</button>
            </form>
            <ul class="todo-list">
                ${this.#todos.length === 0
                    ? '<li class="todo-empty">Задач пока нет. Пора на старт!</li>'
                    : this.#todos.map(t => `
                        <li class="todo-item ${t.done ? 'done' : ''}" data-id="${t.id}">
                            <input type="checkbox" ${t.done ? 'checked' : ''}>
                            <span class="todo-text">${this._escapeHtml(t.text)}</span>
                            <button class="btn-delete" title="Удалить">×</button>
                        </li>
                    `).join('')
                }
            </ul>
        `;
        this._setElement(widget);

        widget.querySelector('.todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('.todo-input');
            this.addTask(input.value);
        });

        widget.querySelectorAll('.todo-item').forEach(item => {
            const id = Number(item.dataset.id);
            item.querySelector('input[type="checkbox"]').addEventListener('change', () => this.toggleTask(id));
            item.querySelector('.btn-delete').addEventListener('click', () => this.removeTask(id));
        });

        container.appendChild(widget);
    }

    _escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }
}