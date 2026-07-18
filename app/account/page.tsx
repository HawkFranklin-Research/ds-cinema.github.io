import { env } from "cloudflare:workers";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { formatEuro } from "../../lib/catalog";

export const dynamic = "force-dynamic";

type OrderRow = { id: string; order_number: string; invoice_number: string; status: string; payment_status: string; payment_provider: string; total_cents: number; created_at: string; product_name: string; quantity: number; shipment_status: string; estimated_dispatch: string | null };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ordered?: string }> }) {
  const user = await requireChatGPTUser("/account");
  const query = await searchParams;
  let orders: OrderRow[] = [];
  let databaseReady = true;
  try {
    const result = await env.DB.prepare("SELECT o.id, o.order_number, o.invoice_number, o.status, o.payment_status, o.payment_provider, o.total_cents, o.created_at, oi.product_name, oi.quantity, s.status AS shipment_status, s.estimated_dispatch FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN shipments s ON s.order_id = o.id WHERE o.email = ? ORDER BY o.created_at DESC").bind(user.email).all<OrderRow>();
    orders = result.results;
  } catch { databaseReady = false; }
  return <main className="store-shell account-page"><header className="store-header"><Link className="brand" href="/"><span className="brand-mark">DS</span><span>cinema</span></Link><nav><Link href="/shop">Shop</Link><a href={chatGPTSignOutPath("/")}>Sign out</a></nav></header><section className="account-heading"><p className="section-kicker">Creator account</p><h1>Orders & flights.</h1><p>{user.displayName} · {user.email}</p></section>{query.ordered && <div className="order-success"><b>Sandbox order confirmed.</b><span>Your order, payment reference, shipment record, and invoice are now stored.</span></div>}<section className="orders-panel"><div className="orders-title"><h2>Your orders</h2><Link href="/shop">Continue shopping ↗</Link></div>{!databaseReady ? <div className="empty-orders"><h3>Marketplace database is being prepared.</h3><p>The order dashboard will activate with the next database-enabled deployment.</p></div> : orders.length === 0 ? <div className="empty-orders"><h3>No orders yet.</h3><p>Configure your first autonomous camera and it will appear here.</p><Link href="/shop">Explore the cameras</Link></div> : <div className="order-list">{orders.map(order => <article key={order.id} className={query.ordered === order.id ? "new-order" : ""}><div className="order-primary"><span>{order.order_number}</span><h3>{order.product_name} × {order.quantity}</h3><p>Placed {new Date(order.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p></div><div><small>Payment</small><b>{order.payment_status.replaceAll("_", " ")}</b><span>via {order.payment_provider}</span></div><div><small>Shipment</small><b>{order.shipment_status.replaceAll("_", " ")}</b><span>{order.estimated_dispatch}</span></div><div className="order-total"><small>Total</small><b>{formatEuro(order.total_cents)}</b><a href={`/account/orders/${order.id}/invoice`} target="_blank">Download invoice PDF</a></div></article>)}</div>}</section></main>;
}

