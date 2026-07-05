const API_URL = import.meta.env.VITE_API_URL;

function buildApiUrl(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const qs = searchParams.toString();
  return qs ? `${API_URL}?${qs}` : API_URL;
}

export async function getApiJson(params = {}, fallbackError = "Error") {
  const res = await fetch(buildApiUrl(params));
  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error || fallbackError);
  }

  return json;
}

export async function postApiAction(payload, fallbackError = "Error") {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.error || fallbackError);
    return json;
  } catch {
    throw new Error(`Respuesta no JSON del backend: ${text.slice(0, 120)}...`);
  }
}
