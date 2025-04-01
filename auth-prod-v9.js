// Production Auth Service for Firebase v9
class AuthProd {
  constructor() {
    this.currentUser = null;
    this.auth = null;
    this.init();
  }

  async init() {
    // Wait for firebaseAuth to be available from window
    await new Promise(resolve => {
      const checkAuth = () => {
        if (window.firebaseAuth?.auth) {
          this.auth = window.firebaseAuth.auth;
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });

    // Check existing session
    const user = localStorage.getItem('thunder_user');
    if (user) this.currentUser = JSON.parse(user);
  }

  async login(email, password) {
    try {
      const { signInWithEmailAndPassword } = window.firebaseAuth;
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      this.currentUser = {
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
        token: await userCredential.user.getIdToken()
      };
      
      this._saveUser();
      return this.currentUser;
    } catch (error) {
      throw new Error(this._getFirebaseError(error));
    }
  }

  async register(email, password, name) {
    try {
      const { createUserWithEmailAndPassword } = window.firebaseAuth;
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      this.currentUser = {
        email: userCredential.user.email,
        name,
        token: await userCredential.user.getIdToken()
      };
      
      this._saveUser();
      return this.currentUser;
    } catch (error) {
      throw new Error(this._getFirebaseError(error));
    }
  }

  _getFirebaseError(error) {
    switch(error.code) {
      case 'auth/email-already-in-use': return 'Email already registered';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/weak-password': return 'Password too weak';
      case 'auth/user-not-found': return 'User not found';
      case 'auth/wrong-password': return 'Incorrect password';
      default: return 'Authentication failed';
    }
  }

  _saveUser() {
    localStorage.setItem('thunder_user', JSON.stringify(this.currentUser));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('thunder_user');
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Initialize and expose service
const auth = new AuthProd();
if (typeof window !== 'undefined') window.auth = auth;