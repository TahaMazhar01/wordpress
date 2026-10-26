import net from 'node:net';
import {spawn} from 'node:child_process';
import {open,stat} from 'node:fs/promises';
import path from 'node:path';
import {root} from './local-runtime.mjs';
const ready=()=>new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port:9336},()=>{s.destroy();resolve(true)});s.on('error',()=>resolve(false));});
if(!(await ready())){
 const native=path.join(root,'runtime/native');
 if(!(await stat(path.join(native,'mysql-access.json')).catch(()=>null)))throw Error('MySQL is not configured. See docs/MYSQL-HANDOVER.md; the original SQLite preview is available separately with npm run start:sqlite.');
 const log=await open(path.join(native,'mysql-process.log'),'a');
 const child=spawn(path.join(native,'mysql-package/mysql-8.4.13-winx64/bin/mysqld.exe'),['--defaults-file='+path.join(native,'mysql.ini')],{windowsHide:true,detached:true,stdio:['ignore',log.fd,log.fd]});
 child.on('error',e=>console.error(e.message));child.unref();await log.close();
 for(let i=0;i<120;i++){if(await ready())break;await new Promise(r=>setTimeout(r,500));}
 if(!(await ready()))throw Error('MySQL startup failed; inspect runtime/native/mysql-error.log.');
}
