<?php
defined('ABSPATH') || exit;
if (!defined('THEME_DEV_MODE_ELEMENTS') && get_option('forgeline_seed_version')) define('THEME_DEV_MODE_ELEMENTS',false);
add_filter('elementor/frontend/print_google_fonts', '__return_false');
add_action('init', function() {
    // Elementor may retain a directory-exists cache after a CSS flush.
    $uploads=wp_upload_dir();
    $directory=$uploads['basedir'].'/elementor/css';
    clearstatcache(true,$directory);
    if(!is_dir($directory))wp_mkdir_p($directory);
}, 1);
// Supply safe defaults before Hubsteel reads Redux options on a fresh install.
add_filter('case/setting/options', function($options) {
    return wp_parse_args(is_array($options)?$options:[], ['gradient_color'=>['from'=>'#f17432','to'=>'#f17432'],'pxl_body_typography'=>'satoshi','pxl_heading_typography'=>'clashgrotesk','smooth_scroll'=>'off']);
});
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('forgeline', get_stylesheet_directory_uri() . '/assets/forgeline.css', ['pxl-style'], (string)filemtime(get_stylesheet_directory().'/assets/forgeline.css'));
    wp_enqueue_script('forgeline', get_stylesheet_directory_uri() . '/assets/forgeline.js', [], (string)filemtime(get_stylesheet_directory().'/assets/forgeline.js'), true);
    // These parent-theme effects are not used by the ForgeLine layouts.
    foreach (['chart','slick-lib','wow-animate','stellar-parallax','nice-select','modernizr','pxl-parallax-background','pxl-parallax-scroll','pxl-splitText','pxl-woocommerce','pxl-gsap-min','pxl-main'] as $handle) wp_dequeue_script($handle);
}, 100);
add_action('after_setup_theme', function () {
    register_nav_menu('forgeline', __('ForgeLine primary navigation', 'forgeline'));
});
function forgeline_template($option) {
    $id = absint(get_option($option));
    if ($id && class_exists('Elementor\\Plugin')) {
        echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display($id, true); // Elementor sanitizes widget output.
    }
}
add_shortcode('forgeline_navigation', function () {
    return '<button class="fl-menu-toggle" aria-expanded="false" aria-controls="fl-primary-menu" type="button"><span>Menu</span><span class="fl-menu-icon" aria-hidden="true">☰</span></button><nav aria-label="Main navigation" id="fl-primary-menu">' . wp_nav_menu(['theme_location'=>'forgeline','container'=>false,'echo'=>false,'fallback_cb'=>false,'menu_class'=>'fl-menu']) . '</nav>';
});
add_action('wp_head', function () {
    if (!is_singular('page')) return;
    $description = get_post_meta(get_queried_object_id(), '_forgeline_description', true);
    if ($description) echo '<meta name="description" content="' . esc_attr($description) . '">';
    echo '<meta name="theme-color" content="#171c1e">';
    echo '<link rel="icon" type="image/svg+xml" href="' . esc_url(get_stylesheet_directory_uri() . '/assets/mark.svg') . '">';
}, 2);
add_filter('body_class', function ($classes) { $classes[]='forgeline-site'; return $classes; });
add_action('admin_bar_menu', function ($bar) {
    if (!current_user_can('edit_theme_options')) return;
    foreach (['forgeline_header'=>'Header','forgeline_footer'=>'Footer'] as $option=>$label) {
        $id=absint(get_option($option));
        if ($id) $bar->add_node(['id'=>$option,'title'=>'Edit '.$label,'href'=>admin_url('post.php?post='.$id.'&action=elementor')]);
    }
}, 100);
