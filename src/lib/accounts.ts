const ACCOUNTS_KEY = "chat-accounts";
const ACTIVE_KEY = "chat-username";

export interface Account {
  username: string;
  addedAt: string;
}

export function getAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAccount(username: string): Account[] {
  const accounts = getAccounts();
  if (!accounts.find((a) => a.username === username)) {
    accounts.push({ username, addedAt: new Date().toISOString() });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  localStorage.setItem(ACTIVE_KEY, username);
  return accounts;
}

export function switchAccount(username: string) {
  localStorage.setItem(ACTIVE_KEY, username);
}

export function removeAccount(username: string): Account[] {
  let accounts = getAccounts().filter((a) => a.username !== username);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  const active = localStorage.getItem(ACTIVE_KEY);
  if (active === username) {
    localStorage.setItem(ACTIVE_KEY, accounts[0]?.username || "");
  }
  return accounts;
}

export function getActiveUsername(): string {
  return localStorage.getItem(ACTIVE_KEY) || "";
}
