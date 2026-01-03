/**
 * Health-Tech App - Multi-Page Application Logic
 * This script is designed to run on all pages. It detects the current page
 * and initializes only the relevant functionality.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global Initializer ---
    lucide.createIcons();
    const app = new HealthTechApp();
    app.init();

});

class HealthTechApp {
    constructor() {
        // Cache DOM elements that are common across pages
        this.dom = {
            themeToggle: document.getElementById('theme-toggle'),
            sidebar: document.getElementById('sidebar'),
            sidebarToggle: document.getElementById('sidebar-toggle-button'),
            logoutButton: document.getElementById('logout-button'),
        };
        // Used to prevent multiple backdrops
        this.isSidebarOpen = false;
    }

    init() {
        // Initialize common features
        this.initTheme();
        this.initAuth();
        this.initMobileSidebar();
        
        // Initialize page-specific features
        this.initLoginPage();
        this.initPredictionPages();
    }

    // --- 1. Common Features (run on most pages) ---

    initTheme() {
        if (!this.dom.themeToggle) return;

        const docElement = document.documentElement;
        const moonIcon = document.getElementById('moon-icon');
        const sunIcon = document.getElementById('sun-icon');
        
        const applyTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                docElement.classList.add('dark');
                moonIcon?.classList.remove('hidden');
                sunIcon?.classList.add('hidden');
            } else {
                docElement.classList.remove('dark');
                moonIcon?.classList.add('hidden');
                sunIcon?.classList.remove('hidden');
            }
        };

        this.dom.themeToggle.addEventListener('click', () => {
            docElement.classList.toggle('dark');
            localStorage.setItem('theme', docElement.classList.contains('dark') ? 'dark' : 'light');
            applyTheme();
        });

        applyTheme(); // Apply theme on initial load
    }

    initAuth() {
        // On non-login pages, check for auth token
        const isLoginPage = !!document.getElementById('login-form');
        if (!isLoginPage && !sessionStorage.getItem('authToken')) {
            window.location.href = 'index.html';
        }

        // Attach logout listener
        this.dom.logoutButton?.addEventListener('click', () => {
            sessionStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    initMobileSidebar() {
        if (!this.dom.sidebar || !this.dom.sidebarToggle) return;

        this.dom.sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSidebar();
        });
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        this.dom.sidebar.classList.toggle('-translate-x-full');
        
        const backdrop = document.querySelector('.backdrop');
        if (this.isSidebarOpen && !backdrop) {
            const newBackdrop = document.createElement('div');
            newBackdrop.className = 'backdrop md:hidden';
            document.body.appendChild(newBackdrop);
            newBackdrop.addEventListener('click', () => this.toggleSidebar());
        } else if (!this.isSidebarOpen && backdrop) {
            backdrop.remove();
        }
    }
    
    // --- 2. Page-Specific Initializers ---

    initLoginPage() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        const loginButton = document.getElementById('login-button');
        const buttonText = document.getElementById('login-button-text');
        const spinner = document.getElementById('login-spinner');
        const messageEl = document.getElementById('login-message');
        const credentials = { username: 'trail', password: 'rec@1234' };

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            loginButton.disabled = true;
            buttonText.textContent = 'Authenticating...';
            spinner.classList.remove('hidden');
            messageEl.textContent = '';
            messageEl.classList.remove('text-red-500', 'text-green-500');

            setTimeout(() => {
                if (username === credentials.username && password === credentials.password) {
                    messageEl.textContent = 'Success! Redirecting...';
                    messageEl.classList.add('text-green-500');
                    sessionStorage.setItem('authToken', 'dummy_token_for_health_tech');
                    window.location.href = 'dashboard.html';
                } else {
                    messageEl.textContent = 'Invalid username or password.';
                    messageEl.classList.add('text-red-500');
                    loginButton.disabled = false;
                    buttonText.textContent = 'Log In';
                    spinner.classList.add('hidden');
                }
            }, 1000);
        });
    }
    
    initPredictionPages() {
        // Heart page
        const heartForm = document.getElementById('heart-form');
        if(heartForm) {
            heartForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.runPrediction('heart');
            });
        }

        // Brain page
        const brainFileInput = document.getElementById('brain-file-input');
        if(brainFileInput) {
            brainFileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'brain');
            });
        }
        
        // Eye page
        const eyeFileInput = document.getElementById('eye-file-input');
        if(eyeFileInput) {
            eyeFileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'eye');
            });
        }
    }

    handleFileUpload(event, predictionType) {
        const file = event.target.files[0];
        if (!file) return;

        const preview = document.getElementById(`${predictionType}-image-preview`);
        if (preview) {
            preview.src = URL.createObjectURL(file);
        }
        this.runPrediction(predictionType);
    }
    
    runPrediction(type) {
        const loader = document.getElementById(`${type}-loader`);
        const resultBox = document.getElementById(`${type}-result`);
        if (!loader || !resultBox) return;

        loader.classList.remove('hidden');
        resultBox.classList.add('hidden');
        resultBox.textContent = '';
        
        setTimeout(() => {
            let resultText = '';
            switch (type) {
                case 'heart': resultText = 'Prediction: Low risk of heart disease detected.'; break;
                case 'brain': resultText = 'Analysis Complete: No anomalous tissue detected.'; break;
                case 'eye': resultText = 'Analysis Complete: No signs of glaucoma detected.'; break;
                default: resultText = 'Analysis failed.'; break;
            }
            resultBox.textContent = resultText;
            resultBox.className = 'result-box bg-green-500/10 text-green-600 dark:text-green-400';
            
            loader.classList.add('hidden');
            resultBox.classList.remove('hidden');
        }, 2000); // Simulate 2-second API call
    }
}
