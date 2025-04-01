// Production Authentication Service with Firebase
class AuthProd {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async login(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
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
    if (!email || !password || !name) throw new Error('All fields required');
    
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
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

  // ... rest of the methods same as auth-service.js ...
}

const authProd = new AuthProd();
if (typeof window !== 'undefined') window.auth = authProd;
export default authProd;