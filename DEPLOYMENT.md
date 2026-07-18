# DS Cinema deployment and public-launch handoff

Last updated: 19 July 2026

This document records the hosting limitation encountered with the current
OpenAI Sites deployment and the work required to launch DS Cinema publicly at
`dscinema.hawkfranklin.in`.

## Current state

- Source repository: `HawkFranklin-Research/ds-cinema.github.io`
- Production branch: `main`
- Private preview:
  `https://ds-cinema-flight.hawkfranklin-9269.chatgpt.site`
- Intended public address: `https://dscinema.hawkfranklin.in`
- Current runtime: OpenAI Sites with vinext-compatible server output
- Current structured storage: Sites-managed D1 binding named `DB`
- Current identity: Sites/ChatGPT-provided authenticated-user headers
- Payments: sandbox simulation only; no real money is collected
- Invoices: prototype PDFs only; not legally valid VAT invoices

## Problem encountered with OpenAI Sites

The Site belongs to a workspace-restricted Sites environment. Its sharing
settings expose only:

1. everyone in the workspace; or
2. invited workspace members.

The settings page does not expose public sharing or an **Add domain** section.
Consequently, this deployment cannot currently:

- be opened by arbitrary public visitors;
- operate as a public ecommerce marketplace; or
- be connected to `dscinema.hawkfranklin.in` from this workspace.

OpenAI's Sites documentation distinguishes public Sites from
workspace-restricted Sites and notes that feature availability depends on plan,
region and workspace settings:

- <https://learn.chatgpt.com/docs/sites.md>

This is an account/workspace availability limitation, not a missing DNS record
or application bug.

## DNS warning

**Do not add a `dscinema` DNS record in Hostinger until the replacement public
host has been provisioned and has supplied its exact DNS target.**

In particular:

- do not point a CNAME directly at the existing `chatgpt.site` URL;
- do not change the current nameservers merely to test the private preview;
- do not reset the `hawkfranklin.in` DNS zone;
- do not edit existing `@`, `www`, `app`, `rashcheck`, MX, SPF, DKIM, DMARC,
  GitHub Pages, Google or OpenAI verification records.

The new `dscinema` record should be isolated from the existing root website,
email and other subdomains.

## Recommended public-hosting path

The preferred migration is **Firebase App Hosting**, because the domain is
already managed through Hostinger DNS, the project needs a public identity
system, and Firebase can connect a subdomain without moving the entire DNS zone.

Target architecture:

| Concern | Recommended production service |
| --- | --- |
| Web application and server routes | Firebase App Hosting / Cloud Run |
| Customer identity | Firebase Authentication |
| Customers, orders and shipments | Cloud Firestore |
| Payment cards, Apple Pay and eligible EU methods | Stripe Checkout |
| Secondary wallet checkout | PayPal Orders |
| Optional bank-transfer link | Wise Business |
| Provider credentials | Google Secret Manager / Firebase secrets |
| Generated invoice files, if persisted | Cloud Storage |
| Public hostname | `dscinema.hawkfranklin.in` |

Cloudflare Workers plus D1 remains a valid alternative and would require less
application-runtime work. On the usual Free or Pro Cloudflare setup, however,
Cloudflare would normally become the authoritative DNS provider for the whole
`hawkfranklin.in` zone. Firebase is preferred here to avoid that DNS migration.

## Migration phases

### Phase 1 — Create the public Firebase environment

1. Create or select the production Firebase project.
2. Enable the Blaze billing plan required by Firebase App Hosting.
3. Set a conservative Google Cloud billing budget and alerts.
4. Connect the GitHub repository and `main` branch to an App Hosting backend.
5. Select an EU region appropriate for the business and customer base.
6. Create separate preview and production environment configurations.

Do not store credentials in Git, `.env.example`, screenshots, issues or pull
requests.

### Phase 2 — Replace Sites-specific authentication

The current application reads identity through:

- `oai-authenticated-user-email`; and
- `oai-authenticated-user-full-name`.

Those headers exist only behind OpenAI Sites and must not be trusted on another
host. Replace this integration with Firebase Authentication:

1. Enable email-link or email/password authentication.
2. Optionally enable Google sign-in.
3. Add email verification and password/account recovery.
4. Exchange the Firebase ID token with the server on protected requests.
5. Verify every token server-side before reading or changing an order.
6. Key customer ownership by stable Firebase `uid`, not only email address.
7. Retain server-side authorization checks for account, checkout, invoice and
   order APIs.
8. Add account deletion and personal-data export workflows.

Public visitors should be able to view `/`, `/shop` and product pages without
signing in. `/checkout`, `/account`, order data and invoices must require an
authenticated customer.

### Phase 3 — Migrate persistent data from D1 to Firestore

The current relational schema contains:

- `customers`;
- `orders`;
- `order_items`;
- `payments`; and
- `shipments`.

Create equivalent Firestore collections or a deliberately documented aggregate
model. Preserve these principles:

- product prices are recalculated on the server;
- customers can access only their own records;
- payment-provider references are unique;
- webhook processing is idempotent;
- money is stored in integer minor units, not floating-point values;
- order and payment state transitions are auditable;
- invoice numbers are unique and sequential in production;
- shipment changes retain timestamps and tracking history.

Add Firestore security rules and test them against unauthorized reads and
writes. Client applications must never be permitted to mark an order as paid.

### Phase 4 — Integrate payment providers in sandbox mode

#### Stripe

1. Create Stripe Products and Prices for Creator Air and Creator Air Pro.
2. Create Checkout Sessions exclusively on the server.
3. Enable only payment methods supported by the business and target countries.
4. Configure Stripe Tax or equivalent validated VAT calculation.
5. Collect the billing and delivery information required for the order.
6. Register a webhook endpoint on the public backend.
7. Verify Stripe webhook signatures.
8. Fulfil an order only after a confirmed payment event.
9. Process duplicate webhook deliveries safely and exactly once.
10. Implement refunds, cancellations and payment-failure handling.

#### PayPal

1. Create PayPal Sandbox client credentials.
2. Create and capture Orders through server routes.
3. Register and verify PayPal webhooks.
4. Store PayPal order and capture identifiers.
5. Do not dispatch goods while a capture remains pending or denied.

#### Wise

Treat Wise as an optional business payment link or bank-transfer flow. Do not
present it as an automatically confirmed ecommerce payment until the selected
Wise Business product supports the required merchant and callback workflow.

Keep all systems in sandbox/test mode until the complete order lifecycle has
been verified.

### Phase 5 — Make invoices legally usable

The existing generated PDFs are deliberately labelled as prototype documents.
Before issuing real invoices, configure:

- registered legal entity name and address;
- seller VAT number and applicable registrations;
- unique sequential invoice numbering;
- issue and supply dates;
- customer details and validated business VAT ID where applicable;
- item description, quantity and net unit price;
- discounts, shipping and other taxable charges;
- VAT rate and amount broken down by rate;
- reverse-charge or exemption wording where applicable;
- credit-note references and cancellation rules;
- immutable storage and retention requirements;
- the local requirements of the seller's country of establishment.

Obtain EU VAT/accounting advice before activating live sales. Stripe Tax can
assist with calculation but does not replace business registration, reporting
or legal review.

### Phase 6 — Add fulfilment and operations

1. Choose the actual warehouse or fulfilment origin.
2. Define countries served, exclusions and shipping prices.
3. Integrate the selected carrier or fulfilment partner.
4. Store carrier, tracking number, dispatch and delivery events.
5. Add customer shipment notifications.
6. Add an internal administrative order view with role-based authorization.
7. Implement inventory or preorder allocation controls.
8. Document lost parcel, return, replacement and warranty workflows.

### Phase 7 — Connect the Hostinger subdomain

Do this only after Firebase shows a healthy production backend:

1. In Firebase App Hosting, open the production backend.
2. Select **Settings** and **Add custom domain**.
3. Enter `dscinema.hawkfranklin.in`.
4. Copy every DNS record Firebase supplies.
5. In Hostinger, open **Domains → hawkfranklin.in → DNS / Nameservers → DNS
   records**.
6. Search for an existing record named `dscinema`.
7. Remove only a conflicting `dscinema` A, AAAA or CNAME record, if one exists.
8. Add Firebase's records exactly. Hostinger's CNAME **Name** normally uses only
   `dscinema`, while its target uses the full hostname supplied by Firebase.
9. Leave all root-domain, email and unrelated subdomain records unchanged.
10. Return to Firebase and refresh domain verification.
11. Wait for DNS propagation and TLS certificate provisioning.
12. Verify `https://dscinema.hawkfranklin.in` and all protected routes.

### Phase 8 — Production-readiness checks

Before switching payment providers to live mode, verify:

- [ ] landing, shop and product pages work while signed out;
- [ ] account creation, verification, login, logout and recovery work;
- [ ] one customer cannot access another customer's orders or invoices;
- [ ] server pricing cannot be modified through browser requests;
- [ ] successful, failed, cancelled, delayed and duplicate payments are handled;
- [ ] no goods are dispatched before confirmed payment;
- [ ] refund and credit-note paths work;
- [ ] invoices contain approved legal and VAT information;
- [ ] delivery prices and country restrictions are correct;
- [ ] terms, privacy, cookies, returns, cancellation, warranty and preorder
      wording have been reviewed;
- [ ] secrets are stored only in the hosting secret manager;
- [ ] database backups, monitoring, alerts and incident contacts exist;
- [ ] analytics and error reporting avoid unnecessary personal data;
- [ ] the custom domain and HTTPS certificate are healthy;
- [ ] a real low-value transaction and refund have been reconciled end to end.

## Information required from the business owner

Implementation cannot be completed safely without:

- Firebase project and billing access;
- intended EU company and tax jurisdiction;
- registered company name, address and VAT number;
- supported sales and delivery countries;
- final product prices and whether displayed prices include VAT;
- Stripe test credentials and webhook-secret access;
- PayPal Sandbox credentials and webhook access;
- Wise Business capability or payment-link decision;
- warehouse, carrier and delivery-policy decisions;
- approved privacy, terms, returns, preorder and warranty text;
- customer-support email and operational contacts.

## What GitHub Pages can and cannot do

GitHub Pages can now host the checked-in static storefront beginning at
`index.html`. That version includes the landing page, marketplace, product
configuration and an explicitly local-only demo order flow. See
`GITHUB_PAGES.md` for its file map and publishing steps.

GitHub Pages still cannot execute trusted authentication, an order database,
payment webhooks, protected invoices or shipment APIs. The complete marketplace
requires Firebase App Hosting, Cloudflare Workers, a suitable application
platform or a managed server.

The GitHub repository remains the canonical source regardless of which public
runtime is selected.
