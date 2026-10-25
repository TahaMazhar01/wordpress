# ForgeLine Steel — editable WordPress business website

A complete coursework business website built using the supplied **Hubsteel** parent theme, a custom **ForgeLine Steel** child theme, and **Elementor**. The five main assignment pages are Home, About Us, Services & Products, Projects, and Contact Us. Four service pages, three concept project pages, and a privacy/credits page complete the site.

## Run locally

Requirements: Node.js 20.18+ and an internet connection for the initial dependency/WordPress downloads.

Place your separately licensed Hubsteel package in `Hubsteel_FullPackage/` beside this README before building. The expected files are `Theme Install/hubsteel.zip` and `Plugins/case-addons.zip`. Purchased third-party packages are kept local and are not distributed in this repository.

The supplied font license also restricts redistribution. Font binaries and the generated child-theme ZIP containing them are excluded from Git; `npm run build` reconstructs these locally from your theme package.

```sh
cd forgeline
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:9400/**. WordPress Playground provides PHP and SQLite, so a separate PHP, MySQL, or Docker installation is not required. The first run downloads official Elementor/Redux plugin packages and WordPress core, creates all content, and generates a local administrator password. Dashboard credentials are written to the ignored `forgeline/runtime/LOCAL-ACCESS.txt` file.

Subsequent starts resume the saved site. Local WordPress files/database live in the ignored `forgeline/wordpress/` folder. The development server binds to `127.0.0.1`.

## Editable content

- **13 Elementor pages** with native containers, headings, text, images, and buttons.
- **Five shared/reusable templates**, including the site header and footer.
- A WordPress menu, global color/font settings, responsive layouts, and reduced-motion support.
- Original editable SVG logo files and PNG exports.
- A custom enquiry widget that stores submissions privately in WordPress under **Project enquiries**.

Email notifications are disabled by default. Configure a recipient under **Settings → ForgeLine handover** and test mail delivery before enabling them. This fictional coursework company uses illustrative projects and demonstration contact details.

## Repository layout

| Path | Contents |
| --- | --- |
| `forgeline/theme/` | ForgeLine child-theme source |
| `forgeline/plugin/` | Enquiry widget, private storage, settings, and initial content seed |
| `forgeline/scripts/` | Build, local runtime, export, verification, and restoration tools |
| `forgeline/assets/` | Bundled illustrative photography |
| `forgeline/dist/elementor-templates/` | Exported editable pages and sections |
| `forgeline/dist/` | Custom plugin ZIP, identity, content export, and test reports; the child-theme ZIP is generated locally |
| `forgeline/docs/` | Editing, installation, asset credits, and validation |
| `Hubsteel_FullPackage/` (local only) | Your separately licensed parent-theme and companion-plugin installation resources |

Local databases, generated administrator credentials, downloaded vendor caches, `node_modules`, licensed theme/plugin packages, restricted font binaries, and full site/handover snapshots are intentionally excluded from Git. The public custom-plugin ZIP and Elementor exports contain no administrator login credentials.

## Validation and handover

The local build passed checks for 13 pages, 57 referenced assets, form validation/storage/rate limiting, responsive layouts, restoration of eight routes, and import of an exported Elementor template. See [validation](forgeline/docs/VALIDATION.md) for scope and limitations.

Use the [editing guide](forgeline/docs/EDITING-GUIDE.md) and [installation guide](forgeline/docs/INSTALLATION.md). While the local server is running, `node scripts/export.mjs` from `forgeline/` generates a private full-site snapshot and refreshes the exported templates. Keep snapshots outside public Git history because they contain account/database state.

Hubsteel and its companion plugin must be obtained separately under a suitable license. Verify that license for the destination site. Photo and font credits are in [asset credits](forgeline/docs/ASSET-CREDITS.md).
