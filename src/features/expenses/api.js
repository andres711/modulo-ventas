import { getApiJson, postApiAction } from "../../shared/api/http";

export async function createExpense({
  categoria,
  descripcion,
  monto,
  medioPago,
  observacion,
  comprobanteUrl,
  comprobantePublicId,
}) {
  return postApiAction(
    {
      action: "expense_create",
      categoria,
      descripcion,
      monto,
      medioPago,
      observacion,
      comprobanteUrl,
      comprobantePublicId,
    },
    "Error guardando gasto"
  );
}

export async function getExpenses({ from, to, categoria } = {}) {
  const json = await getApiJson(
    {
      action: "expenses",
      from,
      to,
      categoria: categoria && categoria !== "Todas" ? categoria : undefined,
    },
    "Error cargando gastos"
  );

  return {
    expenses: json.expenses || [],
    summary: {
      total: 0,
      count: 0,
      byCategory: {},
      byPayment: {},
      ...(json.summary || {}),
    },
  };
}
