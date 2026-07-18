# GitHub Pages version

The repository now contains a static version of DS Cinema that GitHub Pages can
serve directly. It does not require Node.js, npm, Next.js, vinext or a server at
visitor runtime.

## What is included

- `index.html` — landing page
- `shop/index.html` — marketplace
- `shop/creator-air/index.html` — Creator Air product page
- `shop/creator-air-pro/index.html` — Creator Air Pro product page
- `checkout/creator-air/index.html` — Creator Air static demo checkout
- `checkout/creator-air-pro/index.html` — Creator Air Pro static demo checkout
- `account/index.html` — local demo order history
- `assets/` — compiled design, fonts, artwork and browser interactions
- `.nojekyll` — tells GitHub Pages to serve the files without Jekyll processing

The original application in `app/`, together with its API, database and invoice
code, remains in the repository for the future Firebase migration.

## What works on GitHub Pages

GitHub Pages can serve:

- the complete visual design;
- navigation and responsive layouts;
- the two-product marketplace;
- product configuration and price calculations;
- a clearly labelled local demo checkout;
- local demo orders saved in the visitor's browser;
- a printable prototype invoice generated in the browser; and
- the early-access form saved locally for demonstration.

The local demo data is stored with browser `localStorage`. It is not shared
between browsers or devices, and deleting browser data removes it.

## What still requires Firebase or another backend

Plain HTML and browser JavaScript can display and operate the storefront, but
they must not be trusted to confirm prices, payments or fulfilment. The public
marketplace still needs:

- Firebase Authentication for real customer accounts;
- Firestore for customers, orders, payment state and shipment records;
- Cloud Functions or Cloud Run for trusted order creation;
- server-created Stripe Checkout Sessions;
- server-created and captured PayPal Orders;
- verified Stripe and PayPal webhooks;
- server-controlled invoice numbering and legal invoice generation; and
- protected administrative and fulfilment tools.

Firebase's public browser configuration may be placed in frontend JavaScript,
but Stripe secret keys, PayPal secrets, webhook secrets and privileged Firebase
service credentials must remain in server-side secret storage. A GitHub Pages
file must never contain those secrets.

## Regenerating the static version

The checked-in HTML is generated from the existing application so both versions
retain the same content and design. After changing the React/vinext pages, run:

```bash
npm install
npm run export:github-pages
```

This performs the application build, renders the public routes, removes the
server/React runtime, rewrites internal links for a GitHub project site and
updates the static files. Node.js is required only for this development-time
regeneration step, not for the deployed GitHub Pages website.

## Enabling GitHub Pages later

After reviewing and pushing the static files:

1. Open the `HawkFranklin-Research/ds-cinema.github.io` repository on GitHub.
2. Select **Settings**.
3. Select **Pages** in the left sidebar under **Code and automation**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**.
6. Select **Save**.
7. Wait for the Pages deployment to complete.
8. Open `https://hawkfranklin-research.github.io/ds-cinema.github.io/`.

No custom-domain DNS record should be created yet. First confirm that the
GitHub Pages address works. A custom subdomain can later be attached either to
the static marketing site or, preferably, to the Firebase-hosted full
marketplace after its backend is ready.

## Public-launch sequence

1. Publish and review the static site on GitHub Pages.
2. Create the Firebase production project.
3. Replace local demo identity and storage with Firebase Authentication and
   Firestore.
4. Add trusted server endpoints for order creation, payments, webhooks and
   invoices.
5. Test Stripe and PayPal entirely in sandbox mode.
6. Complete VAT, invoice, privacy, returns and fulfilment setup.
7. Connect `dscinema.hawkfranklin.in` to the selected production host using only
   the DNS records supplied by that host.
8. Complete end-to-end testing before enabling live payments.
