import {phpJob,root} from './local-runtime.mjs';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {zipFiles,directoryEntries} from './zip-fast.mjs';
const response=await phpJob(`<?php require '/wordpress/wp-load.php'; wp_set_current_user(1);
require_once ABSPATH.'wp-admin/includes/export.php';
ob_start();export_wp(['content'=>'all']);$wxr=ob_get_clean();
file_put_contents(ABSPATH.'wp-content/forgeline-content.xml',$wxr);
$exports=[];
foreach(get_posts(['post_type'=>['page','elementor_library'],'post_status'=>'publish','posts_per_page'=>-1]) as $post){
 $data=json_decode(get_post_meta($post->ID,'_elementor_data',true),true);
 if(!$data)continue;
 $exports[]=['id'=>$post->ID,'slug'=>$post->post_name,'title'=>$post->post_title,'type'=>$post->post_type==='page'?'page':get_post_meta($post->ID,'_elementor_template_type',true),'content'=>$data,'page_settings'=>get_post_meta($post->ID,'_elementor_page_settings',true)?:[]];
}
file_put_contents(ABSPATH.'wp-content/forgeline-export.json',wp_json_encode($exports));
global $wpdb;$wpdb->query('PRAGMA wal_checkpoint(FULL)');
echo wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'elementor'=>ELEMENTOR_VERSION,'parent_theme'=>wp_get_theme('hubsteel')->get('Version'),'child_theme'=>wp_get_theme()->get('Version'),'pages'=>count(get_pages()),'templates'=>count($exports)-count(get_pages()),'enquiries'=>wp_count_posts('fl_enquiry')->private]);`,'export');
const versions=JSON.parse(response.text);
await mkdir(path.join(root,'dist/elementor-templates'),{recursive:true});
const exports=JSON.parse(await readFile(path.join(root,'wordpress/wp-content/forgeline-export.json'),'utf8'));
// Write actual saved Elementor documents, not a reconstruction of the original seed.
for(const file of await readdir(path.join(root,'dist/elementor-templates'))){if(file.endsWith('.json'))await (await import('node:fs/promises')).unlink(path.join(root,'dist/elementor-templates',file));}
for(const item of exports){await writeFile(path.join(root,'dist/elementor-templates',`${item.id}-${item.slug}.json`),JSON.stringify({version:'0.4',title:item.title,type:item.type,content:item.content,page_settings:item.page_settings},null,2));}
await writeFile(path.join(root,'dist/forgeline-content.xml'),await readFile(path.join(root,'wordpress/wp-content/forgeline-content.xml')));
await writeFile(path.join(root,'dist/versions.json'),JSON.stringify(versions,null,2));
const entries=await directoryEntries(path.join(root,'wordpress'),'wordpress',name=>['debug.log','forgeline-content.xml','forgeline-export.json'].includes(name));
await writeFile(path.join(root,'dist/forgeline-steel-site.zip'),await zipFiles(entries));
console.log('Exported saved WordPress site, WXR, and '+exports.length+' Elementor documents.');
console.log(JSON.stringify(versions));
