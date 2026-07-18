import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getProduct } from "../../../lib/catalog";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const user = await requireChatGPTUser(`/checkout/${slug}`);
  return <main className="store-shell checkout-page"><header className="store-header"><Link className="brand" href="/"><span className="brand-mark">DS</span><span>cinema</span></Link><nav><Link href="/shop">← Back to shop</Link><Link href="/account">My orders</Link></nav></header><div className="checkout-heading"><p className="section-kicker">Secure prototype checkout</p><h1>Configure. Confirm.<br /><span>Prepare for flight.</span></h1></div><CheckoutForm product={product} email={user.email} /></main>;
}

