import { normalizeProduct } from "../../entities/product/model";
import { getApiJson, postApiAction } from "../../shared/api/http";

export async function getProducts({ includeInactive = false } = {}) {
  const json = await getApiJson({ action: "products" }, "Error cargando productos");

  return (json.products || [])
    .map(normalizeProduct)
    .filter((product) => product.id && (includeInactive || product.activo));
}

export function upsertProduct(row) {
  return postApiAction(
    {
      action: "product_upsert",
      row,
    },
    "Error guardando producto"
  );
}

export function deleteProduct(id) {
  return postApiAction(
    {
      action: "product_delete",
      id,
    },
    "Error eliminando producto"
  );
}
