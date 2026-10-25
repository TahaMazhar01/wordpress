# Editing ForgeLine Steel

## Text and images

1. Sign in at `/wp-admin/` using `runtime/LOCAL-ACCESS.txt`.
2. Open **Pages → All Pages** and choose **Edit with Elementor**.
3. Click a heading, paragraph, image, or button. Change it in Elementor's left panel.
4. Use the responsive device preview to check desktop, tablet, and mobile.
5. Select **Publish/Update** to save.

Each main section is a Container. Use Elementor's Structure/Navigator panel to select nested containers. Page copy is not flattened into screenshots or embedded in a whole-page HTML block.

Select an image to replace it through the Media Library. Fill in meaningful alt text. Use appropriately cropped images rather than huge original uploads. The welding hero is an image widget placed behind the headline; select it through the Navigator if it is hard to click.

## Shared header and footer

Open **Templates → Saved Templates** and edit **ForgeLine / Site Header** or **ForgeLine / Site Footer** with Elementor. The toolbar also has **Edit Header** and **Edit Footer** links for administrators.

The header uses an image widget for the editable logo, a shortcode widget that renders the WordPress navigation, and a button widget. Change menu items in **Appearance → Menus → ForgeLine / Main Navigation**. The child theme manages the mobile menu interaction and keyboard behavior.

To select different shared templates, use **Settings → ForgeLine handover**. These are saved sections rendered by the child theme; Elementor Pro's Theme Builder is not needed.

## Global design and source

In Elementor, open **Site Settings → Global Colors**. Primary is ink, Secondary is warm white, Text is gray, and Accent is orange. The child stylesheet reads these global values. Check color contrast after changes.

Local Satoshi and Clash Grotesk font files are bundled from the supplied parent package. Font rules and responsive design defaults are in `theme/assets/forgeline.css`. Individual Elementor typography controls can be used for local changes; use the child stylesheet for coordinated structural changes. Motion and interaction source is `theme/assets/forgeline.js`. Reduced-motion preferences disable decorative motion.

## Services and projects

Service pages sit beneath **Services & Products** and project pages beneath **Projects** in the WordPress page hierarchy. Duplicate a detail page or insert the supplied reusable card/CTA templates to extend the site. Edit each card's image, text, and link separately.

Project category filters use the card container classes `fl-category-structural`, `fl-category-architectural`, or `fl-category-fabrication`. Set these in the container's **Advanced → CSS Classes**. Keep `fl-project-card` on project cards and `fl-project-grid` on their parent. Project labels and thumbnails remain editable widgets.

All current project studies are fictional. Replace them with verified case studies and licensed photography before presenting the site as a real operating company.

## Enquiry form

Select **ForgeLine Project Enquiry** in the Contact page to edit its title and button text. Field markup, service choices, validation, storage, and status messages are in the `plugin/` source. These files are supplied and can be changed by a developer.

Successful form submissions appear in **Project enquiries**. The recipient setting is empty, so the demonstration stores submissions without claiming to email them. To enable notifications, configure a real address in **Settings → ForgeLine handover**, configure SMTP on the destination host, and test actual receipt. A successful `wp_mail()` handoff does not itself prove inbox delivery.

Only administrators should have access to the stored enquiries. Delete test submissions when finished. For a public site, decide and document a retention period, arrange data-access/deletion handling, and replace the demonstration privacy notice with the real business details.

## Export after edits

Use **Templates → Saved Templates → Export Template** to download individual Elementor JSON files. Site kit export availability depends on the Elementor plan/version. Keep the WordPress backup as well: JSON alone does not include the full database, media, child theme, menu settings, or custom form code.

For this project's local environment, run `node scripts/export.mjs` while the development server is running to refresh the content exports and portable snapshot. Import-test the result before handing it over.
