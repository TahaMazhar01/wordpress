<?php
if (!defined('THEME_DEV_MODE_ELEMENTS')) define('THEME_DEV_MODE_ELEMENTS',true);
if (!defined('ABSPATH')) require '/wordpress/wp-load.php';
if (get_option('forgeline_seed_version')) { echo "ForgeLine already initialized; edits preserved.\n"; return; }
wp_set_current_user(1);
update_option('blogname','ForgeLine Steel');
update_option('blogdescription','Built on precision. Forged to last.');
update_option('timezone_string','Asia/Karachi');
update_option('date_format','j F Y');
update_option('permalink_structure','/%postname%/');
update_option('blog_public',0);
update_option('default_comment_status','closed');
update_option('default_ping_status','closed');
update_option('forgeline_demo_mode',true);
update_option('forgeline_recipient','');
update_option('elementor_disable_color_schemes','yes');
update_option('elementor_disable_typography_schemes','yes');
update_option('elementor_experiment-container','active');
update_option('elementor_experiment-e_optimized_markup','active');
update_option('elementor_css_print_method','external');
switch_theme('forgeline-steel');
foreach(['hello-world','sample-page','privacy-policy'] as $slug){$post=get_page_by_path($slug,OBJECT,['page','post']);if($post)wp_delete_post($post->ID,true);}
require_once ABSPATH.'wp-admin/includes/file.php';
require_once ABSPATH.'wp-admin/includes/media.php';
require_once ABSPATH.'wp-admin/includes/image.php';
$media=[];
$alts=['welding-hero'=>'Welder at work with sparks in a metal fabrication workshop','workshop'=>'Welder working with steel in an industrial workshop','fabrication'=>'Metalworking equipment used for custom steel fabrication','craft'=>'Metalworker using a tool in a fabrication workshop','structure'=>'Steel beams forming the roof framework of a building','framework'=>'Structural steel framework against an open sky'];
add_filter('intermediate_image_sizes_advanced',function($sizes){return array_intersect_key($sizes,array_flip(['medium','large','medium_large']));});
foreach($alts as $name=>$alt){
    $existing=get_posts(['post_type'=>'attachment','post_status'=>'inherit','numberposts'=>1,'meta_key'=>'_forgeline_asset_key','meta_value'=>$name]);
    if($existing){$media[$name]=['id'=>$existing[0]->ID,'url'=>wp_get_attachment_url($existing[0]->ID)];continue;}
    $source=WP_PLUGIN_DIR.'/forgeline-site/seed/assets/'.$name.'.jpg';
    $tmp=wp_tempnam($name.'.jpg');copy($source,$tmp);
    $attachment=media_handle_sideload(['name'=>$name.'.jpg','tmp_name'=>$tmp],0,$alt);
    if(is_wp_error($attachment))throw new Exception($attachment->get_error_message());
    update_post_meta($attachment,'_wp_attachment_image_alt',$alt);
    update_post_meta($attachment,'_forgeline_asset_key',$name);
    $media[$name]=['id'=>$attachment,'url'=>wp_get_attachment_url($attachment)];
}
function fl_resolve_seed($value,$media){
    if(is_array($value)){
        foreach($value as $key=>$child)$value[$key]=fl_resolve_seed($child,$media);
        if(isset($value['url'],$value['id']))foreach($media as $image)if($value['url']===$image['url'])$value['id']=$image['id'];
        return $value;
    }
    if(!is_string($value))return $value;
    foreach($media as $name=>$image)$value=str_replace('__ASSET__/'.$name.'.jpg',$image['url'],$value);
    return str_replace(['__HOME__','__THEME__'],[untrailingslashit(home_url()),get_stylesheet_directory_uri()],$value);
}
$seed=json_decode(file_get_contents(WP_PLUGIN_DIR.'/forgeline-site/seed/content.json'),true,512,JSON_THROW_ON_ERROR);
$kit=wp_insert_post(['post_type'=>'elementor_library','post_status'=>'publish','post_title'=>'ForgeLine / Global Design System']);
update_post_meta($kit,'_elementor_template_type','kit');
update_post_meta($kit,'_elementor_edit_mode','builder');
update_post_meta($kit,'_elementor_version',ELEMENTOR_VERSION);
update_post_meta($kit,'_elementor_page_settings',[
    'system_colors'=>[['_id'=>'primary','title'=>'Steel / Ink','color'=>'#171c1e'],['_id'=>'secondary','title'=>'Warm white','color'=>'#f6f4ee'],['_id'=>'text','title'=>'Body text','color'=>'#5b6568'],['_id'=>'accent','title'=>'Forge orange','color'=>'#f17432']],
    'system_typography'=>[['_id'=>'primary','title'=>'Headings','typography_typography'=>'custom','typography_font_family'=>'Clash Grotesk','typography_font_weight'=>'600'],['_id'=>'secondary','title'=>'Secondary','typography_typography'=>'custom','typography_font_family'=>'Satoshi','typography_font_weight'=>'500'],['_id'=>'text','title'=>'Body','typography_typography'=>'custom','typography_font_family'=>'Satoshi','typography_font_size'=>['unit'=>'px','size'=>17]],['_id'=>'accent','title'=>'Labels','typography_typography'=>'custom','typography_font_family'=>'Satoshi','typography_font_weight'=>'700']],
    'container_width'=>['size'=>1440,'unit'=>'px'],'space_between_widgets'=>['size'=>0,'unit'=>'px'],
]);
update_option('elementor_active_kit',$kit);
$ids=[];
foreach($seed['pages'] as $page){
    $existing=get_page_by_path((isset($page['parent'])?$page['parent'].'/':'').$page['slug']);
    $post_id=wp_insert_post(['ID'=>$existing?$existing->ID:0,'post_type'=>'page','post_status'=>'publish','post_title'=>$page['title'],'post_name'=>$page['slug'],'post_parent'=>isset($page['parent'])?($ids[$page['parent']]??0):0,'comment_status'=>'closed']);
    if(is_wp_error($post_id)||!$post_id)throw new Exception('Could not create '.$page['slug']);
    update_post_meta($post_id,'_elementor_edit_mode','builder');
    update_post_meta($post_id,'_elementor_template_type','wp-page');
    update_post_meta($post_id,'_elementor_version',ELEMENTOR_VERSION);
    update_post_meta($post_id,'_wp_page_template','default');
    update_post_meta($post_id,'_forgeline_description',$page['description']);
    $data=fl_resolve_seed($page['data'],$media);
    $document=\Elementor\Plugin::$instance->documents->get($post_id);
    if(!$document)throw new Exception('No Elementor document for '.$page['slug']);
    $saved=$document->save(['elements'=>$data,'settings'=>['hide_title'=>'yes','template'=>'default']]);
    if(!$saved)throw new Exception('Elementor failed to save '.$page['slug']);
    $ids[$page['slug']]=$post_id;
    echo 'Created '.$page['title'].' #'.$post_id."\n";
}
foreach($seed['templates'] as $template){
    $post_id=wp_insert_post(['post_type'=>'elementor_library','post_status'=>'publish','post_title'=>$template['title']]);
    update_post_meta($post_id,'_elementor_edit_mode','builder');
    update_post_meta($post_id,'_elementor_template_type',$template['type']);
    update_post_meta($post_id,'_elementor_version',ELEMENTOR_VERSION);
    $data=fl_resolve_seed($template['data'],$media);
    $document=\Elementor\Plugin::$instance->documents->get($post_id);
    $document->save(['elements'=>$data,'settings'=>[]]);
    if(in_array($template['slug'],['header','footer'],true))update_option('forgeline_'.$template['slug'],$post_id);
    $ids['template-'.$template['slug']]=$post_id;
}
update_option('show_on_front','page');update_option('page_on_front',$ids['home']);update_option('wp_page_for_privacy_policy',$ids['privacy']);
$menu=wp_create_nav_menu('ForgeLine / Main Navigation');
foreach(['home'=>'Home','about'=>'About us','services'=>'Capabilities','projects'=>'Projects','contact'=>'Contact'] as $slug=>$label){wp_update_nav_menu_item($menu,0,['menu-item-title'=>$label,'menu-item-object'=>'page','menu-item-object-id'=>$ids[$slug],'menu-item-type'=>'post_type','menu-item-status'=>'publish']);}
set_theme_mod('nav_menu_locations',['forgeline'=>$menu]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
wp_mkdir_p(wp_upload_dir()['basedir'].'/elementor/css');
foreach(get_posts(['post_type'=>['page','elementor_library'],'post_status'=>'publish','numberposts'=>-1]) as $post){if(!get_post_meta($post->ID,'_elementor_edit_mode',true))continue;$css=new \Elementor\Core\Files\CSS\Post($post->ID);$css->update();}
flush_rewrite_rules();
update_option('forgeline_page_ids',$ids);update_option('forgeline_seed_version','1.0.0');
echo 'FORGELINE_READY '.wp_json_encode(['pages'=>$ids,'wordpress'=>get_bloginfo('version'),'elementor'=>ELEMENTOR_VERSION,'theme'=>wp_get_theme()->get('Name')])."\n";
