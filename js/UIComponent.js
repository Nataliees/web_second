/**
 * Абстрактный базовый класс для всех UI-компонентов дашборда.
 * Реализует базовую логику жизненного цикла виджета.
 */
export class UIComponent {
    #containerId;
    #element;

    constructor(containerId) {
        if (new.target === UIComponent) {
            throw new Error('UIComponent — абстрактный класс, его нельзя инстанцировать напрямую');
        }
        this.#containerId = containerId;
        this.#element = null;
    }

    /** Абстрактный метод — должен быть переопределён в наследниках */
    render() {
        throw new Error('Метод render() должен быть реализован в наследнике');
    }

    /** Получить корневой DOM-элемент виджета */
    getElement() {
        return this.#element;
    }

    /** Получить ID контейнера */
    getContainerId() {
        return this.#containerId;
    }

    /** Установить корневой элемент (используется наследниками) */
    _setElement(el) {
        this.#element = el;
    }

    /** Уничтожить виджет: очистить DOM и убрать слушатели */
    destroy() {
        if (this.#element) {
            this.#element.innerHTML = '';
        }
    }
}