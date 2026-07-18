import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductVisual } from "../../../components/ProductVisual";
import { formatEuro, getProduct, products } from "../../../lib/catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <main className="store-shell product-page">
      <header className="store-header"><Link className="brand" href="/"><span className="brand-mark">DS</span><span>cinema</span></Link><nav><Link href="/">Story</Link><Link href="/shop" className="active">Shop</Link><Link href="/account">My orders</Link></nav></header>
      <section className="product-detail">
        <div className="product-gallery"><ProductVisual accent={product.accent} /><div className="gallery-thumbs"><button className="selected">01 / Flight</button><button>02 / Camera</button><button>03 / Dock</button></div></div>
        <div className="product-info">
          <p className="section-kicker">{product.badge}</p><h1>{product.name}</h1><p className="product-tagline">{product.tagline}</p>
          <div className="product-price"><strong>{formatEuro(product.priceCents)}</strong><span>excl. VAT · estimated shipping €19</span></div>
          <div className="delivery-note"><i /> Prototype reservation · target dispatch Q2 2027</div>
          <h3>Technical specification</h3><dl>{product.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
          <h3>Inside the case</h3><ul className="included-list">{product.includes.map((item) => <li key={item}>✓ {item}</li>)}</ul>
          <Link className="configure-button" href={`/checkout/${product.slug}`}>Configure and order <span>↗</span></Link>
          <p className="checkout-footnote">Secure account required. Checkout currently runs in sandbox mode and will not charge you.</p>
        </div>
      </section>
    </main>
  );
}

