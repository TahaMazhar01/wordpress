# ForgeLine Steel — editable WordPress handover

ForgeLine Steel is a fictional steel fabrication business built for the Hub Steel theme assignment. This project contains a real WordPress site using the supplied **Hubsteel** parent, a **ForgeLine Steel** child theme, and **Elementor** page content.

## Open the site

From this folder, run:

```powershell
npm ci
npm start
```

Visit **http://127.0.0.1:9400/**. Dashboard credentials are in `runtime/LOCAL-ACCESS.txt`. The server is a local development tool; keep it bound to the local computer. The `wordpress/` directory persists edits and the SQLite database between restarts. Stop the server with Ctrl+C.

The first build uses official WordPress Playground and downloads WordPress core. Node.js 20.18+ is required. A prepared site snapshot is supplied in `dist/` after verification. The runtime and dependencies are development tools, not a production hosting stack.

## Deliverables

- `dist/forgeline-steel-site.zip` — full Playground snapshot, including WordPress files, uploads, plugins, theme, and SQLite database.
- `dist/forgeline-steel-handover.zip` — consolidated source, templates, documentation, identity, and installation resources.
- `dist/forgeline-steel-child.zip` — installable child theme; requires the supplied Hubsteel parent.
- `dist/forgeline-site-tools.zip` — installable enquiry widget and settings plugin.
- `dist/elementor-templates/` — exported pages and reusable sections, updated from the saved WordPress documents during handover export.
- `dist/forgeline-content.xml` — WordPress content export for a standard hosting migration; use with the supplied media and plugin/theme packages.
- `dist/forgeline-logo-dark.svg` and `dist/forgeline-logo-light.svg` — original editable vector identity.
- `docs/EDITING-GUIDE.md`, `docs/INSTALLATION.md`, `docs/ASSET-CREDITS.md`, and `docs/VALIDATION.md` — editing, installation, assets, and verification notes.

The source folders are `theme/`, `plugin/`, and `scripts/`. Keep them with the handover. The purchased parent theme is unchanged. No Elementor Pro subscription is required by these layouts.

## Page inventory

The five main pages are Home, About Us, Services & Products, Projects, and Contact Us. Four editable service pages and three editable fictional project studies provide working detail links. The privacy/credits page explains demonstration data handling and lists photo attribution.

All page sections use native Elementor containers and widgets. The enquiry form is a small custom Elementor widget supplied with source. The header and footer are shared Elementor saved templates rendered by the child theme. The WordPress menu remains editable through Appearance → Menus.

## Editing and rebuilding

For normal editing, use WordPress/Elementor. Edits are saved in the WordPress database. **Do not rebuild the site to change page text.**

`npm run build` regenerates distributable source packages from `scripts/content.mjs`, `theme/`, and `plugin/`. It does not import or overwrite an initialized WordPress database. The first seed is guarded by the `forgeline_seed_version` option. Editing generated JSON files alone does not change existing WordPress pages.

After editing theme/plugin source, synchronize the matching files into `wordpress/wp-content/` and refresh. After changing Elementor content, export again through WordPress or the provided export script so handover templates match the saved site.

## Enquiries

The form validates required fields and privacy acknowledgement, checks a WordPress nonce, includes a honeypot, and applies a short IP-hash rate limit. Successful submissions become private **Project enquiries** in the dashboard. Notifications are off by default; enable a real recipient in Settings → ForgeLine handover and configure/test SMTP before using email.

The `.example` email address is intentionally fictional. No live phone number, office address, certification, client endorsement, or completed commission is asserted. Replace the demonstration business information before a real public launch.

## Assignment checklist

| Requirement | Implementation |
| --- | --- |
| Professional company logo | Original F/flange mark and editable SVG wordmarks |
| Customize Hub Steel theme | Hubsteel parent with dedicated ForgeLine child theme |
| Replace default content | ForgeLine copy throughout; original sample posts removed from this new installation |
| Images, banners, services | Bundled industrial imagery, hero banner, service index and detail pages |
| Essential pages | All five required pages, with working navigation |
| Consistent professional appearance | Shared design system, typography, responsive layouts, restrained motion |
| Editable handover | Elementor pages/sections, shared templates, SVG source, child/plugin source, site snapshot, content export, and guide |
