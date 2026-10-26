# Installation and restoration

**Current site: MySQL.** Use `dist/forgeline-mysql-handover.zip` and [MYSQL-HANDOVER.md](MYSQL-HANDOVER.md) for current installation/import steps. `npm start` resumes the configured MySQL site in `mysql-wordpress/`. The SQLite instructions below are retained for the earlier rollback package; use `npm run start:sqlite` explicitly for that preview.

## Local continuation

The existing `wordpress/` folder is the earlier saved SQLite site. Run `npm ci` and `npm run start:sqlite` from the project folder to open that rollback copy. The active MySQL site uses the separate `mysql-wordpress/` folder. Keep the rollback database until the current MySQL backup has been delivered and verified.

## Portable snapshot

`dist/forgeline-steel-site.zip` is a Playground snapshot. Restore it through WordPress Playground's **New → Import zip** workflow, or use the supplied local restoration script. A snapshot carries the site state; the original Blueprint/setup alone does not carry subsequent edits.

To make a separate local copy without modifying the working site:

```powershell
node scripts/restore-test.mjs
```

The restoration test uses port 9401 and a separate `restore-test/` directory. The script prints the test outcome and then stops its test server. The credentials remain those in `runtime/LOCAL-ACCESS.txt`.

## Conventional WordPress hosting

A Playground SQLite snapshot is not a MySQL SQL dump. For a normal host, install WordPress through the hosting provider and use the content/source migration route below; do not upload its SQLite `db.php` drop-in into an unrelated MySQL installation.

1. Install the supplied `hubsteel.zip` parent, `forgeline-steel-child.zip`, Elementor, Redux Framework, Case Addons, and `forgeline-site-tools.zip`.
2. Activate the ForgeLine child theme and required plugins. Test the installed versions together before launch.
3. Import `forgeline-content.xml` using WordPress Importer with attachment downloading enabled while the source site is reachable, or migrate the supplied media files and remap attachment URLs. A local `127.0.0.1` URL will not be reachable by a remote host. The handover source includes all six images to upload manually if needed.
4. Import the exported Elementor templates and apply the main page content as needed. Keep service/project hierarchy and link paths consistent with the supplied site.
5. Choose Home as the static front page under Settings → Reading; set the permalinks to Post name; assign the WordPress navigation; select shared header/footer template IDs in Settings → ForgeLine handover.
6. Apply the global colors and fonts from the editing guide. Change old domain URLs with an Elementor-aware migration tool or Elementor's Replace URL tool, then regenerate Elementor CSS/Data. Do not use blind text replacement in serialized database data.
7. Replace fictional contact information and portfolio content, configure email, verify license/updates, and test all page links, media, forms, mobile layouts, and keyboard navigation.

For an automatic initial setup on a **fresh** conventional WordPress installation with WP-CLI, install/activate the listed theme and plugins, keep the plugin's bundled `seed/` folder in place, then run `wp eval-file /absolute/path/to/scripts/setup-site.php --user=1`. WP-CLI supplies the host's WordPress context. This creates media, pages, editable templates, menus, global settings, and the static front page with destination URLs. It is an alternative to manual WXR/template import. Back up first and use it only on a fresh destination: the seed creates the assignment content and replaces matching page slugs. It is not a public web installer. Once seeded, its version guard preserves later edits.

## Public launch details

The local site is set to discourage search indexing. Remove that setting only after the public domain, verified business copy, privacy information, SMTP, backups, HTTPS, and destination-host testing are ready. This project does not publish to a domain or purchase hosting.
