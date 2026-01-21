const API_URL = import.meta.env.VITE_API_URL;

export async function getProducts() {
  const res = await fetch(`${API_URL}?action=products`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error cargando productos");
  return (json.products || [])
    .map(p => ({
      ...p,
      id: String(p.id || "").trim(),
      categoria: String(p.categoria || "").trim(),
      nombre: String(p.nombre || "").trim(),
      descripcion: String(p.descripcion || "").trim(),
      imagenUrl: String(p.imagenUrl || "").trim(),
      precio: Number(p.precio || 0),
      stock: Number(p.stock || 0),
      activo: String(p.activo || "TRUE").toUpperCase() !== "FALSE",
      unidad: String(p.unidad || "UN").toUpperCase(),
    }))
    .filter(p => p.id && p.activo);
}

async function postJsonNoPreflight(payload) {
  // Evita preflight: NO usar application/json
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  // Si el backend devolvió HTML o texto, esto te lo muestra igual
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.error || "Error");
    return json;
  } catch {
    throw new Error(`Respuesta no JSON del backend: ${text.slice(0, 120)}...`);
  }
}

export function createSale({ items, medioPago, observacion }) {
  return postJsonNoPreflight({
    action: "sale_create",
    items,
    medioPago,
    observacion,
  });
}

export async function getSalesPage({ from, to, categoria, size = 100, cursor = 0 } = {}) {
  const qs = new URLSearchParams({ action: "sales" });

  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (categoria && categoria !== "Todas") qs.set("categoria", categoria);

  qs.set("size", String(size));
  qs.set("cursor", String(cursor));

  const res = await fetch(`${API_URL}?${qs.toString()}`);
  const json = await res.json();

  if (!json.ok) throw new Error(json.error || "Error cargando ventas");

  return {
    sales: json.sales || [],
    summary: json.summary || {},
    nextCursor: json.nextCursor ?? null,
    hasMore: !!json.hasMore,
    totalFiltered: json.totalFiltered ?? null,
  };
}




