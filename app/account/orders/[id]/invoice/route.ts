import { env } from "cloudflare:workers";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getChatGPTUser } from "../../../../chatgpt-auth";

type InvoiceRow = { id: string; invoice_number: string; order_number: string; full_name: string; company: string | null; address_line_1: string; address_line_2: string | null; city: string; postal_code: string; country: string; vat_id: string | null; subtotal_cents: number; shipping_cents: number; vat_cents: number; total_cents: number; vat_rate_bps: number; currency: string; created_at: string; product_name: string; configuration: string; quantity: number; unit_price_cents: number };

const money = (cents: number) => `EUR ${(cents / 100).toFixed(2)}`;

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return new Response("Sign in required", { status: 401 });
  const { id } = await context.params;
  const row = await env.DB.prepare("SELECT o.*, oi.product_name, oi.configuration, oi.quantity, oi.unit_price_cents FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.id = ? AND o.email = ? LIMIT 1").bind(id, user.email).first<InvoiceRow>();
  if (!row) return new Response("Invoice not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.02, 0.06, 0.12); const cyan = rgb(0.16, 0.68, 0.8); const grey = rgb(0.38, 0.45, 0.52);
  page.drawRectangle({ x: 0, y: 760, width: 595.28, height: 82, color: navy });
  page.drawText("DS cinema", { x: 42, y: 794, size: 22, font: bold, color: rgb(.91,.97,1) });
  page.drawText("PROTOTYPE VAT INVOICE", { x: 388, y: 798, size: 9, font: bold, color: cyan });
  page.drawText(row.invoice_number, { x: 388, y: 782, size: 10, font: regular, color: rgb(.75,.82,.87) });
  page.drawText("Supplier", { x: 42, y: 714, size: 9, font: bold, color: cyan });
  page.drawText("DS Cinema — legal entity details pending", { x: 42, y: 694, size: 10, font: regular, color: navy });
  page.drawText("VAT registration must be configured before live sales", { x: 42, y: 678, size: 9, font: regular, color: grey });
  page.drawText("Bill to", { x: 330, y: 714, size: 9, font: bold, color: cyan });
  const buyer = [row.company, row.full_name, row.address_line_1, row.address_line_2, `${row.postal_code} ${row.city}`, row.country, row.vat_id ? `VAT ID: ${row.vat_id}` : null].filter(Boolean) as string[];
  buyer.forEach((line, index) => page.drawText(line, { x: 330, y: 694 - index * 15, size: 9, font: regular, color: navy }));
  page.drawText(`Invoice date: ${new Date(row.created_at).toLocaleDateString("en-GB")}`, { x: 42, y: 620, size: 9, font: regular, color: grey });
  page.drawText(`Order reference: ${row.order_number}`, { x: 42, y: 604, size: 9, font: regular, color: grey });
  page.drawRectangle({ x: 42, y: 557, width: 511, height: 28, color: navy });
  [["Description", 52], ["Qty", 390], ["Unit", 438], ["Amount", 496]].forEach(([text, x]) => page.drawText(String(text), { x: Number(x), y: 567, size: 8, font: bold, color: rgb(.91,.97,1) }));
  page.drawText(row.product_name, { x: 52, y: 528, size: 11, font: bold, color: navy });
  page.drawText("Configured autonomous indoor camera", { x: 52, y: 511, size: 8, font: regular, color: grey });
  page.drawText(String(row.quantity), { x: 397, y: 528, size: 10, font: regular, color: navy });
  page.drawText(money(row.unit_price_cents), { x: 438, y: 528, size: 9, font: regular, color: navy });
  page.drawText(money(row.subtotal_cents), { x: 496, y: 528, size: 9, font: regular, color: navy });
  page.drawLine({ start: { x: 42, y: 488 }, end: { x: 553, y: 488 }, thickness: .5, color: rgb(.75,.79,.82) });
  const totals: [string, string][] = [["Subtotal", money(row.subtotal_cents)], ["Shipping", money(row.shipping_cents)], [`VAT ${(row.vat_rate_bps / 100).toFixed(0)}% (demo)`, money(row.vat_cents)], ["Total", money(row.total_cents)]];
  totals.forEach(([label, value], index) => { const y = 454 - index * 27; page.drawText(label, { x: 378, y, size: index === 3 ? 11 : 9, font: index === 3 ? bold : regular, color: navy }); page.drawText(value, { x: 485, y, size: index === 3 ? 11 : 9, font: index === 3 ? bold : regular, color: navy }); });
  page.drawRectangle({ x: 42, y: 120, width: 511, height: 78, color: rgb(.94,.97,.98) });
  page.drawText("PROTOTYPE DOCUMENT — NOT A VALID TAX INVOICE", { x: 58, y: 170, size: 9, font: bold, color: navy });
  page.drawText("Sequential numbering, seller registration, country VAT logic and final legal wording", { x: 58, y: 151, size: 8, font: regular, color: grey });
  page.drawText("must be configured with an EU tax adviser before accepting live payments.", { x: 58, y: 137, size: 8, font: regular, color: grey });
  const bytes = await pdf.save();
  return new Response(bytes, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${row.invoice_number}.pdf"`, "cache-control": "private, no-store" } });
}

