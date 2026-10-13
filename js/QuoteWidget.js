import { ApiComponent } from './ApiComponent.js';

export class QuoteWidget extends ApiComponent {
    #currentQuote;

    constructor(containerId) {
        super(containerId);
        this.#currentQuote = null;
    }

    async fetchData() {
        const res = await fetch('https://api.adviceslip.com/advice');
        if (!res.ok) throw new Error('Не удалось загрузить совет');
        const data = await res.json();
        return {
            content: data.slip.advice,
            author: 'Мудрость космоса'
        };
    }

    render(data) {
        const container = document.getElementById(this.getContainerId());
        if (!container) return;
        container.innerHTML = '';

        if (data) this.#currentQuote = data;

        const widget = document.createElement('section');
        widget.className = 'widget quote-widget';

        let content;
        if (this.isLoading) {
            content = '<p class="loading">Связь с Землёй...</p>';
        } else if (this.error) {
            content = `<p class="error">⚠️ ${this.error}</p>`;
        } else if (this.#currentQuote) {
            content = `
                <blockquote class="quote">
                    <p>«${this.#currentQuote.content}»</p>
                    <footer>— ${this.#currentQuote.author}</footer>
                </blockquote>
            `;
        } else {
            content = '<p>Нет данных</p>';
        }

        widget.innerHTML = `
            <h2 class="widget-title">Послание из космоса</h2>
            ${content}
            <button class="btn btn-secondary refresh-btn">Новое послание</button>
        `;
        this._setElement(widget);

        widget.querySelector('.refresh-btn').addEventListener('click', () => this.loadData());
        container.appendChild(widget);
    }
}