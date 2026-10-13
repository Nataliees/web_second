import { ApiComponent } from './ApiComponent.js';

export class AstronautWidget extends ApiComponent {
    #astronaut;

    constructor(containerId) {
        super(containerId);
        this.#astronaut = null;
    }

    async fetchData() {
        const res = await fetch('https://randomuser.me/api/');
        if (!res.ok) throw new Error('API недоступно');
        const data = await res.json();
        const user = data.results[0];
        return {
            name: `${user.name.first} ${user.name.last}`,
            photo: user.picture.large,
            location: `${user.location.city}, ${user.location.country}`,
            email: user.email
        };
    }

    render(data) {
        const container = document.getElementById(this.getContainerId());
        if (!container) return;
        container.innerHTML = '';

        if (data) this.#astronaut = data;

        const widget = document.createElement('section');
        widget.className = 'widget astronaut-widget';

        let content;
        if (this.isLoading) {
            content = '<p class="loading">Загружаем профиль астронавта...</p>';
        } else if (this.error) {
            content = `<p class="error">⚠️ ${this.error}</p>`;
        } else if (this.#astronaut) {
            content = `
                <div class="astronaut-profile">
                    <img src="${this.#astronaut.photo}" alt="Астронавт" class="astronaut-photo">
                    <h3 class="astronaut-name">${this.#astronaut.name}</h3>
                    <p class="astronaut-location">${this.#astronaut.location}</p>
                    <p class="astronaut-email">${this.#astronaut.email}</p>
                </div>
            `;
        }

        widget.innerHTML = `
            <h2 class="widget-title">Случайный астронавт</h2>
            ${content}
            <button class="btn btn-secondary refresh-btn">Новый астронавт</button>
        `;
        this._setElement(widget);

        widget.querySelector('.refresh-btn').addEventListener('click', () => this.loadData());
        container.appendChild(widget);
    }
}