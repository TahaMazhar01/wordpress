import {phpJob,root} from './local-runtime.mjs';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
const response=await phpJob(`<?php require '/wordpress/wp-load.php'; global $wpdb;
echo wp_json_encode(['db_version'=>$wpdb->db_version(),'driver'=>get_class($wpdb),'mysqli'=>extension_loaded('mysqli'),'pages'=>count(get_pages()),'enquiries'=>wp_count_posts('fl_enquiry')->private,'sqlite_dropin'=>file_exists(WP_CONTENT_DIR.'/db.php'),'db_host'=>DB_HOST]);`,'mysql-proof');
console.log(response.text);
const result=JSON.parse(response.text);
if(result.driver!=='wpdb'||!result.mysqli||!result.db_version.startsWith('8.4.')||result.pages!==13||Number(result.enquiries)!==5||result.sqlite_dropin)throw Error('WordPress MySQL proof failed.');
await writeFile(path.join(root,'dist/mysql/wordpress-database-proof.json'),JSON.stringify(result,null,2));
