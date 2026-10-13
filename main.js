import { Dashboard } from './js/Dashboard.js';
import { ToDoWidget } from './js/ToDoWidget.js';
import { QuoteWidget } from './js/QuoteWidget.js';
import { AstronautWidget } from './js/AstronautWidget.js';
import { AuroraWidget } from './js/AuroraWidget.js';  // ← было StatsWidget

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard('#dashboard');

    dashboard
        .registerWidget('astronaut', AstronautWidget)
        .registerWidget('quote', QuoteWidget)
        .registerWidget('aurora', AuroraWidget)      // ← было 'stats'
        .registerWidget('todo', ToDoWidget);

    dashboard.renderAll();
    dashboard.initApiWidgets();

    window.__dashboard = dashboard;
});