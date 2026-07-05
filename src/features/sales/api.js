import { postApiAction } from "../../shared/api/http";

export function createSale({ items, medioPago, observacion }) {
  return postApiAction(
    {
      action: "sale_create",
      items,
      medioPago,
      observacion,
    },
    "Error guardando venta"
  );
}
