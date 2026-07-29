const AUTH_STORAGE_KEY = 'wlp-auth-v1';
const SESSION_KEY = 'weight-loss-planner-session';
const SALT = 'wlp-salt-v2';

export interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthSession {
  username: string;
  loggedInAt: string;
}

/** djb2 hash with salt — deterministic and synchronous */
function hashPassword(password: string): string {
  let h = 5381;
  const s = password + SALT;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(36);
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw).users || [] : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ users }));
}

function getSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function register(username: string, password: string): { ok: true } | { ok: false; error: string } {
  const clean = username.trim().toLowerCase();
  if (clean.length < 2) return { ok: false, error: '用户名至少 2 个字符' };
  if (password.length < 6) return { ok: false, error: '密码至少 6 个字符' };
  if (!/^[a-zA-Z0-9_一-龥]+$/.test(clean)) return { ok: false, error: '用户名只能包含字母、数字、下划线和中文' };

  const users = getUsers();
  if (users.some((u) => u.username === clean)) {
    return { ok: false, error: '用户名已存在' };
  }

  const passwordHash = hashPassword(password);
  users.push({ username: clean, passwordHash, createdAt: new Date().toISOString() });
  saveUsers(users);

  saveSession({ username: clean, loggedInAt: new Date().toISOString() });
  return { ok: true };
}

export function login(username: string, password: string): { ok: true } | { ok: false; error: string } {
  const clean = username.trim().toLowerCase();
  if (!clean || !password) return { ok: false, error: '请输入用户名和密码' };

  const users = getUsers();
  const user = users.find((u) => u.username === clean);
  if (!user) return { ok: false, error: `未找到用户 "${clean}"，请先注册` };

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) return { ok: false, error: '密码错误' };

  saveSession({ username: clean, loggedInAt: new Date().toISOString() });
  return { ok: true };
}

/** Clear all auth data from localStorage (for debugging) */
export function clearAuthData() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  clearSession();
}

/** Check if a user exists by case-insensitive lookup */
export function userExists(username: string): boolean {
  const clean = username.trim().toLowerCase();
  return getUsers().some((u) => u.username === clean);
}

export function logout() {
  clearSession();
}

export function getCurrentUser(): string | null {
  return getSession()?.username ?? null;
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

/** Get localStorage key scoped to current user */
export function getUserDataKey(username: string): string {
  return `weight-loss-planner-data-${username}`;
}

/** Migrate legacy data to current user's namespace */
export function getLegacyDataKey(): string {
  return 'weight-loss-planner-storage';
}
