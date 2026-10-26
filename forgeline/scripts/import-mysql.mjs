import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {root} from './local-runtime.mjs';
export async function mysql(sql,database=true){
 const native=path.join(root,'runtime/native');
 return await new Promise((resolve,reject)=>{
  const child=spawn(path.join(native,'mysql-package/mysql-8.4.13-winx64/bin/mysql.exe'),['--defaults-extra-file='+path.join(native,'mysql-client.cnf'),'--batch','--skip-column-names','--raw','--default-character-set=utf8mb4',...(database?[database===true?'forgeline_steel':database]:[])],{windowsHide:true});
  let output='',errors='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>errors+=d);child.on('error',reject);child.on('close',c=>c?reject(Error(errors)):resolve(output));child.stdin.end(sql);
 });
}
if(process.argv[1]===import.meta.filename){
 const existing=(await mysql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='forgeline_steel';",false)).trim();
 if(existing!=='0')throw Error('Refusing to import over an existing database.');
 await mysql(await readFile(path.join(root,'dist/mysql/forgeline-steel.sql'),'utf8'));
 console.log(await mysql("SELECT VERSION(); SELECT post_type,COUNT(*) FROM wp_posts WHERE post_status IN ('publish','private') GROUP BY post_type;"));
}
