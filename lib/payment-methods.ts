/**
 * Qué métodos de pago se ofrecen en cada tipo de pedido
 * (`business_settings.payment_methods`, CLAUDE.md 5.3). Se edita en
 * /admin/negocio y la usa el pedido (Fase 5).
 *
 * Reglas confirmadas por el usuario (2026-10-06):
 * - Mostrador y mesa: efectivo y transferencia; tarjeta se puede activar.
 * - Domicilio: solo tarjeta (Stripe), obligatoria.
 * - Tarjeta solo se puede ofrecer si Stripe está configurado (Fase 6).
 */

export const ORDER_TYPES = ["pickup", "table", "delivery"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const PAYMENT_METHODS = ["cash", "transfer", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentMatrix = Record<OrderType, PaymentMethod[]>;

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  pickup: "Para recoger en mostrador",
  table: "En mesa",
  delivery: "A domicilio",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta, Google Pay o Apple Pay",
};

/** Métodos que se pueden elegir en cada tipo. Domicilio no admite efectivo ni transferencia. */
export const ALLOWED_METHODS: Record<OrderType, PaymentMethod[]> = {
  pickup: ["cash", "transfer", "card"],
  table: ["cash", "transfer", "card"],
  delivery: ["card"],
};

export const DEFAULT_PAYMENT_MATRIX: PaymentMatrix = {
  pickup: ["cash", "transfer"],
  table: ["cash", "transfer"],
  delivery: ["card"],
};

/** Lee lo guardado sin confiar en ello: descarta lo desconocido o no permitido y respeta el orden de `PAYMENT_METHODS`. */
export function parsePaymentMatrix(raw: unknown): PaymentMatrix {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return Object.fromEntries(
    ORDER_TYPES.map((type) => {
      const value = source[type];
      if (!Array.isArray(value)) return [type, DEFAULT_PAYMENT_MATRIX[type]];
      return [type, PAYMENT_METHODS.filter((method) => value.includes(method) && ALLOWED_METHODS[type].includes(method))];
    })
  ) as PaymentMatrix;
}

/** Métodos que de verdad se le ofrecen al cliente: sin Stripe, la tarjeta no cuenta. */
export function effectiveMethods(matrix: PaymentMatrix, type: OrderType, stripeReady: boolean): PaymentMethod[] {
  return matrix[type].filter((method) => method !== "card" || stripeReady);
}
