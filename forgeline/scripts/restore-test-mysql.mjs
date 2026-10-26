import {mysql} from './import-mysql.mjs';
import {root} from './local-runtime.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import path from 'node:path';
const database='forgeline_restore_test_'+Date.now();
await mysql('CREATE DATABASE `'+database+'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;',false);
try{
 await mysql(await readFile(path.join(root,'dist/mysql/forgeline-steel.sql'),'utf8'),database);
 const checks=JSON.parse(await readFile(path.join(root,'dist/mysql/migration-hashes.json'),'utf8'));
 const results=[];
 for(const check of checks){
  const lines=output=>output.trim()?output.trim().split(/\r?\n/).sort():[];
  const source=lines(await mysql(check.query));
  const restored=lines(await mysql(check.query,database));
  if(!isDeepStrictEqual(source,restored))throw Error('Restored SQL differs from active MySQL table: '+check.table);
  results.push({table:check.table,rows:restored.length,all_values_match:true});
 }
 await writeFile(path.join(root,'dist/mysql/restoration-verification.json'),JSON.stringify({passed:true,method:'Real mysqldump imported into a separate empty MySQL database; every row compared with active site',tables:results},null,2));
 console.log('MySQL SQL restore passed: all 13 tables match the active site.');
}finally{
 // Only remove this script's newly created disposable database.
 await mysql('DROP DATABASE `'+database+'`;',false);
}
