const KEY = 'leafnest_admin_token';

export const getToken = () => localStorage.getItem(KEY);
export const setSession = (token, admin) => {
  localStorage.setItem(KEY, token);
  localStorage.setItem('leafnest_admin_email', admin.email);
};
export const clearSession = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem('leafnest_admin_email');
};
export const adminEmail = () => localStorage.getItem('leafnest_admin_email') || '';

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`/api${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    clearSession();
    window.location.href = '/admin/login';
  }
  if (!res.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
