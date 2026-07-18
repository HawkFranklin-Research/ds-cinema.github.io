(() => {
  "use strict";

  const html = document.documentElement;
  const root = html.dataset.staticRoot || "./";
  const page = html.dataset.page || "";
  const orderKey = "ds-cinema-static-orders-v1";

  setupNavigation();
  setupPilotForm();
  setupGallery();
  if (page === "checkout") setupCheckout();
  if (page === "account") setupAccount();

  function setupNavigation() {
    const button = document.querySelector(".menu-button");
    const nav = document.querySelector(".nav-links");
    if (!button || !nav) return;

    button.addEventListener("click", () => {
      const open = nav.classList.toggle("nav-open");
      button.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupPilotForm() {
    const form = document.querySelector(".pilot-form");
    const wrap = document.querySelector(".pilot-form-wrap");
    if (!form || !wrap) return;

    const original = wrap.innerHTML;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      localStorage.setItem(
        "ds-cinema-pilot-interest",
        JSON.stringify({ email: data.get("email"), role: data.get("role"), savedAt: new Date().toISOString() }),
      );
      wrap.innerHTML = `<div class="success-message" role="status"><span>✓</span><h3>You're on the flight list.</h3><p>Your interest is saved on this device. Firebase will securely submit it when the public backend is connected.</p><button type="button">Add another email</button></div>`;
      wrap.querySelector("button")?.addEventListener("click", () => {
        wrap.innerHTML = original;
        setupPilotForm();
      });
    });
  }

  function setupGallery() {
    document.querySelectorAll(".gallery-thumbs button").forEach((button) => {
      button.addEventListener("click", () => {
        button.parentElement?.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
      });
    });
  }

  function setupCheckout() {
    const form = document.querySelector(".checkout-layout");
    if (!(form instanceof HTMLFormElement)) return;

    const basePrice = Number(html.dataset.basePrice || 0);
    const productSlug = html.dataset.product || "creator-air";
    const productName = document.querySelector(".order-summary h2")?.textContent?.trim() || "DS Cinema camera";
    const buyerButtons = [...form.querySelectorAll(".buyer-toggle button")];
    const paymentButtons = [...form.querySelectorAll(".payment-options button")];

    form.querySelectorAll(".option-group input").forEach((input) => {
      input.addEventListener("change", () => {
        input.closest(".option-group")?.querySelectorAll("label").forEach((label) => label.classList.remove("selected"));
        input.closest("label")?.classList.add("selected");
        updateSummary();
      });
    });

    form.querySelector(".quantity-label select")?.addEventListener("change", updateSummary);

    buyerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        buyerButtons.forEach((item) => item.classList.toggle("selected", item === button));
        toggleBusinessFields(button.textContent?.includes("Business") || false);
      });
    });

    paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        paymentButtons.forEach((item) => item.classList.toggle("selected", item === button));
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const summary = calculateSummary();
      const id = globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}`;
      const order = {
        id,
        orderNumber: `DS-DEMO-${String(Date.now()).slice(-7)}`,
        productSlug,
        productName,
        quantity: summary.quantity,
        totalCents: summary.total,
        paymentProvider: paymentButtons.find((button) => button.classList.contains("selected"))?.querySelector("b")?.textContent || "Stripe",
        paymentStatus: "local demo only",
        shipmentStatus: "not submitted",
        createdAt: new Date().toISOString(),
      };

      const orders = readOrders();
      orders.unshift(order);
      localStorage.setItem(orderKey, JSON.stringify(orders));
      location.href = `${root}account/?ordered=${encodeURIComponent(id)}`;
    });

    updateSummary();

    function calculateSummary() {
      const selected = [...form.querySelectorAll(".option-group input:checked")].map((input) => input.value);
      const extras = selected.reduce((total, value) => total + ({ studio: 18900, expanded: 7900, care: 9900 }[value] || 0), 0);
      const quantity = Number(form.querySelector(".quantity-label select")?.value || 1);
      const subtotal = (basePrice + extras) * quantity;
      const shipping = 1900;
      const vat = Math.round((subtotal + shipping) * 0.2);
      return { quantity, subtotal, shipping, vat, total: subtotal + shipping + vat };
    }

    function updateSummary() {
      const summary = calculateSummary();
      const values = [summary.subtotal, summary.shipping, summary.vat, summary.total];
      form.querySelectorAll(".order-summary dd").forEach((element, index) => {
        element.textContent = euro(values[index]);
      });
      const quantityText = form.querySelector(".order-summary dt");
      if (quantityText) quantityText.textContent = `Configured product × ${summary.quantity}`;
      const submit = form.querySelector(".order-summary > button");
      if (submit) submit.innerHTML = `Place local demo order · ${euro(summary.total)} <span>↗</span>`;
    }

    function toggleBusinessFields(show) {
      const grid = form.querySelector(".field-grid");
      if (!grid) return;
      grid.querySelectorAll("[data-business-field]").forEach((field) => field.remove());
      if (!show) return;
      const fullName = grid.querySelector("label");
      fullName?.insertAdjacentHTML("afterend", '<label data-business-field>Company<input name="company" required autocomplete="organization"></label><label data-business-field>EU VAT ID<input name="vatId" placeholder="DE123456789"></label>');
    }
  }

  function setupAccount() {
    const panel = document.querySelector(".orders-panel");
    if (!panel) return;
    const orders = readOrders();
    const ordered = new URLSearchParams(location.search).get("ordered");

    const profile = document.querySelector(".account-heading > p:last-child");
    if (profile) profile.textContent = "Static GitHub Pages preview · Firebase account connection pending";

    if (ordered) {
      const notice = document.createElement("div");
      notice.className = "order-success";
      notice.innerHTML = "<b>Local demo order saved.</b><span>This record exists only in this browser and no payment was collected.</span>";
      panel.before(notice);
    }

    if (!orders.length) {
      panel.innerHTML = `<div class="orders-title"><h2>Your orders</h2><a href="${root}shop/">Continue shopping ↗</a></div><div class="empty-orders"><h3>No local demo orders yet.</h3><p>Configure a camera to test the static storefront. Firebase will replace browser storage for public launch.</p><a href="${root}shop/">Explore the cameras</a></div>`;
      return;
    }

    panel.innerHTML = `<div class="orders-title"><h2>Your local demo orders</h2><a href="${root}shop/">Continue shopping ↗</a></div><div class="order-list">${orders.map((order) => orderMarkup(order, ordered)).join("")}</div>`;
    panel.querySelectorAll("[data-invoice]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openPrototypeInvoice(orders.find((order) => order.id === link.dataset.invoice));
      });
    });
  }

  function orderMarkup(order, ordered) {
    return `<article class="${order.id === ordered ? "new-order" : ""}"><div class="order-primary"><span>${escapeHtml(order.orderNumber)}</span><h3>${escapeHtml(order.productName)} × ${order.quantity}</h3><p>Saved ${new Date(order.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p></div><div><small>Payment</small><b>${escapeHtml(order.paymentStatus)}</b><span>selected ${escapeHtml(order.paymentProvider)}</span></div><div><small>Shipment</small><b>${escapeHtml(order.shipmentStatus)}</b><span>Firebase not connected</span></div><div class="order-total"><small>Total</small><b>${euro(order.totalCents)}</b><a href="#" data-invoice="${escapeHtml(order.id)}">Open prototype invoice</a></div></article>`;
  }

  function openPrototypeInvoice(order) {
    if (!order) return;
    const invoice = window.open("", "_blank");
    if (!invoice) return;
    invoice.opener = null;
    invoice.document.write(`<!doctype html><html><head><title>Prototype invoice ${escapeHtml(order.orderNumber)}</title><style>body{font:16px Arial,sans-serif;max-width:760px;margin:60px auto;padding:20px;color:#14202b}h1{font-size:42px}header{display:flex;justify-content:space-between;border-bottom:2px solid #14202b}table{width:100%;border-collapse:collapse;margin-top:50px}th,td{text-align:left;padding:14px;border-bottom:1px solid #ccd5dc}.warning{background:#fff2cc;padding:16px;margin:30px 0}</style></head><body><header><h1>DS Cinema</h1><p>${escapeHtml(order.orderNumber)}</p></header><div class="warning"><b>Prototype only.</b> Not a legal VAT invoice. No payment was collected.</div><p>Saved ${new Date(order.createdAt).toLocaleString("en-GB")}</p><table><tr><th>Item</th><th>Quantity</th><th>Total</th></tr><tr><td>${escapeHtml(order.productName)}</td><td>${order.quantity}</td><td>${euro(order.totalCents)}</td></tr></table><p><button onclick="window.print()">Print / Save PDF</button></p></body></html>`);
    invoice.document.close();
  }

  function readOrders() {
    try {
      const value = JSON.parse(localStorage.getItem(orderKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function euro(cents) {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(Number(cents || 0) / 100);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }
})();
