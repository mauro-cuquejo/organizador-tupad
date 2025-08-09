/**
 * Servicio para gestión de temas (modo oscuro/claro)
 */
angular.module('tupadApp').service('ThemeService', ['$rootScope', 'StorageService', function ($rootScope, StorageService) {
    'use strict';

    const THEME_KEY = 'app_theme';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    };

    let currentTheme = THEMES.LIGHT;
    let isSystemDark = false;

    // Inicializar el servicio
    this.init = function () {
        // Detectar preferencia del sistema
        this.detectSystemTheme();

        // Cargar tema guardado
        const savedTheme = StorageService.get(THEME_KEY);
        if (savedTheme && THEMES[savedTheme.toUpperCase()]) {
            currentTheme = savedTheme;
        }

        // Aplicar tema
        this.applyTheme(currentTheme);

        // Escuchar cambios del sistema
        this.watchSystemTheme();
    };

    // Detectar tema del sistema
    this.detectSystemTheme = function () {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            isSystemDark = mediaQuery.matches;
            return isSystemDark;
        }
        return false;
    };

    // Observar cambios del tema del sistema
    this.watchSystemTheme = function () {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                isSystemDark = e.matches;
                if (currentTheme === THEMES.AUTO) {
                    this.applyTheme(THEMES.AUTO);
                }
            });
        }
    };

    // Obtener tema actual
    this.getCurrentTheme = function () {
        return currentTheme;
    };

    // Obtener tema efectivo (resuelve AUTO)
    this.getEffectiveTheme = function () {
        if (currentTheme === THEMES.AUTO) {
            return isSystemDark ? THEMES.DARK : THEMES.LIGHT;
        }
        return currentTheme;
    };

    // Cambiar tema
    this.setTheme = function (theme) {
        if (!THEMES[theme.toUpperCase()]) {
            console.warn('Tema no válido:', theme);
            return false;
        }

        currentTheme = theme;
        StorageService.set(THEME_KEY, theme);
        this.applyTheme(theme);

        // Notificar cambio
        $rootScope.$broadcast('themeChanged', {
            theme: theme,
            effectiveTheme: this.getEffectiveTheme()
        });

        return true;
    };

    // Aplicar tema al DOM
    this.applyTheme = function (theme) {
        const effectiveTheme = theme === THEMES.AUTO ?
            (isSystemDark ? THEMES.DARK : THEMES.LIGHT) : theme;

        const body = document.body;
        const html = document.documentElement;

        // Remover clases anteriores
        body.classList.remove('theme-light', 'theme-dark');
        html.classList.remove('theme-light', 'theme-dark');

        // Aplicar nueva clase
        body.classList.add(`theme-${effectiveTheme}`);
        html.classList.add(`theme-${effectiveTheme}`);

        // Actualizar atributo data-theme
        body.setAttribute('data-theme', effectiveTheme);
        html.setAttribute('data-theme', effectiveTheme);

        // Aplicar variables CSS personalizadas
        this.applyCSSVariables(effectiveTheme);
    };

    // Aplicar variables CSS según el tema
    this.applyCSSVariables = function (theme) {
        const root = document.documentElement;

        if (theme === THEMES.DARK) {
            // Variables para modo oscuro
            root.style.setProperty('--primary-color', '#4a90e2');
            root.style.setProperty('--secondary-color', '#6c757d');
            root.style.setProperty('--success-color', '#28a745');
            root.style.setProperty('--danger-color', '#dc3545');
            root.style.setProperty('--warning-color', '#ffc107');
            root.style.setProperty('--info-color', '#17a2b8');

            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--bg-secondary', '#2d2d2d');
            root.style.setProperty('--bg-tertiary', '#3d3d3d');
            root.style.setProperty('--bg-card', '#2a2a2a');
            root.style.setProperty('--bg-sidebar', '#1f1f1f');

            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--text-muted', '#888888');

            root.style.setProperty('--border-color', '#404040');
            root.style.setProperty('--border-light', '#333333');

            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--overlay-color', 'rgba(0, 0, 0, 0.7)');
        } else {
            // Variables para modo claro
            root.style.setProperty('--primary-color', '#007bff');
            root.style.setProperty('--secondary-color', '#6c757d');
            root.style.setProperty('--success-color', '#28a745');
            root.style.setProperty('--danger-color', '#dc3545');
            root.style.setProperty('--warning-color', '#ffc107');
            root.style.setProperty('--info-color', '#17a2b8');

            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8f9fa');
            root.style.setProperty('--bg-tertiary', '#e9ecef');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-sidebar', '#f8f9fa');

            root.style.setProperty('--text-primary', '#212529');
            root.style.setProperty('--text-secondary', '#6c757d');
            root.style.setProperty('--text-muted', '#6c757d');

            root.style.setProperty('--border-color', '#dee2e6');
            root.style.setProperty('--border-light', '#e9ecef');

            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--overlay-color', 'rgba(0, 0, 0, 0.5)');
        }
    };

    // Obtener temas disponibles
    this.getAvailableThemes = function () {
        return [
            { value: THEMES.LIGHT, label: 'Claro', icon: 'bi-sun' },
            { value: THEMES.DARK, label: 'Oscuro', icon: 'bi-moon' },
            { value: THEMES.AUTO, label: 'Automático', icon: 'bi-circle-half' }
        ];
    };

    // Verificar si es modo oscuro
    this.isDarkMode = function () {
        return this.getEffectiveTheme() === THEMES.DARK;
    };

    // Verificar si es modo claro
    this.isLightMode = function () {
        return this.getEffectiveTheme() === THEMES.LIGHT;
    };

    // Alternar entre claro y oscuro
    this.toggleTheme = function () {
        const newTheme = this.isDarkMode() ? THEMES.LIGHT : THEMES.DARK;
        return this.setTheme(newTheme);
    };

    // Obtener icono del tema actual
    this.getThemeIcon = function () {
        const effectiveTheme = this.getEffectiveTheme();
        return effectiveTheme === THEMES.DARK ? 'bi-moon' : 'bi-sun';
    };

    // Obtener nombre del tema actual
    this.getThemeName = function () {
        const themes = this.getAvailableThemes();
        const theme = themes.find(t => t.value === currentTheme);
        return theme ? theme.label : 'Desconocido';
    };

    // Inicialización se hace desde app.js
}]);