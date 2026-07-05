import { useCallback, useEffect, useMemo, useState } from "react";
import { PAYMENT_METHODS } from "../../../entities/payment/constants";

function createInitialPaymentDrafts() {
  return Object.fromEntries(PAYMENT_METHODS.map((method) => [method, null]));
}

function createInitialPaymentOrder() {
  return [];
}

export function useSalePayments(total) {
  const [paymentDrafts, setPaymentDrafts] = useState(createInitialPaymentDrafts);
  const [paymentOrder, setPaymentOrder] = useState(createInitialPaymentOrder);
  const [obs, setObs] = useState("");

  const paymentBreakdown = useMemo(() => {
    const orderedMethods = paymentOrder.concat(
      PAYMENT_METHODS.filter((method) => !paymentOrder.includes(method))
    );

    return orderedMethods
      .map((method) => {
        const raw = paymentDrafts[method];
        const active = raw !== null;
        const amount = active ? Number(String(raw || "").replace(",", ".")) : 0;

        return {
          method,
          active,
          raw,
          amount: Number.isFinite(amount) ? amount : Number.NaN,
        };
      })
      .filter((payment) => payment.active);
  }, [paymentDrafts, paymentOrder]);

  const paymentTotal = useMemo(() => {
    return paymentBreakdown.reduce((sum, payment) => {
      if (!Number.isFinite(payment.amount) || payment.amount <= 0) return sum;
      return sum + payment.amount;
    }, 0);
  }, [paymentBreakdown]);

  const paymentDifference = useMemo(() => {
    return Number((total - paymentTotal).toFixed(2));
  }, [paymentTotal, total]);

  const applyAutoPaymentDrafts = useCallback(
    (drafts, order) => {
      const activeMethods = order.filter((method) => drafts[method] !== null);
      if (activeMethods.length === 0) return drafts;

      const next = { ...drafts };
      let changed = false;

      const setAmount = (method, amount) => {
        const normalized = String(Number(amount.toFixed(2)));
        if (next[method] === normalized) return;
        next[method] = normalized;
        changed = true;
      };

      if (activeMethods.length === 1) {
        setAmount(activeMethods[0], total);
        return changed ? next : drafts;
      }

      const autoMethod = activeMethods[activeMethods.length - 1];
      const manualMethods = activeMethods.slice(0, -1);

      const manualSum = manualMethods.reduce((sum, method) => {
        const parsed = Number(String(drafts[method] || "").replace(",", "."));
        if (!Number.isFinite(parsed) || parsed <= 0) return sum;
        return sum + parsed;
      }, 0);

      const remaining = Math.max(Number((total - manualSum).toFixed(2)), 0);
      setAmount(autoMethod, remaining);

      return changed ? next : drafts;
    },
    [total]
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPaymentDrafts((prev) => applyAutoPaymentDrafts(prev, paymentOrder));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [applyAutoPaymentDrafts, paymentOrder]);

  const togglePaymentMethod = useCallback(
    (method) => {
      const isActive = paymentDrafts[method] !== null;
      const nextOrder = isActive
        ? paymentOrder.filter((item) => item !== method)
        : paymentOrder.includes(method)
          ? paymentOrder
          : [...paymentOrder, method];

      setPaymentOrder(nextOrder);
      setPaymentDrafts((prev) => {
        const next = {
          ...prev,
          [method]: isActive ? null : "",
        };

        return applyAutoPaymentDrafts(next, nextOrder);
      });
    },
    [applyAutoPaymentDrafts, paymentDrafts, paymentOrder]
  );

  const setPaymentAmount = useCallback(
    (method, value) => {
      setPaymentDrafts((prev) => {
        const next = {
          ...prev,
          [method]: value,
        };

        return applyAutoPaymentDrafts(next, paymentOrder);
      });
    },
    [applyAutoPaymentDrafts, paymentOrder]
  );

  const resetPayments = useCallback(() => {
    setPaymentDrafts(createInitialPaymentDrafts());
    setPaymentOrder(createInitialPaymentOrder());
    setObs("");
  }, []);

  return {
    paymentDrafts,
    paymentOrder,
    obs,
    setObs,
    paymentBreakdown,
    paymentDifference,
    togglePaymentMethod,
    setPaymentAmount,
    resetPayments,
  };
}
