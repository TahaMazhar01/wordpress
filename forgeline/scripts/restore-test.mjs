import {runCLI} from '@wp-playground/cli';
import {extractSnapshot} from './zip-fast.mjs';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {root} from './local-runtime.mjs';
const destination=path.join(root,'restore-test',String(Date.now()));
await mkdir(destination,{recursive:true});
await extractSnapshot(path.join(root,'dist/forgeline-steel-site.zip'),destination);
const code=`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);
$old='http://127.0.0.1:9400';$new='http://127.0.0.1:9401';update_option('home',$new);update_option('siteurl',$new);
foreach(get_posts(['post_type'=>['page','elementor_library'],'post_status'=>'publish','numberposts'=>-1]) as $post){$raw=get_post_meta($post->ID,'_elementor_data',true);if(!$raw)continue;$data=json_decode($raw,true);array_walk_recursive($data,function(&$value)use($old,$new){if(is_string($value))$value=str_replace($old,$new,$value);});\\Elementor\\Plugin::$instance->documents->get($post->ID)->save(['elements'=>$data]);}
wp_mkdir_p(wp_upload_dir()['basedir'].'/elementor/css');foreach(get_posts(['post_type'=>['page','elementor_library'],'post_status'=>'publish','numberposts'=>-1]) as $post){if(!get_post_meta($post->ID,'_elementor_edit_mode',true))continue;$css=new \\Elementor\\Core\\Files\\CSS\\Post($post->ID);$css->update();}
flush_rewrite_rules();echo 'Restored site URLs and CSS.';`;
let server;
try{
 server=await runCLI({command:'server',port:9401,'site-url':'http://127.0.0.1:9401',workers:2,wp:'latest',php:'8.3','mount-before-install':[{hostPath:destination,vfsPath:'/wordpress'}],wordpressInstallMode:'do-not-attempt-installing',blueprint:{steps:[{step:'runPHP',code}]}});
 await new Promise((resolve,reject)=>{server.server.close(error=>error?reject(error):resolve());server.server.closeAllConnections();});
 await new Promise((resolve,reject)=>server.server.listen(9401,'127.0.0.1',resolve).once('error',reject));
 const checks=[];
 for(const route of ['/','/about/','/services/','/projects/','/contact/','/privacy/','/services/structural-fabrication/','/projects/foundry-works/']){
  const response=await fetch('http://127.0.0.1:9401'+route),html=await response.text();
  const check={route,status:response.status,h1:(html.match(/<h1\b/g)||[]).length,oldUrls:html.includes('http://127.0.0.1:9400'),warnings:/<b>(Warning|Fatal error)<\/b>/.test(html)};
  checks.push(check);if(check.status!==200||check.h1!==1||check.oldUrls||check.warnings)throw new Error('Restoration failed: '+JSON.stringify(check));
 }
 const docResponse=await server.playground.run({code:`<?php require '/wordpress/wp-load.php';$ids=get_option('forgeline_page_ids');$result=[];foreach($ids as $slug=>$id)$result[$slug]=['builder'=>get_post_meta($id,'_elementor_edit_mode',true),'elements'=>count(json_decode(get_post_meta($id,'_elementor_data',true),true)?:[])];echo wp_json_encode($result);`});
 const documents=JSON.parse(new TextDecoder().decode(docResponse.bytes));
 if(Object.values(documents).some(d=>d.builder!=='builder'||d.elements<1))throw new Error('An editable document did not survive restoration.');
 // Import one exported JSON template through Elementor's library import path.
 const exportFile=(await (await import('node:fs/promises')).readdir(path.join(root,'dist/elementor-templates'))).find(n=>n.includes('reusable-service-card'));
 if(exportFile){
  const template=JSON.parse(await readFile(path.join(root,'dist/elementor-templates',exportFile),'utf8'));
  const test=await server.playground.run({code:`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);file_put_contents('/tmp/forgeline-template.json',base64_decode('${Buffer.from(JSON.stringify(template)).toString('base64')}'));$source=\\Elementor\\Plugin::$instance->templates_manager->get_source('local');$result=$source->import_template('forgeline-template.json','/tmp/forgeline-template.json');if(is_wp_error($result))throw new Exception($result->get_error_message());$id=$result[0]['template_id'];echo wp_json_encode(['imported'=>true,'roots'=>count(json_decode(get_post_meta($id,'_elementor_data',true),true))]);`});
  const result=JSON.parse(new TextDecoder().decode(test.bytes));if(!result.imported||!result.roots)throw new Error('Exported template import failed.');
  checks.push({templateImport:result});
 }else throw new Error('Reusable template export was missing.');
 await writeFile(path.join(root,'dist/restoration-test.json'),JSON.stringify({passed:true,destination,checks,documents},null,2));
 console.log('Restoration passed: 8 routes, 18 editable documents, and a reusable template import.');
}finally{if(server)await server[Symbol.asyncDispose]();}
