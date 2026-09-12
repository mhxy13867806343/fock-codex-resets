import { ref } from 'vue';

const TOKEN_KEY = 'codex_custom_token';

function generateRandomToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 10; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `token_${rand}`;
}

const initialToken = typeof window !== 'undefined' 
  ? (localStorage.getItem(TOKEN_KEY) || generateRandomToken())
  : generateRandomToken();

if (typeof window !== 'undefined') {
  localStorage.setItem(TOKEN_KEY, initialToken);
}

export const currentToken = ref<string>(initialToken);

export function setCustomToken(token: string) {
  currentToken.value = token.trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, currentToken.value);
  }
}

export function resetRandomToken(): string {
  const newToken = generateRandomToken();
  setCustomToken(newToken);
  return newToken;
}

/**
 * Appends ?token=... or &token=... to any given URL
 */
export function withToken(rawUrl: string, tokenOverride?: string): string {
  if (!rawUrl) return '';
  const token = tokenOverride || currentToken.value;
  if (!token) return rawUrl;

  try {
    // Check if it's an absolute URL or relative URL
    const isAbsolute = /^https?:\/\//i.test(rawUrl);
    const base = isAbsolute ? undefined : 'https://dummy.local';
    const urlObj = new URL(rawUrl, base);
    urlObj.searchParams.set('token', token);

    if (isAbsolute) {
      return urlObj.toString();
    } else {
      return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    }
  } catch {
    // Fallback simple string append
    const hashIndex = rawUrl.indexOf('#');
    let base = rawUrl;
    let hash = '';
    if (hashIndex !== -1) {
      base = rawUrl.substring(0, hashIndex);
      hash = rawUrl.substring(hashIndex);
    }
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}token=${encodeURIComponent(token)}${hash}`;
  }
}
