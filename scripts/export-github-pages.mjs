import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const clientRoot = join(projectRoot, "dist", "client");
const sourceRoot = join(projectRoot, "static-src");
const assetsRoot = join(projectRoot, "assets");
const siteUrl = "https://hawkfranklin-research.github.io/ds-cinema.github.io";

const pages = [
  { route: "/", output: "index.html", root: "./", page: "home" },
  { route: "/shop", output: "shop/index.html", root: "../", page: "shop" },
  { route: "/shop/creator-air", output: "shop/creator-air/index.html", root: "../../", page: "product", slug: "creator-air", price: 49900 },
  { route: "/shop/creator-air-pro", output: "shop/creator-air-pro/index.html", root: "../../", page: "product", slug: "creator-air-pro", price: 79900 },
  { route: "/checkout/creator-air", output: "checkout/creator-air/index.html", root: "../../", page: "checkout", slug: "creator-air", price: 49900 },
  { route: "/checkout/creator-air-pro", output: "checkout/creator-air-pro/index.html", root: "../../", page: "checkout", slug: "creator-air-pro", price: 79900 },
  { route: "/account", output: "account/index.html", root: "../", page: "account" },
];

const exportPort = process.env.DS_CINEMA_EXPORT_PORT || "4174";
const externalOrigin = process.env.DS_CINEMA_EXPORT_ORIGIN;
const server = externalOrigin
  ? null
  : spawn("npm", ["run", "dev", "--", "--port", exportPort], {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
const origin = externalOrigin || `http://localhost:${exportPort}`;

try {
  if (server) await waitForServer(origin, server);
  await mkdir(assetsRoot, { recursive: true });
  await copyStaticAssets();

  for (const page of pages) {
    const response = await fetch(`${origin}${page.route}`, {
      headers: {
        accept: "text/html",
        "oai-authenticated-user-email": "preview@dscinema.example",
        "oai-authenticated-user-full-name": "Static%20Preview",
        "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
      },
    });

    if (!response.ok) {
      throw new Error(`Could not render ${page.route}: HTTP ${response.status}`);
    }

    const html = sanitize(await response.text(), page);
    const outputPath = join(projectRoot, page.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
  }

  await writeFile(join(projectRoot, ".nojekyll"), "");
  await writeFile(join(projectRoot, "404.html"), notFoundPage());

  console.log(`Exported ${pages.length} static pages for GitHub Pages.`);
} finally {
  server?.kill("SIGTERM");
}

async function copyStaticAssets() {
  const assetFiles = await readdir(join(clientRoot, "assets"));
  const cssFile = assetFiles.find((name) => name.endsWith(".css"));
  if (!cssFile) throw new Error("The production stylesheet was not found.");

  const compiledCss = await readFile(join(clientRoot, "assets", cssFile), "utf8");
  const fontCss = `
@font-face{font-family:'Geist';font-style:normal;font-weight:100 900;font-display:swap;src:url('./fonts/geist.woff2') format('woff2')}
@font-face{font-family:'Geist Mono';font-style:normal;font-weight:100 900;font-display:swap;src:url('./fonts/geist-mono.woff2') format('woff2')}
:root{--font-geist-sans:'Geist';--font-geist-mono:'Geist Mono'}
`;

  await writeFile(join(assetsRoot, "styles.css"), `${fontCss}${compiledCss}`);
  await cp(join(sourceRoot, "site.js"), join(assetsRoot, "site.js"));
  await cp(join(clientRoot, "favicon.svg"), join(assetsRoot, "favicon.svg"));
  await cp(join(clientRoot, "og.png"), join(assetsRoot, "og.png"));
  await mkdir(join(assetsRoot, "fonts"), { recursive: true });
  await cp(
    join(clientRoot, "assets", "_vinext_fonts", "geist-8ac0455e797f", "geist-98bbbccb.woff2"),
    join(assetsRoot, "fonts", "geist.woff2"),
  );
  await cp(
    join(clientRoot, "assets", "_vinext_fonts", "geist-mono-00e989178794", "geist-mono-013b2f2f.woff2"),
    join(assetsRoot, "fonts", "geist-mono.woff2"),
  );
}

function sanitize(input, page) {
  let html = input
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["'](?:modulepreload|preload|stylesheet|icon|shortcut icon)["'])[^>]*>/gi, "")
    .replace(/ class="__variable_[^"]+"/, "")
    .replace(
      '<html lang="en">',
      `<html lang="en" data-static-root="${page.root}" data-page="${page.page}"${page.slug ? ` data-product="${page.slug}" data-base-price="${page.price}"` : ""}>`,
    )
    .replaceAll("https://dscinema.github.io/og.png", `${siteUrl}/assets/og.png`)
    .replaceAll("https://dscinema.github.io/favicon.svg", `${page.root}assets/favicon.svg`)
    .replace(
      "Signed in as <b>preview@dscinema.example</b>",
      "Static preview · Firebase sign-in will be connected before launch",
    );

  html = html.replace(/href="(\/[^"]*)"/g, (_, target) => `href="${staticHref(target, page.root)}"`);
  html = html.replace(
    "</head>",
    `<link rel="icon" href="${page.root}assets/favicon.svg"><link rel="stylesheet" href="${page.root}assets/styles.css"><script defer src="${page.root}assets/site.js"></script></head>`,
  );

  html = html.replace(/[ \t]+$/gm, "");

  return `${html.trim()}\n`;
}

function staticHref(target, root) {
  const [pathWithQuery, hash = ""] = target.split("#");
  const [path, query = ""] = pathWithQuery.split("?");
  let destination;

  if (path === "/") destination = "index.html";
  else if (path === "/shop") destination = "shop/";
  else if (path === "/account") destination = "account/";
  else if (/^\/(?:shop|checkout)\/[^/]+$/.test(path)) destination = `${path.slice(1)}/`;
  else if (/^\/(?:signin-with-chatgpt|signout-with-chatgpt|callback)/.test(path)) destination = "account/";
  else destination = path.replace(/^\//, "");

  return `${root}${destination}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function notFoundPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — DS Cinema</title><link rel="icon" href="./assets/favicon.svg"><link rel="stylesheet" href="./assets/styles.css"></head>
<body><main class="store-shell"><header class="store-header"><a class="brand" href="./"><span class="brand-mark">DS</span><span>cinema</span></a></header><section class="account-heading"><p class="section-kicker">404 / Flight path unavailable</p><h1>That route<br>is out of range.</h1><p><a class="configure-button" href="./">Return to DS Cinema <span>↗</span></a></p></section></main></body></html>\n`;
}

async function waitForServer(serverOrigin, child) {
  const deadline = Date.now() + 20_000;
  let diagnostics = "";
  child.stdout.on("data", (chunk) => { diagnostics += chunk; });
  child.stderr.on("data", (chunk) => { diagnostics += chunk; });

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Static export server stopped unexpectedly.\n${diagnostics}`);
    }
    try {
      const response = await fetch(serverOrigin, { headers: { accept: "text/html" } });
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for the static export server.\n${diagnostics}`);
}
