import {phpJob} from './local-runtime.mjs';
console.log((await phpJob(`<?php require '/wordpress/wp-load.php'; wp_set_current_user(1);
function fl_refine_text($elements){foreach($elements as &$element){if(($element['widgetType']??'')==='text-editor')$element['settings']['editor']=preg_replace('/<br>\\s*/','<br> ',$element['settings']['editor']);if(!empty($element['elements']))$element['elements']=fl_refine_text($element['elements']);}return $elements;}
foreach(get_posts(['post_type'=>['page','elementor_library'],'posts_per_page'=>-1,'post_status'=>'publish']) as $post){$raw=get_post_meta($post->ID,'_elementor_data',true);if(!$raw)continue;$data=json_decode($raw,true);$data=fl_refine_text($data);$doc=\\Elementor\\Plugin::$instance->documents->get($post->ID);$doc->save(['elements'=>$data]);}
\\Elementor\\Plugin::$instance->files_manager->clear_cache();echo 'Text spacing refined; editable documents saved.';`,'refine')).text);
