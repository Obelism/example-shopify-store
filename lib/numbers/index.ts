/** Hidden cart-line attribute carrying the visitor id into the order, so a paid order counts for the visitor who placed it. */
export const VISITOR_LINE_ATTRIBUTE = "_obelism_visitor_id";

/** Shopify's numeric id from a gid, the form orders/paid uses, so item ids match across every event. */
export function shopifyItemId(gid: string): string {
  return gid.slice(gid.lastIndexOf("/") + 1).split("?")[0] ?? gid;
}
