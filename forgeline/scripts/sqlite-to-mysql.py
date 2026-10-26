"""Export persisted WordPress data using the SQLite adapter's original MySQL metadata.

Run against a quiet/stopped site. Does not modify the source database.
The SQL contains account hashes and form data; keep it private.
"""
import collections
import json
import hashlib
import pathlib
import sqlite3

root = pathlib.Path(__file__).resolve().parent.parent
paths = list((root / 'wordpress/wp-content/database').rglob('.ht.sqlite'))
if len(paths) != 1:
    raise SystemExit('Expected exactly one source database; select the source before exporting.')
db = sqlite3.connect(paths[0].resolve().as_uri() + '?mode=ro', uri=True)
db.row_factory = sqlite3.Row
db.execute('BEGIN')
out = root / 'dist/mysql'
out.mkdir(parents=True, exist_ok=True)
def ident(value):
    return '`' + value.replace('`', '``') + '`'
def literal(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bytes):
        return "X'" + value.hex() + "'"
    if isinstance(value, (int, float)):
        return str(value)
    return "X'" + str(value).encode('utf-8').hex() + "'"
tables = [dict(r) for r in db.execute("SELECT * FROM _wp_sqlite_mysql_information_schema_tables WHERE TABLE_NAME LIKE 'wp_%' ORDER BY TABLE_NAME")]
counts = {}
hash_checks = []
with (out / 'forgeline-steel.sql').open('w', encoding='utf-8', newline='\n') as f:
    f.write('-- Private ForgeLine Steel MySQL migration. Import into an EMPTY database.\nSET NAMES utf8mb4;\nSET SESSION sql_mode=\'NO_AUTO_VALUE_ON_ZERO\';\nSET FOREIGN_KEY_CHECKS=0;\n')
    for table in tables:
        name = table['TABLE_NAME']
        columns = [dict(r) for r in db.execute('SELECT * FROM _wp_sqlite_mysql_information_schema_columns WHERE TABLE_NAME=? ORDER BY ORDINAL_POSITION', (name,))]
        definitions = []
        for col in columns:
            definition = ident(col['COLUMN_NAME']) + ' ' + col['COLUMN_TYPE']
            if col['CHARACTER_SET_NAME']:
                definition += ' CHARACTER SET ' + col['CHARACTER_SET_NAME']
            if col['COLLATION_NAME']:
                definition += ' COLLATE ' + col['COLLATION_NAME']
            definition += ' NULL' if col['IS_NULLABLE'] == 'YES' else ' NOT NULL'
            if col['COLUMN_DEFAULT'] is not None:
                default = str(col['COLUMN_DEFAULT'])
                definition += ' DEFAULT ' + (default if default.upper() == 'CURRENT_TIMESTAMP' else "'" + default.replace('\\', '\\\\').replace("'", "''") + "'")
            if col['EXTRA']:
                definition += ' ' + col['EXTRA']
            definitions.append(definition)
        indexes = collections.defaultdict(list)
        for index in db.execute('SELECT * FROM _wp_sqlite_mysql_information_schema_statistics WHERE TABLE_NAME=? ORDER BY INDEX_NAME,SEQ_IN_INDEX', (name,)):
            indexes[index['INDEX_NAME']].append(dict(index))
        for key, parts in indexes.items():
            prefix = 'PRIMARY KEY' if key == 'PRIMARY' else ('UNIQUE KEY ' if not parts[0]['NON_UNIQUE'] else 'KEY ') + ident(key)
            fields = [ident(p['COLUMN_NAME']) + ('(' + str(p['SUB_PART']) + ')' if p['SUB_PART'] else '') for p in parts]
            definitions.append(prefix + ' (' + ','.join(fields) + ')')
        f.write('CREATE TABLE ' + ident(name) + ' (\n' + ',\n'.join(definitions) + '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=' + (table['TABLE_COLLATION'] or 'utf8mb4_unicode_ci') + ';\n')
        rows = list(db.execute('SELECT * FROM ' + ident(name)))
        counts[name] = len(rows)
        expected = sorted(hashlib.sha256('|'.join('NULL' if row[c['COLUMN_NAME']] is None else (row[c['COLUMN_NAME']] if isinstance(row[c['COLUMN_NAME']], bytes) else str(row[c['COLUMN_NAME']]).encode('utf-8')).hex().upper() for c in columns).encode('ascii')).hexdigest() for row in rows)
        expressions = ["IFNULL(HEX(CAST(" + ident(c['COLUMN_NAME']) + " AS CHAR CHARACTER SET utf8mb4)),'NULL')" for c in columns]
        query = "SELECT SHA2(CONCAT_WS('|'," + ','.join(expressions) + "),256) FROM " + ident(name) + ';'
        hash_checks.append({'table': name, 'query': query, 'hashes': expected})
        for row in rows:
            f.write('INSERT INTO ' + ident(name) + ' (' + ','.join(ident(c['COLUMN_NAME']) for c in columns) + ') VALUES (' + ','.join(literal(row[c['COLUMN_NAME']]) for c in columns) + ');\n')
    f.write('SET FOREIGN_KEY_CHECKS=1;\n')
report = {'source': 'SQLite snapshot', 'target': 'MySQL', 'tables': counts, 'pages': db.execute("SELECT count(*) FROM wp_posts WHERE post_type='page' AND post_status='publish'").fetchone()[0], 'editable_documents': db.execute("SELECT count(*) FROM wp_postmeta m JOIN wp_posts p ON p.ID=m.post_id WHERE m.meta_key='_elementor_edit_mode' AND m.meta_value='builder' AND p.post_type IN ('page','elementor_library') AND p.post_status='publish'").fetchone()[0], 'private_enquiries': db.execute("SELECT count(*) FROM wp_posts WHERE post_type='fl_enquiry' AND post_status='private'").fetchone()[0]}
(out / 'migration-source.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
(out / 'migration-hashes.json').write_text(json.dumps(hash_checks), encoding='utf-8')
print(json.dumps(report))
