"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { configurationOptions, formatEuro, type Product } from "../../../lib/catalog";

const euCountries = [
  ["AT", "Austria"], ["BE", "Belgium"], ["BG", "Bulgaria"], ["HR", "Croatia"], ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["EE", "Estonia"], ["FI", "Finland"], ["FR", "France"], ["DE", "Germany"], ["GR", "Greece"], ["HU", "Hungary"], ["IE", "Ireland"], ["IT", "Italy"], ["LV", "Latvia"], ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MT", "Malta"], ["NL", "Netherlands"], ["PL", "Poland"], ["PT", "Portugal"], ["RO", "Romania"], ["SK", "Slovakia"], ["SI", "Slovenia"], ["ES", "Spain"], ["SE", "Sweden"],
];

export default function CheckoutForm({ product, email }: { product: Product; email: string }) {
  const router = useRouter();
  const [flightKit, setFlightKit] = useState<keyof typeof configurationOptions.flightKit>("standard");
  const [storage, setStorage] = useState<keyof typeof configurationOptions.storage>("included");
  const [warranty, setWarranty] = useState<keyof typeof configurationOptions.warranty>("standard");
  const [quantity, setQuantity] = useState(1);
  const [buyerType, setBuyerType] = useState<"consumer" | "business">("consumer");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paypal" | "wise">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const unit = product.priceCents + configurationOptions.flightKit[flightKit].priceCents + configurationOptions.storage[storage].priceCents + configurationOptions.warranty[warranty].priceCents;
    const subtotal = unit * quantity;
    const shipping = 1900;
    const vat = Math.round((subtotal + shipping) * 0.2);
    return { subtotal, shipping, vat, total: subtotal + shipping + vat };
  }, [flightKit, product.priceCents, quantity, storage, warranty]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productSlug: product.slug, quantity, flightKit, storage, warranty, paymentProvider, buyerType, vatId: form.get("vatId"), fullName: form.get("fullName"), company: form.get("company"), addressLine1: form.get("addressLine1"), addressLine2: form.get("addressLine2"), city: form.get("city"), postalCode: form.get("postalCode"), country: form.get("country") }) });
    const result = await response.json() as { orderId?: string; error?: string };
    if (!response.ok || !result.orderId) { setError(result.error ?? "Checkout could not be completed."); setLoading(false); return; }
    router.push(`/account?ordered=${encodeURIComponent(result.orderId)}`);
  }

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-main">
        <section className="checkout-card"><span className="checkout-step">01</span><h2>Configure your {product.name}</h2>
          <OptionGroup title="Flight kit" value={flightKit} setValue={(value) => setFlightKit(value as typeof flightKit)} options={configurationOptions.flightKit} />
          <OptionGroup title="Storage" value={storage} setValue={(value) => setStorage(value as typeof storage)} options={configurationOptions.storage} />
          <OptionGroup title="Protection" value={warranty} setValue={(value) => setWarranty(value as typeof warranty)} options={configurationOptions.warranty} />
          <label className="quantity-label">Quantity <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}><option>1</option><option>2</option><option>3</option></select></label>
        </section>
        <section className="checkout-card"><span className="checkout-step">02</span><h2>Delivery details</h2><p className="signed-in-copy">Signed in as <b>{email}</b></p>
          <div className="buyer-toggle"><button type="button" className={buyerType === "consumer" ? "selected" : ""} onClick={() => setBuyerType("consumer")}>Private customer</button><button type="button" className={buyerType === "business" ? "selected" : ""} onClick={() => setBuyerType("business")}>Business</button></div>
          <div className="field-grid"><label>Full name<input name="fullName" required autoComplete="name" /></label>{buyerType === "business" && <><label>Company<input name="company" required autoComplete="organization" /></label><label>EU VAT ID<input name="vatId" placeholder="DE123456789" /></label></>}<label className="wide">Address<input name="addressLine1" required autoComplete="address-line1" /></label><label className="wide">Address line 2<input name="addressLine2" autoComplete="address-line2" /></label><label>City<input name="city" required autoComplete="address-level2" /></label><label>Postal code<input name="postalCode" required autoComplete="postal-code" /></label><label className="wide">Country<select name="country" required defaultValue="DE">{euCountries.map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label></div>
        </section>
        <section className="checkout-card"><span className="checkout-step">03</span><h2>Sandbox payment</h2><div className="payment-options">{([['stripe','Stripe','Card · Apple Pay · SEPA'],['paypal','PayPal','PayPal balance · card'],['wise','Wise','Business payment link']] as const).map(([id,name,detail]) => <button type="button" className={paymentProvider === id ? "selected" : ""} onClick={() => setPaymentProvider(id)} key={id}><b>{name}</b><span>{detail}</span><em>TEST</em></button>)}</div><div className="sandbox-notice"><b>No payment will be taken.</b> This prototype creates a sandbox payment reference and a stored test order. Real provider checkout and webhook confirmation will replace this adapter before launch.</div>
          <label className="terms-check"><input type="checkbox" required /> <span>I accept the prototype terms, privacy notice, and acknowledge that product specifications and delivery dates are provisional.</span></label>
        </section>
      </div>
      <aside className="order-summary"><p className="section-kicker">Order summary</p><h2>{product.name}</h2><dl><div><dt>Configured product × {quantity}</dt><dd>{formatEuro(summary.subtotal)}</dd></div><div><dt>Tracked EU delivery</dt><dd>{formatEuro(summary.shipping)}</dd></div><div><dt>Estimated VAT (demo 20%)</dt><dd>{formatEuro(summary.vat)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{formatEuro(summary.total)}</dd></div></dl><p>VAT will ultimately be calculated from the buyer location, tax status, and your registrations. This demo rate is not tax advice.</p>{error && <div className="checkout-error" role="alert">{error}</div>}<button type="submit" disabled={loading}>{loading ? "Creating secure order…" : `Place sandbox order · ${formatEuro(summary.total)}`} <span>↗</span></button><small>Encrypted checkout · Server-verified pricing · EUR</small></aside>
    </form>
  );
}

function OptionGroup({ title, value, setValue, options }: { title: string; value: string; setValue: (value: string) => void; options: Record<string, { label: string; priceCents: number }> }) {
  return <fieldset className="option-group"><legend>{title}</legend>{Object.entries(options).map(([key, option]) => <label className={value === key ? "selected" : ""} key={key}><input type="radio" name={title} value={key} checked={value === key} onChange={() => setValue(key)} /><span>{option.label}</span><b>{option.priceCents ? `+${formatEuro(option.priceCents)}` : "Included"}</b></label>)}</fieldset>;
}

