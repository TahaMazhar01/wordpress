import {phpJob} from './local-runtime.mjs';
const response=await phpJob(`<?php require '/wordpress/wp-load.php';
echo json_encode(['wordpress'=>get_bloginfo('version'),'elementor'=>ELEMENTOR_VERSION,'php'=>PHP_VERSION,'parent'=>wp_get_theme('hubsteel')->get('Version'),'theme'=>get_stylesheet(),'pages'=>get_option('forgeline_page_ids'),'enquiries'=>wp_count_posts('fl_enquiry'),'plugins'=>get_option('active_plugins'),'recipient_configured'=>is_email(get_option('forgeline_recipient',''))?true:false]);`,'inspect');
console.log(response.text);
