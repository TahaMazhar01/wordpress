import {phpJob,root} from './local-runtime.mjs';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
const base='http://127.0.0.1:9400';
const samples=[
 {name:'Dummy Alex Carter',email:'dummy.alex@example.invalid',company:'Demo Warehouse Co.',service:'Structural fabrication',message:'DUMMY ENQUIRY 1 — Coursework sample only. Please provide an initial discussion for a concept warehouse steel frame, approximately 18 by 24 metres, with drawings to follow.'},
 {name:'Dummy Sara Malik',email:'dummy.sara@example.invalid',company:'Demo Assembly Works',service:'Welding & assembly',message:'DUMMY ENQUIRY 2 — Coursework sample only. We would like to discuss fabrication and welding for a sample batch of 20 equipment support brackets. Please explain the information needed for a quotation.'},
 {name:'Dummy James Reed',email:'dummy.james@example.invalid',company:'Demo Architecture Studio',service:'Custom metalwork',message:'DUMMY ENQUIRY 3 — Coursework sample only. We are exploring a concept steel staircase and balustrade with a dark finish. Please advise on the next steps for reviewing sketches and finishes.'},
 {name:'Dummy Ayesha Khan',email:'dummy.ayesha@example.invalid',company:'Demo Site Projects',service:'Site installation',message:'DUMMY ENQUIRY 4 — Coursework sample only. We would like an example installation discussion for a small fabricated frame at a fictional project site. Please outline the access and delivery details required.'},
 {name:'Dummy Daniel Brooks',email:'dummy.daniel@example.invalid',company:'Demo Procurement Ltd.',service:'General enquiry',message:'DUMMY ENQUIRY 5 — Coursework sample only. Please share an overview of your proposed services and explain how to submit drawings, quantities, and a preferred timeline for a future sample project.'},
];
await fetch(base+'/contact/',{signal:AbortSignal.timeout(20000)});
const initial=JSON.parse((await phpJob(`<?php require '/wordpress/wp-load.php'; echo wp_json_encode(['recipient_enabled'=>(bool)is_email(get_option('forgeline_recipient','')),'existing'=>array_map(function($p){return $p->post_title;},get_posts(['post_type'=>'fl_enquiry','post_status'=>'private','numberposts'=>-1]))]);`,'dummy-check')).text);
if(initial.recipient_enabled)throw new Error('Email notifications are enabled; this sample-submission script expects local-only storage.');
const normalizeTitle=value=>value.replaceAll('&amp;','&');
initial.existing=initial.existing.map(normalizeTitle);
const results=[];
for(let index=0;index<samples.length;index++){
 const sample=samples[index];
 if(initial.existing.includes(sample.service+' — '+sample.name)){console.log(`Already present: ${sample.name}`);continue;}
 const page=await (await fetch(base+'/contact/')).text();
 const nonce=page.match(/name="fl_nonce" value="([^"]+)"/)?.[1];
 if(!nonce)throw new Error('The form nonce is missing.');
 const fields={action:'forgeline_enquiry',fl_nonce:nonce,fl_name:sample.name,fl_email:sample.email,fl_company:sample.company,fl_service:sample.service,fl_message:sample.message,fl_consent:'1',fl_website:''};
 let response=await fetch(base+'/wp-admin/admin-post.php',{method:'POST',body:new URLSearchParams(fields),redirect:'manual'});
 if(response.headers.get('location')?.includes('enquiry=rate')){
  console.log('Waiting for the normal form rate limit.');await new Promise(resolve=>setTimeout(resolve,31000));
  response=await fetch(base+'/wp-admin/admin-post.php',{method:'POST',body:new URLSearchParams(fields),redirect:'manual'});
 }
 const location=response.headers.get('location');
 if(!location?.includes('enquiry=saved'))throw new Error('Submission failed: '+sample.name+' '+location);
 results.push({name:sample.name,service:sample.service,status:response.status,location});
 console.log(`Saved ${index+1}/5: ${sample.name} — ${sample.service}`);
 if(index<samples.length-1)await new Promise(resolve=>setTimeout(resolve,31000));
}
const confirmed=JSON.parse((await phpJob(`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);$items=[];foreach(get_posts(['post_type'=>'fl_enquiry','post_status'=>'private','numberposts'=>-1]) as $post){if(str_contains($post->post_content,'DUMMY ENQUIRY ')&&str_contains($post->post_content,'@example.invalid'))$items[]=['id'=>$post->ID,'title'=>$post->post_title,'status'=>$post->post_status];}echo wp_json_encode($items);`,'dummy-verify')).text);
if(samples.some(s=>!confirmed.some(p=>normalizeTitle(p.title)===s.service+' — '+s.name)))throw new Error('Not all five dummy enquiries were found in the dashboard data.');
await writeFile(path.join(root,'runtime/dummy-enquiries.json'),JSON.stringify({submissions:results,confirmed},null,2));
console.log('Verified: all five dummy enquiries are saved privately in the dashboard.');
