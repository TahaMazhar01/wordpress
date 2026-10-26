import {mysql} from './import-mysql.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import path from 'node:path';
import {root} from './local-runtime.mjs';
const checks=JSON.parse(await readFile(path.join(root,'dist/mysql/migration-hashes.json'),'utf8'));
const results=[];
for(const check of checks){
 const output=(await mysql(check.query)).trim();
 const hashes=output?output.split(/\r?\n/).sort():[];
 const passed=isDeepStrictEqual(hashes,check.hashes);
 results.push({table:check.table,rows:hashes.length,all_values_match:passed});
 if(!passed)throw Error('MySQL data mismatch: '+check.table);
}
const report={engine:(await mysql('SELECT VERSION();')).trim(),passed:true,tables:results};
await writeFile(path.join(root,'dist/mysql/migration-verification.json'),JSON.stringify(report,null,2));
console.log('MySQL '+report.engine+': every value matches the SQLite source across '+results.length+' tables.');
