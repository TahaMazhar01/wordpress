import {phpJob} from './local-runtime.mjs';
console.log((await phpJob(`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);
wp_mkdir_p(wp_upload_dir()['basedir'].'/elementor/css');
foreach(get_posts(['post_type'=>['page','elementor_library'],'post_status'=>'publish','numberposts'=>-1]) as $post){if(!get_post_meta($post->ID,'_elementor_edit_mode',true))continue;$css=new \\Elementor\\Core\\Files\\CSS\\Post($post->ID);$css->update();}
echo 'Regenerated CSS for every saved Elementor document.';`,'css')).text);
