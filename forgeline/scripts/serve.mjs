import {runCLI} from '@wp-playground/cli';
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {extractSnapshot} from './zip-fast.mjs';
const root=path.resolve(import.meta.dirname,'..');
await mkdir(path.join(root,'wordpress'),{recursive:true});
await mkdir(path.join(root,'runtime'),{recursive:true});
if(!(await stat(path.join(root,'wordpress/wp-config.php')).catch(()=>null)) && await stat(path.join(root,'dist/forgeline-steel-site.zip')).catch(()=>null)){
 console.log('Restoring the supplied completed WordPress snapshot.');
 await extractSnapshot(path.join(root,'dist/forgeline-steel-site.zip'),path.join(root,'wordpress'));
 await writeFile(path.join(root,'runtime/site-ready.json'),JSON.stringify({initialized:true,restored:true}));
}
const installed=!!(await stat(path.join(root,'wordpress/wp-config.php')).catch(()=>null));
const initialized=!!(await stat(path.join(root,'runtime/site-ready.json')).catch(()=>null));
const resource=async(file)=>({resource:'literal',name:path.basename(file),contents:new Uint8Array(await readFile(file))});
const steps=[];
if(!installed){
 if(!(await stat(path.join(root,'vendor/elementor.zip')).catch(()=>null)) || !(await stat(path.join(root,'vendor/redux-framework.zip')).catch(()=>null)))await import('./download.mjs');
 const original=!!(await stat(path.join(root,'original-package/hubsteel.zip')).catch(()=>null));
 steps.push({step:'installPlugin',pluginData:await resource(path.join(root,'vendor/elementor.zip')),options:{activate:true}});
 steps.push({step:'installPlugin',pluginData:await resource(path.join(root,'vendor/redux-framework.zip')),options:{activate:true}});
 steps.push({step:'installPlugin',pluginData:await resource(path.join(root,original?'original-package/case-addons.zip':'../Hubsteel_FullPackage/Plugins/case-addons.zip')),options:{activate:true}});
 steps.push({step:'installTheme',themeData:await resource(path.join(root,original?'original-package/hubsteel.zip':'../Hubsteel_FullPackage/Theme Install/hubsteel.zip')),options:{activate:false}});
 steps.push({step:'installTheme',themeData:await resource(path.join(root,'dist/forgeline-steel-child.zip')),options:{activate:true}});
 steps.push({step:'installPlugin',pluginData:await resource(path.join(root,'dist/forgeline-site-tools.zip')),options:{activate:true}});
}
if(!initialized){
 steps.push({step:'runPHP',code:await readFile(path.join(root,'scripts/setup-site.php'),'utf8')});
 const password=randomBytes(18).toString('base64url');
 steps.push({step:'runPHP',code:`<?php require '/wordpress/wp-load.php'; wp_set_password('${password}',1); echo 'Local administrator password set.';`});
 await writeFile(path.join(root,'runtime/LOCAL-ACCESS.txt'),`ForgeLine Steel local development\nURL: http://127.0.0.1:9400/\nDashboard: http://127.0.0.1:9400/wp-admin/\nUsername: admin\nPassword: ${password}\nLocal demonstration credentials. Change credentials on a destination host.\n`);
}
const blueprint={landingPage:'/',preferredVersions:{php:'8.3',wp:'latest'},constants:{WP_DEBUG:false,WP_DEBUG_LOG:true,WP_DEBUG_DISPLAY:false,DISABLE_WP_CRON:true},steps};
console.log(installed?'Resuming the saved WordPress site.':'Installing and building ForgeLine Steel.');
const server=await runCLI({command:'server',port:9400,'site-url':'http://127.0.0.1:9400',wp:'latest',php:'8.3',workers:2,blueprint,'mount-before-install':[{hostPath:path.join(root,'wordpress'),vfsPath:'/wordpress'}],wordpressInstallMode:installed?'do-not-attempt-installing':'download-and-install'}).catch(error=>{console.error(String(error.message).slice(0,5000));process.exit(1);});
// Playground's CLI listens on all interfaces by default. Keep this development
// site on loopback so the included demonstration is local to this computer.
await new Promise((resolve,reject)=>{server.server.close(error=>error?reject(error):resolve());server.server.closeAllConnections();});
await new Promise((resolve,reject)=>server.server.listen(9400,'127.0.0.1',resolve).once('error',reject));
await writeFile(path.join(root,'runtime/site-ready.json'),JSON.stringify({url:server.serverUrl,initialized:true}));
console.log('FORGELINE_SERVER_READY http://127.0.0.1:9400/');
// A local-only task file queue lets build/verification scripts use the real PHP runtime.
// It is not exposed through HTTP and cannot be invoked by website visitors.
let busy=false;
const fs=await import('node:fs/promises');
setInterval(async()=>{
 if(busy)return;busy=true;
 try{
  const jobs=(await fs.readdir(path.join(root,'runtime'))).filter(n=>n.endsWith('.php-job'));
  for(const job of jobs){
   const file=path.join(root,'runtime',job),code=await readFile(file,'utf8');
   try{const response=await server.playground.run({code});await writeFile(file+'.result.json',JSON.stringify({httpStatusCode:response.httpStatusCode,exitCode:response.exitCode,errors:response.errors,text:new TextDecoder().decode(response.bytes)}));}
   catch(error){await writeFile(file+'.result.json',JSON.stringify({error:String(error)}));}
   await fs.rename(file,file+'.done');
  }
 }finally{busy=false;}
},500).unref();
process.on('SIGINT',async()=>{await server[Symbol.asyncDispose]();process.exit(0);});
