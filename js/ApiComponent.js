import { UIComponent } from './UIComponent.js';

/**
 * Базовый класс для виджетов, получающих данные с внешних API.
 * Добавляет состояние загрузки, обработку ошибок и метод fetchData().
 */
export class ApiComponent extends UIComponent {
    #isLoading;
    #error;

    constructor(containerId) {
        super(containerId);
        this.#isLoading = false;
        this.#error = null;
    }

    /** Абстрактный метод — каждый API-виджет реализует свой URL и обработку данных */
    async fetchData() {
        throw new Error('Метод fetchData() должен быть реализован в наследнике');
    }

    get isLoading() { return this.#isLoading; }
    get error() { return this.#error; }

    /** Универсальный метод загрузки с обработкой состояний */
    async loadData() {
        this.#isLoading = true;
        this.#error = null;
        this.render();
        try {
            const data = await this.fetchData();
            this.#isLoading = false;
            this.render(data);
        } catch (err) {
            this.#isLoading = false;
            this.#error = err.message;
            this.render();
        }
    }
}