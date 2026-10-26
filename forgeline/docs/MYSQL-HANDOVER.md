# ForgeLine Steel — MySQL handover

The active local site now uses **MySQL Community Server 8.4.13**, a real MySQL server bound to `127.0.0.1:9336`. WordPress connects using its standard `wpdb` / `mysqli` driver. SQLite integration is disabled. The earlier SQLite backup is retained only as a rollback copy.

## Give your friend this package

Use `dist/forgeline-mysql-handover.zip`. It includes a complete WordPress folder, the real `mysqldump` database export, media, the installed Hubsteel parent/child themes and plugins, 18 editable Elementor page/template exports, custom source, editing instructions, and the local WordPress login in a separate private text file. The five dummy enquiries are included. Share the package privately. The site's demonstration login and any theme/font license restrictions still apply. The GitHub source alone is not a complete running MySQL site.

## Restore on XAMPP, Laragon, or WordPress hosting

1. Extract the package. Put the contents of `wordpress/` in the destination web root.
2. Create an empty MySQL database and a database user with access to that database.
3. Import `database/forgeline-steel.sql` using phpMyAdmin or the MySQL client. Do not import over an existing site.
4. Copy `wp-config-sample.php` to `wp-config.php`. Set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_HOST` to the destination values. Keep the `wp_` table prefix, use `utf8mb4`, and generate fresh WordPress salts. The running local database password is deliberately excluded from this package.
5. With WP-CLI, replace the original URL safely in serialized Elementor data:

   `wp search-replace 'http://127.0.0.1:9400' 'https://your-destination.example' --all-tables-with-prefix --precise --skip-columns=guid`

   Use the actual local or public destination URL. If WP-CLI is unavailable, use a WordPress migration tool that supports serialized data. A plain text SQL replacement can corrupt Elementor settings.
6. Log in with the private WordPress account details. Save **Settings → Permalinks**, then use **Elementor → Tools → Regenerate CSS & Data**. Check Home, Contact, media, mobile navigation, template editing, and a fresh enquiry in **Project enquiries**.
7. Configure real company/contact information and SMTP before public launch. Keep database exports, credentials, and this package outside the public web root.

## Current computer

The active files are in `mysql-wordpress/`. Run `npm start` from the `forgeline/` folder; this resumes the project-local MySQL server and the existing PHP WebAssembly runtime at `http://127.0.0.1:9400/`. The PHP runtime is portable; the database is native MySQL, not SQLite or a database simulation. No Windows service is installed. Local database credentials and data live only under the ignored `runtime/native/` directory.

Run `npm run export:mysql` after edits to refresh the SQL and MySQL handover. The older `scripts/export.mjs`, `scripts/restore-test.mjs`, and `forgeline-steel-handover.zip` describe the retained SQLite rollback package; do not use them as the current MySQL handover. `npm run start:sqlite` explicitly opens that old preview and must not run at the same time as the current site.

## Migration verification

All values across the original 13 WordPress tables matched MySQL using SHA-256 row comparisons before the first WordPress boot. WordPress reported MySQL `8.4.13`, `mysqli=true`, `wpdb`, no SQLite drop-in, 13 published pages, and five private enquiries. All 13 pages, 57 assets, and four form checks passed. The real SQL dump was imported into a separate empty MySQL database and all 13 restored tables matched the active site. Database and restoration reports accompany the SQL export. Site/form checks are recorded in `mysql-validation.json`; the migrated homepage was also inspected in the browser.
