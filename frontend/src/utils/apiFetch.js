/**
 * Wrapper de fetch que intercepta 401 (token expirado)
 * y redirige al login automáticamente.
 */
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    window.location.href = '/login';
    return res;
  }

  return res;
};

export default apiFetch;
