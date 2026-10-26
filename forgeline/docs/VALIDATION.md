# ForgeLine Steel validation

## Current MySQL migration

On 26 October 2026 the active site migrated to native MySQL Community Server 8.4.13 on loopback port 9336. WordPress confirmed standard `wpdb` / `mysqli`, no SQLite drop-in, 13 pages, and five private enquiries. Every value across 13 source tables matched using SHA-256 row comparisons before first boot. The migrated site passed all 13 route, 57 asset, and four enquiry-form checks. Current reports and the SQL export are under `dist/mysql/`; current handover is `dist/forgeline-mysql-handover.zip`. The earlier SQLite snapshot and its restoration report remain rollback artifacts.

Validated locally on 26 October 2026. The site uses WordPress **7.1.3**, PHP **8.3.33**, Elementor **4.3.5**, the supplied Hubsteel **1.0.1** parent, and ForgeLine child theme **1.0.0**. Exact machine-readable versions are in `dist/versions.json`.

## Automated checks

- All **13 pages** returned HTTP 200, contained one H1, included a meta description, and rendered without PHP warnings.
- All **57 unique referenced image, CSS, and JavaScript assets** returned HTTP 200.
- Internal content links passed. A nonexistent page returned a genuine HTTP 404 and the custom ForgeLine error page.
- The enquiry endpoint rejected an invalid nonce and invalid fields, saved a valid local sample, and rate-limited an immediate repeat.
- The automated validation sample was verified in the WordPress database, then removed. The five separately requested, clearly labelled dummy enquiries remain in the dashboard and refreshed handover snapshot.
- Enquiries are non-public and dashboard access requires `manage_options`.
- All 13 pages and five shared/reusable templates contain saved Elementor builder data.

Full results are in `dist/verification.json`. Checks cover functionality and structural integrity; they are not a complete security or accessibility certification.

## Browser inspection

- Inspected Home, About Us, Services, Projects, and Contact in the real local WordPress site.
- Opened Home in Elementor and selected the hero heading. The native Title, HTML Tag, Style, and Advanced editing controls were available.
- Verified the Structural project filter shows only The Foundry Works, and All projects restores the full portfolio.
- Verified mobile menu expansion and Escape-to-close behavior.
- Checked representative layouts at **390 px**, **768 px**, and **1440 px** viewport widths. No horizontal document overflow was observed in the checked contact, services, and projects views.
- Inspected the mobile form: labels and controls fit within the viewport.
- Decorative motion uses CSS keyframes/transitions with a reduced-motion rule and a JavaScript media-query guard. Core content remains visible without JavaScript. The visitor's Pause motion control stops the hero and particles and reveals any pending content.
- Inspected the refreshed design at 1440 px and 390 px: no horizontal overflow on Home or Contact. Confirmed hero/spark animation names, scroll-reveal activation, sticky header state, mobile navigation, and Pause/Play state changes in the real browser. No browser console errors were reported during this inspection. The system reduced-motion fallback was reviewed in source; an OS preference change was not emulated.

Screenshots in `dist/screenshots/` include the desktop home, capability section, mobile form, and Elementor editing controls.

## Restoration and import

Extracted `forgeline-steel-site.zip` into an isolated directory and booted it on local port 9401. Restored eight representative routes successfully, checked that all 18 editable documents survived, and imported a reusable service-card JSON through Elementor's own local-template importer. The test server was stopped afterward; the original site remains on port 9400.

Full results are in `dist/restoration-test.json`. The snapshot uses SQLite and is directly suited to Playground restoration. A conventional MySQL host needs the documented content/source migration route or the supplied fresh-install seed through WP-CLI.

## Performance limits

Photography is resized and bundled locally. Fonts are local. Decorative JavaScript is small and does not require the theme's GSAP/smooth-scroll effects. Unused parent-theme JavaScript handles are dequeued by the child theme.

Hubsteel's original stylesheet remains approximately **1.59 MB uncompressed**. The local Playground runtime serves requests more slowly than a typical optimized production server, so local response timings are not production Core Web Vitals. No public Lighthouse score or real-user performance claim is made for this local site. On the destination host, enable response compression/caching and assess representative mobile pages after deployment.

## Implementation repairs

The initial setup uncovered three vendor/runtime issues: Case Addons widget classes had not been generated; a fresh Hubsteel Redux gradient option was absent; and Elementor's CSS directory cache became stale after a flush. The setup script generates the widget classes, the child supplies safe option defaults, and the final CSS is explicitly regenerated with the upload directory present. The supplied Hubsteel parent files remain unmodified.

## Remaining launch configuration

The assignment site is complete locally. Public launch requires verified company/contact information, real project photography/content if representing a real company, a valid theme license for the destination, SMTP and a tested notification recipient, updated privacy information, and destination-host checks. Email notifications remain off in the delivered demonstration.
