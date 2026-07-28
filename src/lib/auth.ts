const AUTH_STORAGE_KEY = 'weight-loss-planner-auth';
const SESSION_KEY = 'weight-loss-planner-session';
const SALT = 'wlp-salt-2024'; // pepper for hash

export interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthSession {
  username: string;
  loggedInAt: string;
}

/** SHA-256 hash with salt */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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

export async function register(username: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (username.length < 2) return { ok: false, error: '用户名至少 2 个字符' };
  if (password.length < 6) return { ok: false, error: '密码至少 6 个字符' };
  if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) return { ok: false, error: '用户名只能包含字母、数字、下划线和中文' };

  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: '用户名已存在' };
  }

  const passwordHash = await hashPassword(password);
  users.push({ username, passwordHash, createdAt: new Date().toISOString() });
  saveUsers(users);

  saveSession({ username, loggedInAt: new Date().toISOString() });
  return { ok: true };
}

export async function login(username: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!username || !password) return { ok: false, error: '请输入用户名和密码' };

  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return { ok: false, error: '用户名或密码错误' };

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) return { ok: false, error: '用户名或密码错误' };

  saveSession({ username, loggedInAt: new Date().toISOString() });
  return { ok: true };
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
