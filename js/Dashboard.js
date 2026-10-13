/**
 * Dashboard — композиция виджетов.
 * Управляет их жизненным циклом: регистрация, рендер, обновление, уничтожение.
 */
export class Dashboard {
    #widgets;
    #rootElement;

    constructor(rootSelector) {
        this.#widgets = new Map();
        this.#rootElement = document.querySelector(rootSelector);
    }

    /**
     * Принимает КЛАСС виджета (не экземпляр).
     * Dashboard сам создаёт контейнер и инстанцирует виджет с правильным ID.
     */
    registerWidget(name, WidgetClass) {
        if (this.#widgets.has(name)) {
            throw new Error(`Виджет "${name}" уже зарегистрирован`);
        }

        // 1. Создаём контейнер
        const container = document.createElement('div');
        container.id = `widget-${name}`;
        container.className = 'widget-slot';
        this.#rootElement.appendChild(container);

        // 2. Создаём экземпляр виджета с правильным containerId
        const instance = new WidgetClass(container.id);

        // 3. Регистрируем
        this.#widgets.set(name, { instance, containerId: container.id });
        return this;
    }

    /** Отрендерить все виджеты */
    renderAll() {
        for (const { instance } of this.#widgets.values()) {
            instance.render();
        }
    }

    /** Инициализировать все API-виджеты (загрузить данные) */
    async initApiWidgets() {
        const promises = [];
        for (const { instance } of this.#widgets.values()) {
            if (typeof instance.loadData === 'function') {
                promises.push(instance.loadData());
            }
        }
        await Promise.allSettled(promises);
    }

    /** Уничтожить все виджеты */
    destroyAll() {
        for (const { instance } of this.#widgets.values()) {
            instance.destroy();
        }
        this.#widgets.clear();
    }

    /** Получить виджет по имени */
    getWidget(name) {
        return this.#widgets.get(name)?.instance;
    }
}