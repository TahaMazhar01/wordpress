// Project-local MySQL; no Windows service or global configuration is changed.
import {readFile,writeFile,mkdir,stat,open} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import net from 'node:net';
import {root} from './local-runtime.mjs';
const native=path.join(root,'runtime/native'), base=path.join(native,'mysql-package/mysql-8.4.13-winx64');
const data=path.join(native,'mysql-data'), config=path.join(native,'mysql.ini');
if(await stat(path.join(data,'mysql')).catch(()=>null))throw Error('MySQL data already initialized. Use start-mysql.mjs to resume.');
await mkdir(data,{recursive:true});
const admin=randomBytes(24).toString('hex'),password=randomBytes(24).toString('hex');
await writeFile(path.join(native,'mysql-access.json'),JSON.stringify({host:'127.0.0.1',port:9336,database:'forgeline_steel',user:'forgeline',password,admin},null,2));
const slash=p=>p.replaceAll('\\','/');
await writeFile(config,`[mysqld]\nbasedir=${slash(base)}\ndatadir=${slash(data)}\nbind-address=127.0.0.1\nport=9336\nmysqlx=0\ncharacter-set-server=utf8mb4\ncollation-server=utf8mb4_unicode_520_ci\nlog-error=${slash(path.join(native,'mysql-error.log'))}\n`);
execFileSync(path.join(base,'bin/mysqld.exe'),['--defaults-file='+config,'--initialize-insecure'],{windowsHide:true,stdio:'pipe'});
const init=path.join(native,'mysql-init.sql');
await writeFile(init,`ALTER USER 'root'@'localhost' IDENTIFIED BY '${admin}';\nCREATE DATABASE forgeline_steel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;\nCREATE USER 'forgeline'@'127.0.0.1' IDENTIFIED BY '${password}';\nGRANT ALL PRIVILEGES ON forgeline_steel.* TO 'forgeline'@'127.0.0.1';\n`);
await writeFile(path.join(native,'mysql-client.cnf'),`[client]\nhost=127.0.0.1\nport=9336\nuser=root\npassword=${admin}\n`);
const log=await open(path.join(native,'mysql-process.log'),'a');
const child=spawn(path.join(base,'bin/mysqld.exe'),['--defaults-file='+config,'--init-file='+init],{windowsHide:true,detached:true,stdio:['ignore',log.fd,log.fd]});child.unref();await log.close();
for(let i=0;i<120;i++){
 const ready=await new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port:9336},()=>{s.destroy();resolve(true)});s.on('error',()=>resolve(false));});
 if(ready){console.log('MySQL listening on 127.0.0.1:9336. Credentials stored only in ignored runtime/native.');process.exit(0);}
 await new Promise(r=>setTimeout(r,500));
}
throw Error('MySQL startup timed out; inspect runtime/native/mysql-error.log.');
