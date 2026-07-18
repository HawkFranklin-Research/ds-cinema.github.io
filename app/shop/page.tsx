import Link from "next/link";
import { ProductVisual } from "../../components/ProductVisual";
import { formatEuro, products } from "../../lib/catalog";

export const metadata = { title: "Shop autonomous creator cameras — DS Cinema" };

export default function ShopPage() {
  return (
    <main className="store-shell">
      <header className="store-header">
        <Link className="brand" href="/"><span className="brand-mark">DS</span><span>cinema</span></Link>
        <nav><Link href="/">Story</Link><Link href="/shop" className="active">Shop</Link><Link href="/account">My orders</Link></nav>
      </header>
      <section className="store-hero">
        <p className="section-kicker">DS Cinema marketplace / EU</p>
        <h1>Choose your<br /><span>camera crew.</span></h1>
        <p>Creator-grade autonomous indoor cameras, configured for your studio and backed by a two-year EU guarantee.</p>
        <div className="prototype-banner"><b>Prototype preorder experience</b><span>Prices, specifications, tax and delivery dates remain provisional. No real payment is collected.</span></div>
      </section>
      <section className="store-products">
        {products.map((product) => (
          <article className="store-product" key={product.slug}>
            <ProductVisual accent={product.accent} />
            <div className="store-product-copy">
              <p>{product.badge}</p>
              <h2>{product.name}</h2>
              <span>{product.tagline}</span>
              <ul>{product.specs.slice(0, 4).map((spec) => <li key={spec.label}><small>{spec.label}</small>{spec.value}</li>)}</ul>
              <div className="product-buy-row">
                <div><small>From</small><strong>{formatEuro(product.priceCents)}</strong><em>excl. VAT</em></div>
                <Link href={`/shop/${product.slug}`}>Configure <span>↗</span></Link>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="store-trust">
        <div><b>2 year</b><span>EU legal guarantee</span></div><div><b>14 day</b><span>distance-sale withdrawal</span></div><div><b>Local</b><span>encrypted processing</span></div><div><b>€ EUR</b><span>European checkout</span></div>
      </section>
    </main>
  );
}

