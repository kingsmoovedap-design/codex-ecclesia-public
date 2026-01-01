let currentUser = null;
let authListeners = [];

export async function checkAuth() {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      currentUser = await response.json();
      notifyListeners();
      return currentUser;
    }
    currentUser = null;
    notifyListeners();
    return null;
  } catch (error) {
    currentUser = null;
    notifyListeners();
    return null;
  }
}

export function getUser() {
  return currentUser;
}

export function isAuthenticated() {
  return currentUser !== null;
}

export function login() {
  window.location.href = '/api/login';
}

export function logout() {
  window.location.href = '/api/logout';
}

export function onAuthChange(callback) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}

function notifyListeners() {
  authListeners.forEach(cb => cb(currentUser));
}

export function getUserRole() {
  return currentUser?.role || 'guest';
}

export function hasRole(role) {
  if (!currentUser) return false;
  const roleHierarchy = ['guest', 'member', 'heir', 'trustee', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(currentUser.role);
  const requiredRoleIndex = roleHierarchy.indexOf(role);
  return userRoleIndex >= requiredRoleIndex;
}

export function renderAuthUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (currentUser) {
    container.innerHTML = `
      <div class="auth-user">
        ${currentUser.profileImageUrl ? `<img src="${currentUser.profileImageUrl}" alt="Profile" class="auth-avatar">` : ''}
        <span class="auth-name">${currentUser.firstName || currentUser.username}</span>
        <span class="auth-role">${currentUser.role}</span>
        <button onclick="window.authLogout()" class="auth-btn">Logout</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button onclick="window.authLogin()" class="auth-btn auth-btn-primary">Login</button>
    `;
  }
}

window.authLogin = login;
window.authLogout = logout;
