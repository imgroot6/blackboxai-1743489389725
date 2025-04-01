// Enhanced Authentication Service
class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async login(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    
    // Demo authentication - replace with real API call
    this.currentUser = {
      email,
      name: email.split('@')[0],
      token: 'demo-' + Math.random().toString(36).slice(2)
    };
    this._saveUser();
    return this.currentUser;
  }

    async register(email, password, name) {
        if (!email || !password || !name) throw new Error('All fields required');
        
        // Mock API call
        const response = await fetch('https://mock-api.thunder.app/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        const data = await response.json();
        this.currentUser = data.user;
    this._saveUser();
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('thunder_user');
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  _saveUser() {
    localStorage.setItem('thunder_user', JSON.stringify(this.currentUser));
  }

  init() {
    const user = localStorage.getItem('thunder_user');
    if (user) this.currentUser = JSON.parse(user);
  }
}

// Initialize and expose service
const auth = new AuthService();
if (typeof window !== 'undefined') window.auth = auth;
export default auth;