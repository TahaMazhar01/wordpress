# Hubsteel business website: research and project audit

Date: 26 October 2026. Stage: analysis only; no theme, plugin, or site changes made.

## Assignment interpreted from the supplied screenshot

Build a complete business website using the provided Hub Steel WordPress theme. The six assessed requirements are a professional company logo; theme customization for the selected business; replacement of default content; relevant images, banners, and service descriptions; Home, About Us, Services/Products, Projects, and Contact Us pages; and a consistent, professional design.

The screenshot is reference material for the assignment. It does not authorize installing software, importing demo content, or publishing a website. The user's additional requirement is an editable handover so the recipient can change templates and content.

## What is actually in this project

- `Hubsteel_FullPackage/` contains the theme ZIP, Case Addons ZIP, Slider Revolution ZIP, documentation shortcut, and license files.
- `hubsteel-101/Hubsteel_FullPackage/` contains another copy of that package. Both theme ZIPs have the same SHA-256 hash.
- There are 16 files outside the ZIP archives. No company brief, custom logo, company copy, SQL database, WordPress installation, or exported completed site was found in this workspace.
- The theme identifies itself as **Hubsteel 1.0.1**. Its metadata says PHP 7.4 or higher and tested up to WordPress 6.4. These are package metadata, not evidence of compatibility with the versions we eventually install.
- The user confirmed that the assignment screenshot and this package are all the available details. There is no separate fellow's brief to recover here.

### Technical findings from the supplied ZIP

The theme uses Elementor and Case Addons. Its plugin registration also marks Redux Framework, Contact Form 7, Mailchimp for WP, WooCommerce, and Force Regenerate Thumbnails as required. Before installation, distinguish theme setup expectations from features this particular business website actually needs, and test dependencies rather than assuming every plugin is necessary on the finished site.

The theme includes Elementor widget templates for headings, buttons, galleries, counters, contact forms, and other sections. It includes GSAP, ScrollTrigger, parallax, and smooth-scroll libraries. Smooth scrolling is an available theme option; it need not be enabled to achieve a polished result.

The enqueued `assets/css/style.css` is **1,587,036 bytes uncompressed**. `assets/js/theme.js` is **60,630 bytes uncompressed**. GSAP is enqueued in the theme actions and registered separately for widgets, so check the final network requests for duplicate library loading. Archive sizes are not browser transfer sizes or measured loading times.

No separate child-theme ZIP appears in the supplied package. Plan to create a small child theme for any custom CSS/PHP/JavaScript. Leave the purchased parent theme intact.

The documentation shortcut points to [CaseThemes Hubsteel documentation](https://doc.casethemes.net/hubsteel/index.html); that page could not be retrieved during this review. The current [vendor listing](https://casethemes.net/product/hubsteel/) confirms Elementor support, but current marketing claims should not substitute for testing this older local ZIP.

## Website references inspected

These are selected examples relevant to an industrial business, not a claim that every modern website follows one style. Homepages were visually inspected in a desktop browser, including scrolling. A complete mobile, accessibility, or interaction audit of these third-party sites was outside this first pass.

| Reference | Visual and motion observations | What fits our project |
| --- | --- | --- |
| [MWDT](https://mwdtinc.com/) | Charcoal and white surfaces, oversized industrial typography, a prominent metal component, and a transition into capability content. Its creator describes a scroll-driven rotating 3D part. | A clear statement of what the company makes, strong industrial imagery, and a simple capability hierarchy. Use a lightweight image treatment unless 3D proves worthwhile. |
| [Viamaster International](https://www.viamaster-intl.com/) | Navy and orange identity, full-screen operational footage, oversized moving text, a clear Quick Quote button, team imagery, and service carousel controls. | A visible enquiry action, real business imagery where available, and reusable service sections. Keep the company message readable without waiting for motion. |
| [Terminal Industries](https://terminal-industries.com/) | Cinematic truck scene, floating navigation, lime accents, large text revealed through scrolling, followed by modular business content. | Strong section composition and a deliberate accent color. Reserve cinematic effects for a small area so they do not delay access to services and contact details. |

MWDT's [creator case study](https://kristopherray.com/projects/mwdt/) dates its full launch to September 2026 and identifies GSAP ScrollTrigger. Viamaster's [agency case study](https://www.bluestone98.com/work/viamaster/) identifies WordPress and a November 2025 Awwwards nomination. Terminal was inspected as a current live reference; its original launch year was not verified.

## Performance evidence

Mobile PageSpeed Insights runs were requested on 26 October 2026. These are single lab runs under simulated conditions, not a ranking of the websites or a measurement of our future site. Neither tested reference returned real-user field data in the report's initial field-data section.

| Reference | Performance | LCP | Total blocking time | Layout shift |
| --- | --- | --- | --- | --- |
| [Viamaster report](https://pagespeed.web.dev/analysis/https-www-viamaster-intl-com/6jk7tde6nu?form_factor=mobile) | 74/100 | 5.4 s | 0 ms | 0.009 |
| [MWDT report](https://pagespeed.web.dev/analysis/https-mwdtinc-com/vmnb74l21c?form_factor=mobile) | 74/100 | 4.6 s | 120 ms | 0.014 |

Viamaster's run used an emulated Moto G Power and slow 4G. The report flagged render-blocking requests with estimated savings of 2,210 ms and image-delivery savings of 826 KiB. These are diagnostic estimates, not guaranteed gains. Its low blocking time and layout shift show that the largest opportunity in this run is loading, rather than assuming all animation is the cause.

MWDT's run used the same simulated device/network profile. It flagged render-blocking requests with estimated savings of 2,870 ms, 74 KiB of unused JavaScript, and a total network payload of 4,299 KiB. Its loading result also misses the 2.5-second LCP target. No numerical performance score was collected for Terminal.

### Targets for our implementation

Use LCP at or below 2.5 seconds, INP at or below 200 ms, and CLS at or below 0.1 as field-performance targets, assessed at the 75th percentile when real-user data is available. These come from [Google's Web Vitals guidance](https://web.dev/articles/vitals). A Lighthouse score of 90+ on representative mobile pages is an initial lab goal, not a promised result. A lab TBT result is not a measured INP result.

Practical approach: responsive WebP/AVIF images; prioritize the hero image; lazy-load lower-page media; reserve image dimensions; use few font weights; cache and compress responses; keep plugins focused; avoid loading animation tools twice. Begin with a still hero image and add a short video only if it improves the design within the performance budget. Test Home, a service page, Projects, and Contact after content is populated.

## Proposed business and design direction

**Working concept, not yet selected by the user:** a fictional steel fabrication and engineering company. Suggested name: **ForgeLine Steel**. Confirm the final name before designing the logo or writing final company copy. Hubsteel is the theme's name, not a required company name.

Suggested palette: charcoal `#15191D`, warm white `#F5F3EE`, steel gray `#69747D`, and orange `#E86A24`. Check contrast in the actual combinations, especially small text and buttons. Use a bold heading family and readable body type, with consistent spacing and a restrained grid.

Suggested motion specification:

- Button and link responses around 150–220 ms.
- One-time section reveals around 400–600 ms, moving roughly 16–24 px.
- Small image hover effects, with equivalent keyboard focus feedback.
- Normal page scrolling; core copy visible without waiting through an effect.
- Reduced-motion support that removes decorative transforms and autoplay movement.
- No animation-dependent access to navigation, services, or the contact form.

These timings and design choices are recommendations for this assignment, not observations measured from the reference websites.

## Page and content plan

| Page | Planned sections |
| --- | --- |
| Home | Business promise, primary enquiry button, service overview, selected projects, process, company introduction, contact prompt. |
| About Us | Company story, approach, values, facilities/team imagery, quality process. |
| Services/Products | Structural fabrication, welding, custom metalwork, installation; reusable service detail layout with scope and enquiry action. Adjust this list to the chosen fictional business. |
| Projects | Project cards and a reusable detail layout: project type, brief, work delivered, gallery. Clearly identify invented coursework examples. |
| Contact Us | Editable contact details, working enquiry form, opening hours, relevant location information. Only embed a map when there is a valid location. |

Create an original editable vector logo and light/dark variations after the name is settled. Replace all demo text and imagery. Do not invent certifications, client endorsements, addresses, or years of experience as verified facts. Use clearly identified sample business information where the coursework needs fictional content.

## Editable handover plan

Build the principal page content with individual Elementor widgets and reusable sections. Avoid putting an entire page into a single HTML widget. Use global colors and typography; reuse the same header, footer, service, project, and contact components.

Deliver:

1. A restorable WordPress backup containing the database, uploads, theme customizations, and necessary configuration instructions.
2. Exported Elementor page/section templates, with an import test on a separate installation. Include a full site kit where the installed version and plan support the required options.
3. The custom child-theme source, plus any small supporting plugin if needed.
4. Editable logo SVGs, PNG exports, and source assets with an asset/license register.
5. A short editing guide for text, images, menus, services, projects, contact details, and global styles.
6. A dependency/version list and any license requirements. An Elementor JSON export alone is not a complete site backup and can still depend on Hubsteel/Case Addons widgets.

[Elementor's template documentation](https://elementor.com/help/template-library/) describes JSON/ZIP template imports and exports. Its [website export documentation](https://elementor.com/help/import-and-export-elementor-website-templates/) notes that export options depend on the subscription plan. Verify available options before promising a particular kit format.

## Build sequence and acceptance

Choose the company name and visual direction; prepare a local WordPress environment; install and test the supplied theme and its necessary dependencies; create the child theme; establish editable shared components; populate all five pages; verify responsive layouts, keyboard access, reduced motion, links, and actual form delivery; run performance checks; export and test the handover on a separate installation.

The analysis is complete with the available materials. The company name and execution environment remain implementation decisions. No running local or hosted WordPress site has been established by this analysis.
