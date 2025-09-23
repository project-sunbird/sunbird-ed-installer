/**
 * OAuth Login Manager
 * Handles OAuth authentication flow for multiple providers
 */

class OAuthManager {
    constructor() {
        this.config = null;
        this.authWindow = null;
        this.authCheckInterval = null;
        this.baseUrl = window.location.origin;
        
        // Bind methods
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleAuthMessage = this.handleAuthMessage.bind(this);
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Load OAuth configuration
        await this.loadConfig();
        
        // Setup UI
        this.setupUI();
        
        // Setup message listener for OAuth callback
        window.addEventListener('message', this.handleAuthMessage);
        
        // Check for existing session
        this.checkExistingSession();
    }
    
    async loadConfig() {
        try {
            const response = await fetch(`${this.baseUrl}/api/oauth/config`);
            if (response.ok) {
                this.config = await response.json();
            } else {
                this.config = {};
            }
        } catch (error) {
            console.error('Error loading OAuth config:', error);
            this.config = {};
        }
    }
    
    setupUI() {
        // Setup login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginPopup());
        }
        
        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }
        
        // Setup OAuth provider buttons
        const providers = ['google', 'facebook', 'microsoft', 'github'];
        providers.forEach(provider => {
            const btn = document.getElementById(`${provider}LoginBtn`);
            if (btn) {
                btn.addEventListener('click', () => this.handleLogin(provider));
                
                // Show/hide based on configuration
                if (this.config && this.config[provider] && this.config[provider].enabled) {
                    btn.style.display = 'flex';
                } else {
                    btn.style.display = 'none';
                }
            }
        });
        
        // Setup popup close button
        const closeBtn = document.querySelector('.oauth-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideLoginPopup());
        }
        
        // Close popup when clicking overlay
        const overlay = document.getElementById('oauthPopupOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideLoginPopup();
                }
            });
        }
    }
    
    checkExistingSession() {
        const authToken = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        console.log('Checking existing session:', { authToken: !!authToken, userInfo: !!userInfo });
        
        if (authToken && userInfo) {
            try {
                const user = JSON.parse(userInfo);
                console.log('Existing user session found:', user);
                this.updateUIForLoggedInUser(user);
            } catch (error) {
                console.error('Error parsing user info:', error);
                this.clearSession();
            }
        }
    }
    
    showLoginPopup() {
        const overlay = document.getElementById('oauthPopupOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideLoginPopup() {
        const overlay = document.getElementById('oauthPopupOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    handleLogin(provider) {
        
        if (!this.config || !this.config[provider]) {
            console.error(`OAuth not configured for ${provider}`);
            alert(`OAuth not configured for ${provider}. Please check server configuration.`);
            return;
        }
        
        const config = this.config[provider];
        
        // Store provider in sessionStorage (as per PR #260)
        sessionStorage.setItem('oauth_provider', provider);
        
        // Build OAuth URL
        const authUrl = this.buildAuthUrl(provider, config);
        
        // Open OAuth window
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        this.authWindow = window.open(
            authUrl,
            'oauth_window',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        );
        
        if (!this.authWindow) {
            alert('Failed to open login window. Please check your popup blocker settings.');
        }
        
        // Hide login popup
        this.hideLoginPopup();
        
        // Check if window is closed
        this.authCheckInterval = setInterval(() => {
            if (this.authWindow && this.authWindow.closed) {
                clearInterval(this.authCheckInterval);
                this.authCheckInterval = null;
            }
        }, 1000);
    }
    
    buildAuthUrl(provider, config) {
        
        const params = new URLSearchParams();
        
        switch (provider) {
            case 'google':
                params.append('client_id', config.client_id);
                params.append('redirect_uri', config.redirect_uri);
                params.append('response_type', 'code');
                params.append('scope', config.scope);
                params.append('access_type', 'online');
                params.append('prompt', 'select_account');
                params.append('state', provider);
                return `${config.auth_url}?${params.toString()}`;
                
            case 'facebook':
                params.append('client_id', config.app_id || config.client_id);
                params.append('redirect_uri', config.redirect_uri);
                params.append('response_type', 'code');
                params.append('scope', config.scope);
                params.append('state', provider);
                return `${config.auth_url}?${params.toString()}`;
                
            case 'microsoft':
                params.append('client_id', config.client_id);
                params.append('redirect_uri', config.redirect_uri);
                params.append('response_type', 'code');
                params.append('scope', config.scope);
                params.append('prompt', 'select_account');
                params.append('state', provider);
                return `${config.auth_url}?${params.toString()}`;
                
            case 'github':
                params.append('client_id', config.client_id);
                params.append('redirect_uri', config.redirect_uri);
                params.append('scope', config.scope);
                params.append('state', provider);
                return `${config.auth_url}?${params.toString()}`;
                
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
    
    handleAuthMessage(event) {
        // Handle OAuth callback messages
        if (event.origin !== window.location.origin) {
            return;
        }
        
        if (event.data && event.data.type === 'oauth_callback') {
            if (event.data.error) {
                console.error('OAuth error:', event.data.error);
                alert(`Login failed: ${event.data.error}`);
                return;
            }
            
            if (event.data.authData) {
                const { access_token, user_info } = event.data.authData;
                
                // Store auth info
                localStorage.setItem('authToken', access_token);
                localStorage.setItem('userInfo', JSON.stringify(user_info));
                
                // Update UI
                this.updateUIForLoggedInUser(user_info);
            }
            
            // Close auth window if still open
            if (this.authWindow && !this.authWindow.closed) {
                this.authWindow.close();
            }
            
            // Clear interval
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
                this.authCheckInterval = null;
            }
            
            // Dispatch auth state change event
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: {
                    isAuthenticated: true,
                    user: event.data.authData ? event.data.authData.user_info : null
                }
            }));
        }
    }
    
    updateUIForLoggedInUser(user) {
        console.log('Updating UI for logged in user:', user);
        
        // Update UI elements
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const providerIcon = document.getElementById('providerIcon');
        
        console.log('UI elements found:', {
            loginBtn: !!loginBtn,
            userInfo: !!userInfo,
            userName: !!userName,
            providerIcon: !!providerIcon
        });
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) userName.textContent = user.name || user.email || 'User';
        
        // Set provider icon
        if (providerIcon && user.provider) {
            providerIcon.className = `provider-icon ${user.provider}`;
            console.log('Set provider icon class:', providerIcon.className);
        }
        
        // Also set data-provider attribute on user-info for CSS
        if (userInfo && user.provider) {
            userInfo.setAttribute('data-provider', user.provider);
        }
    }
    
    async handleLogout() {
        try {
            // Call logout endpoint
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                await fetch(`${this.baseUrl}/api/oauth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear session
        this.clearSession();
        
        // Reset UI
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        
        // Dispatch auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated: false,
                user: null
            }
        }));
    }
    
    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    }
}

// Initialize OAuth manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.oauthManager = new OAuthManager();
    });
} else {
    window.oauthManager = new OAuthManager();
}
