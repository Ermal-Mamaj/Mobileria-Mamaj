async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  return request('/uploads', { method: 'POST', body: form }).then((r) => r.url);
}

export const adminAuth = {
  login: (username, password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  me: () => request('/admin/me').catch(() => ({ loggedIn: false })),
};
