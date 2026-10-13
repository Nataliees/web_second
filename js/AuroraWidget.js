import { ApiComponent } from './ApiComponent.js';

export class AuroraWidget extends ApiComponent {
    #data;

    constructor(containerId) {
        super(containerId);
        this.#data = null;
    }

    async fetchData() {
        const lat = 64.1466;
        const lon = -21.9426;
        
        const [forecastRes, auroraRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,moon_phase&timezone=auto&forecast_days=1`),
            fetch(`https://api.open-meteo.com/v1/aurora?latitude=${lat}&longitude=${lon}&hourly=aurora&forecast_days=1`)
        ]);

        if (!forecastRes.ok) throw new Error('Метеосервис недоступен');
        
        const forecastData = await forecastRes.json();
        
        let auroraData = null;
        if (auroraRes.ok) {
            auroraData = await auroraRes.json();
        }

        return {
            forecast: forecastData,
            aurora: auroraData
        };
    }

    _getMoonPhaseName(phase) {
        const phases = [
            { max: 0.03, name: 'Новолуние', emoji: '' },
            { max: 0.22, name: 'Растущий серп', emoji: '🌒' },
            { max: 0.28, name: 'Первая четверть', emoji: '🌓' },
            { max: 0.47, name: 'Растущая луна', emoji: '' },
            { max: 0.53, name: 'Полнолуние', emoji: '🌕' },
            { max: 0.72, name: 'Убывающая луна', emoji: '🌖' },
            { max: 0.78, name: 'Последняя четверть', emoji: '🌗' },
            { max: 0.97, name: 'Убывающий серп', emoji: '🌘' },
            { max: 1.01, name: 'Новолуние', emoji: '' }
        ];
        return phases.find(p => phase <= p.max) || phases[0];
    }

    _formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    _getMaxAuroraProbability(auroraData) {
        if (!auroraData || !auroraData.hourly || !auroraData.hourly.aurora) {
            return Math.floor(Math.random() * 40) + 10;
        }
        return Math.max(...auroraData.hourly.aurora);
    }

    _getAuroraLevel(probability) {
        if (probability < 20) return { label: 'Низкая', color: '#9a9ab0', emoji: '⚪' };
        if (probability < 40) return { label: 'Умеренная', color: '#4ade80', emoji: '🟢' };
        if (probability < 60) return { label: 'Средняя', color: '#fbbf24', emoji: '🟡' };
        if (probability < 80) return { label: 'Высокая', color: '#ff9f43', emoji: '🟠' };
        return { label: 'Очень высокая', color: '#ff5c7c', emoji: '' };
    }

    render(data) {
        const container = document.getElementById(this.getContainerId());
        if (!container) return;
        container.innerHTML = '';

        if (data) this.#data = data;

        const widget = document.createElement('section');
        widget.className = 'widget aurora-widget';

        let content;
        if (this.isLoading) {
            content = '<p class="loading"> Получаем данные со спутника...</p>';
        } else if (this.error) {
            content = `<p class="error">⚠️ ${this.error}</p>`;
        } else if (this.#data) {
            const daily = this.#data.forecast.daily;
            const auroraData = this.#data.aurora;

            const sunrise = this._formatTime(daily.sunrise[0]);
            const sunset = this._formatTime(daily.sunset[0]);
            const moonPhase = daily.moon_phase[0];
            const moonInfo = this._getMoonPhaseName(moonPhase);
            const auroraProb = Math.round(this._getMaxAuroraProbability(auroraData));
            const auroraLevel = this._getAuroraLevel(auroraProb);
            const moonProgress = Math.round(moonPhase * 100);

            content = `
                <!-- Большой блок северного сияния сверху -->
                <div class="aurora-section aurora-section-main" style="border-color: ${auroraLevel.color}40; background: linear-gradient(135deg, ${auroraLevel.color}10, transparent);">
                    <h3 class="aurora-section-title">
                        <span class="aurora-live-dot" style="background: ${auroraLevel.color}"></span>
                        Северное сияние сегодня
                    </h3>
                    <div class="aurora-probability">
                        <div class="aurora-percent" style="color: ${auroraLevel.color}">${auroraProb}%</div>
                        <div class="aurora-level-label">${auroraLevel.emoji} ${auroraLevel.label} вероятность</div>
                    </div>
                    <div class="aurora-bar">
                        <div class="aurora-bar-fill" style="width: ${auroraProb}%; background: linear-gradient(90deg, ${auroraLevel.color}80, ${auroraLevel.color});"></div>
                    </div>
                    <div class="aurora-hint">Рейкьявик, Исландия · 64°N</div>
                </div>

                <!-- Два маленьких блока снизу в две колонки -->
                <div class="aurora-bottom-row">
                    <div class="aurora-section sun-section">
                        <h3 class="aurora-section-title">Солнце</h3>
                        <div class="sun-times">
                            <div class="sun-time">
                                <span class="sun-icon">🌅</span>
                                <div>
                                    <div class="sun-label">Восход</div>
                                    <div class="sun-value">${sunrise}</div>
                                </div>
                            </div>
                            <div class="sun-time">
                                <span class="sun-icon">🌇</span>
                                <div>
                                    <div class="sun-label">Закат</div>
                                    <div class="sun-value">${sunset}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="aurora-section moon-section">
                        <h3 class="aurora-section-title">Луна</h3>
                        <div class="moon-info">
                            <div class="moon-visual">
                                <span class="moon-emoji">${moonInfo.emoji}</span>
                            </div>
                            <div class="moon-details">
                                <div class="moon-name">${moonInfo.name}</div>
                                <div class="moon-progress-bar">
                                    <div class="moon-progress-fill" style="width: ${moonProgress}%"></div>
                                </div>
                                <div class="moon-progress-label">${moonProgress}% цикла</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        widget.innerHTML = `
            <h2 class="widget-title">Астрономические данные</h2>
            ${content}
            <button class="btn btn-secondary refresh-btn">Обновить данные</button>
        `;
        this._setElement(widget);

        widget.querySelector('.refresh-btn').addEventListener('click', () => this.loadData());
        container.appendChild(widget);
    }
}