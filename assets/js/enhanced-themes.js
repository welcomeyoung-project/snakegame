// Enhanced Theme Configuration System
class EnhancedThemeManager {
    constructor() {
        this.themes = {
            classic: {
                name: 'Classic Green',
                background: '#000000',
                gridColor: '#333333',
                snake: {
                    head: '#4CAF50',
                    body: '#66BB6A',
                    border: '#2E7D32'
                },
                food: {
                    color: '#F44336',
                    border: '#C62828'
                },
                obstacles: {
                    mine: '#FF4444',
                    rock: '#8D6E63',
                    bomb: '#FF6600'
                },
                ui: {
                    primary: '#4CAF50',
                    secondary: '#66BB6A',
                    text: '#FFFFFF',
                    background: '#1A1A1A',
                    accent: '#FFC107'
                },
                effects: {
                    glow: false,
                    particles: false,
                    animation: 'smooth'
                }
            },
            neon: {
                name: 'Neon Cyber',
                background: '#0a0a0a',
                gridColor: '#1a1a2e',
                snake: {
                    head: '#00ffff',
                    body: '#0066cc',
                    border: '#00ccff'
                },
                food: {
                    color: '#ff0080',
                    border: '#ff00ff'
                },
                obstacles: {
                    mine: '#ff3366',
                    rock: '#9966ff',
                    bomb: '#ff6633'
                },
                ui: {
                    primary: '#00ffff',
                    secondary: '#0066cc',
                    text: '#ffffff',
                    background: '#0f0f23',
                    accent: '#ff0080'
                },
                effects: {
                    glow: true,
                    particles: true,
                    animation: 'glow'
                }
            },
            retro: {
                name: 'Retro Pixel',
                background: '#2d2d2d',
                gridColor: '#404040',
                snake: {
                    head: '#8bc34a',
                    body: '#689f38',
                    border: '#33691e'
                },
                food: {
                    color: '#ff5722',
                    border: '#d84315'
                },
                obstacles: {
                    mine: '#e53935',
                    rock: '#5d4037',
                    bomb: '#f57c00'
                },
                ui: {
                    primary: '#8bc34a',
                    secondary: '#689f38',
                    text: '#ffffff',
                    background: '#1a1a1a',
                    accent: '#ffc107'
                },
                effects: {
                    glow: false,
                    particles: false,
                    animation: 'pixelated'
                }
            },
            nature: {
                name: 'Nature Forest',
                background: '#1b5e20',
                gridColor: '#2e7d32',
                snake: {
                    head: '#8bc34a',
                    body: '#66bb6a',
                    border: '#4caf50'
                },
                food: {
                    color: '#ff6f00',
                    border: '#e65100'
                },
                obstacles: {
                    mine: '#8d6e63',
                    rock: '#5d4037',
                    bomb: '#bf360c'
                },
                ui: {
                    primary: '#4caf50',
                    secondary: '#66bb6a',
                    text: '#ffffff',
                    background: '#2e7d32',
                    accent: '#ff6f00'
                },
                effects: {
                    glow: false,
                    particles: true,
                    animation: 'organic'
                }
            },
            candy: {
                name: 'Candy Sweet',
                background: '#fce4ec',
                gridColor: '#f8bbd9',
                snake: {
                    head: '#e91e63',
                    body: '#f06292',
                    border: '#ad1457'
                },
                food: {
                    color: '#ff9800',
                    border: '#f57c00'
                },
                obstacles: {
                    mine: '#e53935',
                    rock: '#8d6e63',
                    bomb: '#ff5722'
                },
                ui: {
                    primary: '#e91e63',
                    secondary: '#f06292',
                    text: '#880e4f',
                    background: '#fce4ec',
                    accent: '#ff9800'
                },
                effects: {
                    glow: false,
                    particles: true,
                    animation: 'bounce'
                }
            },
            dark: {
                name: 'Dark Mode',
                background: '#121212',
                gridColor: '#2c2c2c',
                snake: {
                    head: '#bb86fc',
                    body: '#9c4dcc',
                    border: '#7b1fa2'
                },
                food: {
                    color: '#cf6679',
                    border: '#b71c1c'
                },
                obstacles: {
                    mine: '#f44336',
                    rock: '#616161',
                    bomb: '#ff9800'
                },
                ui: {
                    primary: '#bb86fc',
                    secondary: '#9c4dcc',
                    text: '#ffffff',
                    background: '#1e1e1e',
                    accent: '#cf6679'
                },
                effects: {
                    glow: true,
                    particles: false,
                    animation: 'smooth'
                }
            }
        };
        
        this.currentTheme = 'classic';
        this.loadSavedTheme();
    }

    // Get current theme configuration
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    // Set theme
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
            this.saveTheme();
        }
    }

    // Apply theme to page
    applyTheme() {
        const theme = this.getCurrentTheme();
        const root = document.documentElement;

        // Set CSS variables
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--grid-color', theme.gridColor);
        root.style.setProperty('--snake-head', theme.snake.head);
        root.style.setProperty('--snake-body', theme.snake.body);
        root.style.setProperty('--snake-border', theme.snake.border);
        root.style.setProperty('--food-color', theme.food.color);
        root.style.setProperty('--food-border', theme.food.border);
        root.style.setProperty('--obstacle-mine', theme.obstacles.mine);
        root.style.setProperty('--obstacle-rock', theme.obstacles.rock);
        root.style.setProperty('--obstacle-bomb', theme.obstacles.bomb);
        root.style.setProperty('--ui-primary', theme.ui.primary);
        root.style.setProperty('--ui-secondary', theme.ui.secondary);
        root.style.setProperty('--ui-text', theme.ui.text);
        root.style.setProperty('--ui-background', theme.ui.background);
        root.style.setProperty('--ui-accent', theme.ui.accent);
        
        // Set additional CSS variables
        root.style.setProperty('--border-color', theme.ui.primary);
        root.style.setProperty('--card-background', theme.ui.background);
        root.style.setProperty('--text-color', theme.ui.text);
        root.style.setProperty('--text-secondary', theme.ui.text === '#880e4f' ? 'rgba(136, 14, 79, 0.7)' : 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--accent-color', theme.ui.accent);
        
        // Set RGB values (for semi-transparent effects)
        const bgRgb = this.hexToRgb(theme.ui.background);
        const accentRgb = this.hexToRgb(theme.ui.accent);
        root.style.setProperty('--background-rgb', `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}`);
        root.style.setProperty('--accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);

        // Apply effect classes without clearing existing classes
        const body = document.body;
        // Remove old theme classes only
        const classesToRemove = [];
        body.classList.forEach(className => {
            if (className.startsWith('theme-') || className.includes('effects') || className.includes('animation-')) {
                classesToRemove.push(className);
            }
        });
        classesToRemove.forEach(className => body.classList.remove(className));
        
        // Add new theme classes
        body.classList.add(`theme-${this.currentTheme}`);
        
        if (theme.effects.glow) {
            body.classList.add('glow-effects');
        }
        
        if (theme.effects.particles) {
            body.classList.add('particle-effects');
        }

        body.classList.add(`animation-${theme.effects.animation}`);

        // Trigger theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme, config: theme }
        }));
    }

    // Save theme to local storage
    saveTheme() {
        localStorage.setItem('snakeGameTheme', this.currentTheme);
    }

    // Load theme from local storage
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('snakeGameTheme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }

    // Get all available themes
    getAvailableThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    }

    // Get theme preview colors
    getThemePreview(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return null;
        
        return {
            background: theme.background,
            snake: theme.snake.head,
            food: theme.food.color,
            accent: theme.ui.accent
        };
    }
    
    // Hex to RGB conversion
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
}

// Export Enhanced Theme Manager
window.EnhancedThemeManager = EnhancedThemeManager;