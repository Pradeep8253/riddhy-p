# RF Riddhy setup & testing

## 1. Requirements

- Node.js **20.9 or later** (Node 22 recommended) for direct development.
- Docker Engine and Docker Compose v2 for the recommended local stack.
- A MongoDB **replica set** (local replica set or MongoDB Atlas). Checkout, order reservations, payment verification and webhook processing use multi-document transactions; a standalone MongoDB server is not sufficient.
- Optional: Razorpay test keys, Cloudinary credentials, SMTP credentials.

The project is JavaScript and uses custom CSS modules/global CSS; there is no Tailwind dependency. Direct package versions are pinned in `package.json`. No lockfile has been included in this source-only handoff.

## 2. Environment

```bash
cp .env.example .env
```

Edit `.env` before starting:

- `JWT_SECRET`: replace with a fresh random secret of at least 32 characters. Example: `openssl rand -base64 36`.
- `MONGODB_URI`: keep the local replica-set URL for direct Node development, or use a replica-set-capable Atlas URI. Docker Compose overrides this to its internal `mongo` service.
- `NEXT_PUBLIC_SITE_URL`: use the public origin that customers will visit. For the default local Compose host, `http://riddhy.localhost` is appropriate.
- `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD`: set your local demo administrator before seeding. Do not reuse the sample password outside an isolated local environment.
- Razorpay, Cloudinary and SMTP values are optional; blank values intentionally leave those integrations disabled.

`.env` is ignored by Git and excluded from the Docker build context. Never put secrets in `NEXT_PUBLIC_*` variables except the public Razorpay key ID and site URL.

## 3. Recommended: Docker Compose + Traefik

From the project root:

```bash
docker compose up --build -d
docker compose ps
docker compose exec app node scripts/seed.js
```

Open **http://riddhy.localhost**. Traefik listens on port 80. To change the host, set `TRAEFIK_HOST` in the shell or `.env` and set `NEXT_PUBLIC_SITE_URL` to the same origin before building. If port 80 is already occupied, stop the other service or change the Traefik host port mapping in `docker-compose.yml`.

The MongoDB health check initiates a single-node replica set named `rs0`; data is stored in the named `mongo-data` volume. To stop while keeping data:

```bash
docker compose down
```

To **delete the local database permanently** as well:

```bash
docker compose down -v
```

Seed output includes the demo administrator email and password. You can seed again safely to refresh the sample catalogue and campaign records. Use `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` to override the defaults; rerun the seed after changing them.

> Traefik is configured for a local HTTP preview, not public production TLS. Before exposing a server, configure HTTPS/ACME, authentication and monitoring for the proxy, network access controls, backups and a secret manager.

## 4. Direct Node development

### 4.1 Start a local replica set

One Docker-based local MongoDB option:

```bash
docker run -d --name rf-riddhy-mongo -p 27017:27017 mongo:8.0 mongod --replSet rs0 --bind_ip_all
docker exec rf-riddhy-mongo mongosh --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
```

Set `MONGODB_URI=mongodb://127.0.0.1:27017/rf-riddhy?replicaSet=rs0` in `.env`. If that replica set was previously initialized with a different advertised host, reconfigure it for your local environment or use the Compose setup above.

### 4.2 Install, seed and run

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`. `npm install` will create a lockfile locally; commit that lockfile if you want reproducible installs in your own deployment pipeline. To start a production server locally after a successful build:

```bash
npm run build
npm run start
```

These commands are provided as setup guidance; none were run in the authoring workspace.

## 5. Optional integrations

### Razorpay

1. Add Razorpay **test-mode** credentials to `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
2. Add a webhook secret to `RAZORPAY_WEBHOOK_SECRET`.
3. In the Razorpay dashboard, configure the webhook URL as `https://<your-public-host>/api/webhooks/razorpay` and subscribe to `payment.captured` and `payment.failed`.
4. Complete a test checkout; confirm that the UI only marks an order paid after the signed callback reaches `/api/payments/verify` or a signed webhook is processed. A browser redirect alone is not payment proof.

The webhook needs a reachable HTTPS endpoint outside local Compose. Use a controlled test tunnel or a deployed staging origin; do not expose the local admin panel publicly.

### Cloudinary claim attachments

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. Claim photos/videos are uploaded directly from the browser using a short-lived signed upload response from `/api/media/signature`; only image/video resources are accepted by the UI. The demo UI caps individual files at 10 MB and stores the returned secure URLs with the claim. Apply your own Cloudinary upload limits, retention policy and privacy notice before production.

### SMTP

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM`. Contact and trade enquiries are saved in MongoDB when it is configured; SMTP delivery is an additional notification. If neither MongoDB nor SMTP is configured, the API clearly reports that the enquiry was not stored or sent. Admin users can review persisted enquiries at `/admin/leads`.

## 6. Demo behavior and important boundaries

- Sample catalogue, pricing, reviews/layout examples, images, campaigns, policy durations, pincode coverage, COD thresholds and installation windows are illustrative. Verify real inventory, prices, fees and legal/tax language before launch.
- With no `MONGODB_URI`, catalogue pages can display the bundled demo data and checkout quotes can be previewed, but order reservation and account/admin persistence require MongoDB.
- Online payment remains disabled until Razorpay credentials are configured. Use test keys and test instruments first.
- The local demo admin defaults to `admin@riddhy.in` / `RiddhyDemo!2026`. Change these before sharing the project.
- Warranty extension requests create a saved request/quote only. The extension is **not active** until a production quote, terms acceptance and payment/activation workflow is implemented.
- Reservation expiry is enforced atomically when a quote, reservation or payment-order request runs. Configure a periodic worker/cron to sweep idle reservations if timely stock recovery is required during low traffic.
- Contact details, GSTIN, privacy/consent, tax calculation, invoice wording, returns, warranty coverage, service SLAs and installation availability require business/legal review.

## 7. Testing and smoke checks

### Source asset check

```bash
npm run assets:check
```

This validates generated SVG manifest paths and aggregate source image size.

### Build and route check (run in your configured environment)

```bash
npm run build
```

Then exercise these flows manually in the browser:

1. **Responsive storefront:** `/`, `/furniture`, `/appliances`, `/rooms/living`, `/search?q=sofa`, `/offers`, `/about`, `/faq`, `/contact`, `/bulk-enquiry` at wide and narrow viewport sizes.
2. **Catalogue:** open a product, inspect dimensions/specifications, gallery, variants, warranty and serviceability; test comparison with up to four items and the 3D viewer/fallback.
3. **Cart:** add/remove/change quantity, reload the page, verify local-storage persistence, wishlist, compare list and cart totals.
4. **Server quote:** use `110001` (sample serviceable) and a non-covered pincode; try `RIDDHY500` or `WELCOME10` on an eligible basket; compare the server quote with the checkout summary.
5. **Checkout/COD:** with MongoDB replica set seeded, submit a valid delivery address and confirm that a COD order is persisted, stock is reduced once and the result page can look up the order by email.
6. **Online payment:** with Razorpay test keys and webhook configured, verify the provider order, signature, amount, idempotent webhook handling and unpaid behavior after dismiss/failure.
7. **Account:** register/sign in, update profile, save an address, view order/invoice, register an eligible product, submit a claim (Cloudinary optional), request an extension, installation slot and return.
8. **Admin:** sign in using the seeded demo admin, inspect catalogue/orders/CMS/promotions/reports/enquiries, change a record, and confirm role checks/audit logs.
9. **Accessibility/performance:** keyboard-only navigation, visible focus, skip link, reduced-motion preference, Lite mode, no-WebGL fallback, touch-size controls and a screen-reader pass.

Rate limiting currently uses an in-memory map per server process; deploy behind a shared Redis/Upstash-backed limiter (or equivalent) for multi-instance production. There is no automated test suite or lint command configured. Builds, real payment tests and browser checks remain unexecuted in this source-only handoff.

## 8. Deployment notes

### Vercel

Deploy as a Next.js application, then configure environment variables in the Vercel project. Use MongoDB Atlas configured for transactions, a strong `JWT_SECRET`, the correct `NEXT_PUBLIC_SITE_URL`, Razorpay production keys/webhook secret, Cloudinary and SMTP. Set a stable webhook origin and confirm that route handlers can access the production database. Do not use local MongoDB or demo administrator credentials in production.

### Docker / self-hosted

The included Dockerfile builds Next.js in standalone mode. Compose is suitable for a local demonstration only. A production self-hosted deployment should use managed or hardened MongoDB with backups, TLS/ACME on Traefik, restricted dashboard access, rate limiting/WAF, secure secrets, error reporting, uptime alerts, automated reservation cleanup and a documented recovery process.
