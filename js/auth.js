/**
 * Vehicle Loan Calculator - Authentication Module (Local Storage Prototype)
 * 
 * DISCLAIMER FOR ACADEMIC EVALUATORS / VIVA:
 * This module uses browser LocalStorage for demonstration purposes in a college project.
 * LocalStorage does not provide cryptographically secure storage or authentication tokens.
 * In a real production banking system, authentication must use backend servers with
 * HTTPS, salted & hashed passwords (e.g. bcrypt/Argon2), HTTP-only secure cookies, and JWT/OAuth.
 */

const AUTH_STORAGE_KEYS = {
  USERS: 'vlc_users',
  CURRENT_USER: 'vlc_current_user',
  REMEMBERED_EMAIL: 'vlc_remembered_email'
};

// Seed a default demo user so instructors/evaluators can test without registering first
function initDemoUser() {
  const users = getUsers();
  const demoEmail = 'demo@bankloan.com';
  const existingDemo = users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
  
  if (!existingDemo) {
    users.push({
      id: 'usr_demo_1001',
      name: 'Piyush Demo',
      email: demoEmail,
      password: 'Password@123',
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
}

// Retrieve all registered users
function getUsers() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading users from localStorage:', e);
    return [];
  }
}

// Save users array
function saveUsers(users) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
}

// Get the currently authenticated user
function getCurrentUser() {
  try {
    // Check localStorage first
    let user = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (!user) {
      // Check sessionStorage for session-only logins
      user = sessionStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error reading current user:', e);
    return null;
  }
}

// Set current user upon login
function setCurrentUser(user, remember = false) {
  const userData = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  });

  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, userData);
    localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, user.email);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, userData);
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  }
}

// Logout user
function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

// Register a new user
function registerUser(name, email, password) {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // Validate password length
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  // Check if user already exists
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password: password, // Note: In production this would be hashed on the server
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Account registered successfully!' };
}

// Login an existing user
function loginUser(email, password, remember = false) {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'No account found with this email. Please register first.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(user, remember);
  return { success: true, user: user };
}

// Demo Password Reset flow
function resetPassword(email, newPassword) {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();

  const index = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (index === -1) {
    return { success: false, message: 'Email address not found in registered accounts.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' };
  }

  users[index].password = newPassword;
  saveUsers(users);

  return { success: true, message: 'Password updated successfully! You can now log in.' };
}

// Password Strength Evaluation
function checkPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, text: 'None', color: '#e2e8f0', percent: 0 };

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, text: 'Weak', color: '#ef4444', percent: 25 };
    case 2:
      return { score: 2, text: 'Fair', color: '#f59e0b', percent: 50 };
    case 3:
      return { score: 3, text: 'Good', color: '#0ea5e9', percent: 75 };
    case 4:
    case 5:
      return { score: 4, text: 'Strong', color: '#10b981', percent: 100 };
    default:
      return { score: 0, text: 'Too Short', color: '#ef4444', percent: 10 };
  }
}

// Guard protected pages: redirect to login if not logged in
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
    return null;
  }
  return user;
}

// Redirect logged-in users away from login/register pages
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = 'index.html';
  }
}

// Get remembered email if any
function getRememberedEmail() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL) || '';
}

// Auto-initialize demo seed on script load
document.addEventListener('DOMContentLoaded', () => {
  initDemoUser();
});
