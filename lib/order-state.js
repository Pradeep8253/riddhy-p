export const ALLOWED_TRANSITIONS = {
  draft_cart: ["reserved", "payment_pending", "cancelled"],
  reserved: ["payment_pending", "cancelled"],
  payment_pending: ["paid", "payment_failed", "cancelled"],
  paid: ["confirmed", "processing", "cancelled", "refund_pending"],
  confirmed: ["processing", "packed", "cancelled", "refund_pending"],
  processing: ["packed", "ready_for_dispatch", "cancelled"],
  packed: ["ready_for_dispatch", "shipped", "cancelled"],
  ready_for_dispatch: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered", "delivery_failed"],
  out_for_delivery: ["delivered", "delivery_failed"],
  delivered: [
    "installation_scheduled",
    "installed",
    "completed",
    "return_requested",
  ],
  installation_scheduled: ["installed", "completed", "return_requested"],
  installed: ["completed", "return_requested"],
  completed: ["return_requested"],
  payment_failed: ["payment_pending", "cancelled"],
  delivery_failed: ["out_for_delivery", "returned", "cancelled"],
  return_requested: ["returned", "completed"],
  returned: ["refund_pending", "completed"],
  refund_pending: ["refunded"],
  refunded: [],
  cancelled: [],
};

/**
 * Check if transition from currentState to targetState is permitted.
 */
export function canTransition(currentState, targetState) {
  if (currentState === targetState) return true;
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  return allowed.includes(targetState);
}

/**
 * Execute a valid state transition on an Order document.
 * Appends a timeline event and sets status timestamps.
 */
export function applyOrderTransition(
  order,
  targetState,
  { actorId, actorEmail, note } = {},
) {
  const currentState = order.status;
  if (!canTransition(currentState, targetState)) {
    throw new Error(
      `Invalid order status transition from "${currentState}" to "${targetState}". Allowed: ${(ALLOWED_TRANSITIONS[currentState] || []).join(", ") || "none"}`,
    );
  }

  const now = new Date();
  order.status = targetState;

  // Set dedicated lifecycle timestamps
  if (targetState === "delivered" && !order.deliveredAt) {
    order.deliveredAt = now;
  }
  if (targetState === "installed" && !order.installedAt) {
    order.installedAt = now;
  }

  // Ensure timeline array exists
  if (!Array.isArray(order.timeline)) {
    order.timeline = [];
  }

  order.timeline.push({
    status: targetState,
    at: now,
    note: note || `Order transitioned to ${targetState.replace(/_/g, " ")}`,
    by: actorId,
    byEmail: actorEmail || "system",
  });

  return order;
}
