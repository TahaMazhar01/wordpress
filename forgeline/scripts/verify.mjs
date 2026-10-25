import {phpJob,root} from './local-runtime.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
const base='http://127.0.0.1:9400';
const paths=['/','/about/','/services/','/projects/','/contact/','/privacy/','/services/structural-fabrication/','/services/welding-assembly/','/services/custom-metalwork/','/services/site-installation/','/projects/foundry-works/','/projects/lines-of-connection/','/projects/working-frame/'];
const report={pages:[],assets:[],forms:[],errors:[]};
const assets=new Set(),links=new Set();
for(const p of paths){
 const start=performance.now(),response=await fetch(base+p),html=await response.text();
 const result={path:p,status:response.status,h1:(html.match(/<h1\b/g)||[]).length,description:/name="description"/.test(html),phpWarnings:/<b>(Warning|Fatal error|Notice)<\/b>/.test(html),milliseconds:Math.round(performance.now()-start)};
 report.pages.push(result);
 if(result.status!==200||result.h1!==1||!result.description||result.phpWarnings)report.errors.push('Page check failed: '+p);
 for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){const url=match[1].replaceAll('&amp;','&');if(!url.startsWith(base))continue;const parsed=new URL(url);if(/\.(?:css|js|jpg|png|svg|woff2)(?:$|\?)/.test(parsed.pathname+parsed.search))assets.add(url);else if(!parsed.pathname.startsWith('/wp-')&&!parsed.pathname.includes('feed'))links.add(parsed.pathname);}
 console.log('Page '+p+' '+response.status+' / H1 '+result.h1+(result.phpWarnings?' / WARNING':''));
}
for(const url of assets){const response=await fetch(url);const bytes=(await response.arrayBuffer()).byteLength;report.assets.push({path:new URL(url).pathname,status:response.status,bytes});if(response.status!==200)report.errors.push('Asset failed: '+url);}
for(const p of links){if(paths.includes(p)||p==='/home/'||p==='/xmlrpc.php')continue;const response=await fetch(base+p);if(!response.ok)report.errors.push('Broken internal link: '+p);}
const notFound=await fetch(base+'/this-page-does-not-exist/');report.notFound=notFound.status;if(notFound.status!==404)report.errors.push('404 status is incorrect.');
// These requests never email: the seed leaves the recipient empty.
const contact=await (await fetch(base+'/contact/')).text();
const nonce=contact.match(/name="fl_nonce" value="([^"]+)"/)?.[1];
if(!nonce)throw new Error('Form nonce was not rendered.');
const send=async(fields)=>{const r=await fetch(base+'/wp-admin/admin-post.php',{method:'POST',body:new URLSearchParams(fields),redirect:'manual'});return {status:r.status,location:r.headers.get('location')};};
const expired=await send({action:'forgeline_enquiry',fl_nonce:'invalid'});report.forms.push({test:'Invalid nonce rejected',...expired});if(!expired.location?.includes('enquiry=expired'))report.errors.push('Nonce rejection failed.');
const invalid=await send({action:'forgeline_enquiry',fl_nonce:nonce,fl_name:'X',fl_email:'bad',fl_service:'Other',fl_message:'short'});report.forms.push({test:'Invalid fields rejected',...invalid});if(!invalid.location?.includes('enquiry=invalid'))report.errors.push('Field validation failed.');
const valid=await send({action:'forgeline_enquiry',fl_nonce:nonce,fl_name:'ForgeLine Validation Test',fl_email:'validation@example.invalid',fl_company:'Coursework QA',fl_service:'Structural fabrication',fl_message:'This is an automated local validation enquiry. It is safe to remove.',fl_consent:'1',fl_website:''});
report.forms.push({test:'Valid enquiry saved locally',...valid});if(!valid.location?.includes('enquiry=saved'))report.errors.push('Valid form submission failed.');
const repeated=await send({action:'forgeline_enquiry',fl_nonce:nonce,fl_name:'ForgeLine Validation Test',fl_email:'validation@example.invalid',fl_service:'Structural fabrication',fl_message:'This is a second local validation enquiry to test the rate limit.',fl_consent:'1'});report.forms.push({test:'Immediate repeat is rate limited',...repeated});if(!repeated.location?.includes('enquiry=rate'))report.errors.push('Rate limit failed.');
const state=JSON.parse((await phpJob(`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);
$tests=get_posts(['post_type'=>'fl_enquiry','post_status'=>'private','numberposts'=>-1,'s'=>'ForgeLine Validation Test']);$verified=0;foreach($tests as $post){if($post->post_title==='Structural fabrication — ForgeLine Validation Test'&&str_contains($post->post_content,'validation@example.invalid')){$verified++;wp_delete_post($post->ID,true);}}
$documents=[];foreach(get_option('forgeline_page_ids') as $slug=>$id){$data=json_decode(get_post_meta($id,'_elementor_data',true),true);$documents[$slug]=['id'=>$id,'builder'=>get_post_meta($id,'_elementor_edit_mode',true),'roots'=>is_array($data)?count($data):0];}
echo wp_json_encode(['saved_test_enquiries'=>$verified,'documents'=>$documents,'recipient_empty'=>get_option('forgeline_recipient','')==='','enquiry_public'=>get_post_type_object('fl_enquiry')->public,'enquiry_edit_cap'=>get_post_type_object('fl_enquiry')->cap->edit_posts]);`,'verify')).text);
report.database=state;
if(state.saved_test_enquiries!==1)report.errors.push('Enquiry storage verification failed.');
for(const [slug,doc] of Object.entries(state.documents))if(doc.builder!=='builder'||doc.roots<1)report.errors.push('Non-editable document: '+slug);
await writeFile(path.join(root,'dist/verification.json'),JSON.stringify(report,null,2));
console.log(`${report.pages.length} pages; ${report.assets.length} assets; ${report.forms.length} form checks. Errors: ${report.errors.length}`);
if(report.errors.length){console.error(report.errors);process.exitCode=1;}
