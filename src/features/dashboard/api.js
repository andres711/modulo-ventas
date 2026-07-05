import { getApiJson } from "../../shared/api/http";

export async function getSalesPage({ from, to, categoria, size = 100, cursor = 0 } = {}) {
  const json = await getApiJson(
    {
      action: "sales",
      from,
      to,
      categoria: categoria && categoria !== "Todas" ? categoria : undefined,
      size,
      cursor,
    },
    "Error cargando ventas"
  );

  return {
    sales: json.sales || [],
    summary: json.summary || {},
    nextCursor: json.nextCursor ?? null,
    hasMore: !!json.hasMore,
    totalFiltered: json.totalFiltered ?? null,
  };
}
