import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { configurationOptions, getProduct } from "../../../lib/catalog";

type CheckoutPayload = {
  productSlug?: string;
  quantity?: number;
  flightKit?: keyof typeof configurationOptions.flightKit;
  storage?: keyof typeof configurationOptions.storage;
  warranty?: keyof typeof configurationOptions.warranty;
  paymentProvider?: "stripe" | "paypal" | "wise";
  buyerType?: "consumer" | "business";
  vatId?: string;
  fullName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

function clean(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required to place an order." }, { status: 401 });

  const payload = (await request.json()) as CheckoutPayload;
  const product = getProduct(clean(payload.productSlug, 60));
  const quantity = Math.min(3, Math.max(1, Number(payload.quantity) || 1));
  const flightKitKey = payload.flightKit && payload.flightKit in configurationOptions.flightKit ? payload.flightKit : "standard";
  const storageKey = payload.storage && payload.storage in configurationOptions.storage ? payload.storage : "included";
  const warrantyKey = payload.warranty && payload.warranty in configurationOptions.warranty ? payload.warranty : "standard";
  const provider = ["stripe", "paypal", "wise"].includes(payload.paymentProvider ?? "") ? payload.paymentProvider! : "stripe";
  const fullName = clean(payload.fullName);
  const addressLine1 = clean(payload.addressLine1);
  const city = clean(payload.city);
  const postalCode = clean(payload.postalCode, 32);
  const country = clean(payload.country, 2).toUpperCase();

  if (!product || !fullName || !addressLine1 || !city || !postalCode || country.length !== 2) {
    return Response.json({ error: "Please complete all required checkout fields." }, { status: 400 });
  }

  const configurationPrice = configurationOptions.flightKit[flightKitKey].priceCents + configurationOptions.storage[storageKey].priceCents + configurationOptions.warranty[warrantyKey].priceCents;
  const unitPriceCents = product.priceCents + configurationPrice;
  const subtotalCents = unitPriceCents * quantity;
  const shippingCents = 1900;
  const vatRateBps = 2000; // Sandbox estimate. Replace with Stripe Tax / validated VAT logic before launch.
  const vatCents = Math.round((subtotalCents + shippingCents) * vatRateBps / 10000);
  const totalCents = subtotalCents + shippingCents + vatCents;
  const orderId = crypto.randomUUID();
  const customerId = crypto.randomUUID();
  const itemId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  const shipmentId = crypto.randomUUID();
  const suffix = Date.now().toString().slice(-8);
  const orderNumber = `DS-${new Date().getUTCFullYear()}-${suffix}`;
  const invoiceNumber = `DSI-${new Date().getUTCFullYear()}-${suffix}`;
  const paymentReference = `demo_${provider}_${crypto.randomUUID().slice(0, 12)}`;
  const configuration = JSON.stringify({
    flightKit: configurationOptions.flightKit[flightKitKey].label,
    storage: configurationOptions.storage[storageKey].label,
    warranty: configurationOptions.warranty[warrantyKey].label,
  });

  const db = env.DB;
  if (!db) return Response.json({ error: "Order database is not configured." }, { status: 503 });

  try {
    await db.batch([
      db.prepare("INSERT INTO customers (id, email, full_name) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, updated_at = CURRENT_TIMESTAMP").bind(customerId, user.email, user.fullName ?? fullName),
      db.prepare("INSERT INTO orders (id, order_number, invoice_number, customer_id, email, status, payment_status, payment_provider, payment_reference, currency, subtotal_cents, shipping_cents, vat_cents, total_cents, vat_rate_bps, buyer_type, vat_id, full_name, company, address_line_1, address_line_2, city, postal_code, country) VALUES (?, ?, ?, (SELECT id FROM customers WHERE email = ?), ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(orderId, orderNumber, invoiceNumber, user.email, user.email, "confirmed", "paid_sandbox", provider, paymentReference, subtotalCents, shippingCents, vatCents, totalCents, vatRateBps, payload.buyerType === "business" ? "business" : "consumer", clean(payload.vatId, 40) || null, fullName, clean(payload.company) || null, addressLine1, clean(payload.addressLine2) || null, city, postalCode, country),
      db.prepare("INSERT INTO order_items (id, order_id, product_slug, product_name, configuration, quantity, unit_price_cents, line_total_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(itemId, orderId, product.slug, product.name, configuration, quantity, unitPriceCents, subtotalCents),
      db.prepare("INSERT INTO payments (id, order_id, provider, provider_reference, status, amount_cents, currency, is_sandbox) VALUES (?, ?, ?, ?, ?, ?, 'EUR', 1)").bind(paymentId, orderId, provider, paymentReference, "paid_sandbox", totalCents),
      db.prepare("INSERT INTO shipments (id, order_id, status, estimated_dispatch) VALUES (?, ?, ?, ?)").bind(shipmentId, orderId, "preorder_received", "Q2 2027 target"),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save order.";
    return Response.json({ error: message.includes("no such table") ? "The marketplace database is being prepared. Please try again after deployment." : "Could not save your order." }, { status: 500 });
  }

  return Response.json({ orderId, orderNumber, invoiceNumber, paymentReference, totalCents, sandbox: true }, { status: 201 });
}

