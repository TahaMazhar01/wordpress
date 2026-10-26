import {runCLI} from '@wp-playground/cli';
import {readFile,writeFile,mkdir,stat,cp,readdir,rename} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import {root} from './local-runtime.mjs';
import './start-mysql.mjs';
const site=path.join(root,'mysql-wordpress');
const access=JSON.parse(await readFile(path.join(root,'runtime/native/mysql-access.json'),'utf8'));
if(!(await stat(path.join(site,'wp-config.php')).catch(()=>null))){
 await mkdir(site,{recursive:true});
 await cp(path.join(root,'wordpress'),site,{recursive:true,filter:src=>!src.startsWith(path.join(root,'wordpress/wp-content/database'))&&!['wp-config.php','debug.log','forgeline-content.xml','forgeline-export.json'].includes(path.basename(src))});
 const salts=['AUTH_KEY','SECURE_AUTH_KEY','LOGGED_IN_KEY','NONCE_KEY','AUTH_SALT','SECURE_AUTH_SALT','LOGGED_IN_SALT','NONCE_SALT'].map(k=>`define('${k}','${randomBytes(48).toString('hex')}');`).join('\n');
 await writeFile(path.join(site,'wp-config.php'),`<?php\ndefine('DB_NAME','${access.database}');\ndefine('DB_USER','${access.user}');\ndefine('DB_PASSWORD','${access.password}');\ndefine('DB_HOST','127.0.0.1:${access.port}');\ndefine('DB_CHARSET','utf8mb4');\ndefine('DB_COLLATE','');\n$table_prefix='wp_';\n${salts}\ndefine('WP_DEBUG',false);\ndefine('WP_DEBUG_DISPLAY',false);\ndefine('DISABLE_WP_CRON',true);\nif(!defined('ABSPATH'))define('ABSPATH',__DIR__.'/');\nrequire_once ABSPATH.'wp-settings.php';\n`);
}
const server=await runCLI({command:'server',port:9400,'site-url':'http://127.0.0.1:9400',wp:'latest',php:'8.3',workers:2,skipSqliteSetup:true,blueprint:{features:{networking:true},steps:[]},'mount-before-install':[{hostPath:site,vfsPath:'/wordpress'}],wordpressInstallMode:'do-not-attempt-installing'});
await new Promise((resolve,reject)=>{server.server.close(e=>e?reject(e):resolve());server.server.closeAllConnections();});
await new Promise((resolve,reject)=>server.server.listen(9400,'127.0.0.1',resolve).once('error',reject));
console.log('FORGELINE_MYSQL_READY http://127.0.0.1:9400/');
let busy=false;
setInterval(async()=>{
 if(busy)return;busy=true;
 try{for(const job of (await readdir(path.join(root,'runtime'))).filter(n=>n.endsWith('.php-job'))){
  const file=path.join(root,'runtime',job);
  try{const r=await server.playground.run({code:await readFile(file,'utf8')});await writeFile(file+'.result.json',JSON.stringify({httpStatusCode:r.httpStatusCode,exitCode:r.exitCode,errors:r.errors,text:new TextDecoder().decode(r.bytes)}));}
  catch(error){await writeFile(file+'.result.json',JSON.stringify({error:String(error)}));}
  await rename(file,file+'.done');
 }}finally{busy=false;}
},500).unref();
process.on('SIGINT',async()=>{await server[Symbol.asyncDispose]();process.exit(0)});
