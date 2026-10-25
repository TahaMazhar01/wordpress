<?php
/**
 * Plugin Name: ForgeLine Site Tools
 * Description: Editable enquiry widget, private enquiry storage, and handover controls for ForgeLine Steel.
 * Version: 1.0.0
 * Author: ForgeLine Steel
 */
defined('ABSPATH') || exit;
add_action('init', function () {
    register_post_type('fl_enquiry', ['labels'=>['name'=>'Project enquiries','singular_name'=>'Project enquiry'],'public'=>false,'show_ui'=>true,'show_in_rest'=>false,'menu_icon'=>'dashicons-email-alt','supports'=>['title','editor'],'capability_type'=>'post','capabilities'=>['create_posts'=>'do_not_allow','edit_posts'=>'manage_options','edit_post'=>'manage_options','read_post'=>'manage_options','delete_post'=>'manage_options','edit_others_posts'=>'manage_options','edit_private_posts'=>'manage_options','read_private_posts'=>'manage_options','delete_posts'=>'manage_options','delete_private_posts'=>'manage_options','delete_others_posts'=>'manage_options','publish_posts'=>'manage_options'],'map_meta_cap'=>false]);
});
add_action('admin_init', function () {
    register_setting('forgeline_settings','forgeline_recipient',['type'=>'string','sanitize_callback'=>'sanitize_email','default'=>'']);
    register_setting('forgeline_settings','forgeline_demo_mode',['type'=>'boolean','sanitize_callback'=>'rest_sanitize_boolean','default'=>true]);
    register_setting('forgeline_settings','forgeline_header',['type'=>'integer','sanitize_callback'=>'absint']);
    register_setting('forgeline_settings','forgeline_footer',['type'=>'integer','sanitize_callback'=>'absint']);
});
add_action('admin_menu', function () {
    add_options_page('ForgeLine handover','ForgeLine handover','manage_options','forgeline-handover','forgeline_settings_page');
});
function forgeline_settings_page() {
    if (!current_user_can('manage_options')) return;
    ?><div class="wrap"><h1>ForgeLine Steel — editing & handover</h1>
    <p>Edit page content through <strong>Pages → Edit with Elementor</strong>. Edit the shared header, footer, and reusable sections through <strong>Templates → Saved Templates</strong>. Change the navigation in <strong>Appearance → Menus</strong>.</p>
    <p>Global colors and typography are in <strong>Elementor → Site Settings</strong>. Custom design source is in the ForgeLine child theme. Keep the Hubsteel parent installed.</p>
    <form method="post" action="options.php"><?php settings_fields('forgeline_settings'); ?>
    <table class="form-table"><tr><th scope="row"><label for="fl-recipient">Enquiry email recipient</label></th><td><input id="fl-recipient" class="regular-text" type="email" name="forgeline_recipient" value="<?php echo esc_attr(get_option('forgeline_recipient','')); ?>"><p class="description">Leave empty to save enquiries locally without sending email. Configure SMTP and test delivery before launch.</p></td></tr>
    <tr><th scope="row">Demonstration mode</th><td><input type="hidden" name="forgeline_demo_mode" value="0"><label><input type="checkbox" name="forgeline_demo_mode" value="1" <?php checked(get_option('forgeline_demo_mode',true)); ?>> Show the demonstration notice in the enquiry widget</label></td></tr>
    <?php foreach(['forgeline_header'=>'Shared header','forgeline_footer'=>'Shared footer'] as $key=>$label): ?><tr><th scope="row"><?php echo esc_html($label); ?></th><td><select name="<?php echo esc_attr($key); ?>"><option value="0">Select a saved template</option><?php foreach(get_posts(['post_type'=>'elementor_library','numberposts'=>-1]) as $template): ?><option value="<?php echo esc_attr($template->ID); ?>" <?php selected(get_option($key),$template->ID); ?>><?php echo esc_html($template->post_title); ?></option><?php endforeach; ?></select></td></tr><?php endforeach; ?>
    </table><?php submit_button(); ?></form>
    <h2>Before public launch</h2><p>Replace the fictional contact details and concept portfolio, update the privacy information and retention policy, configure email, verify the theme license and versions, and test the site on the destination host.</p></div><?php
}
add_action('elementor/widgets/register', function ($manager) {
    require_once __DIR__ . '/enquiry-widget.php';
    $manager->register(new ForgeLine_Enquiry_Widget());
});
function forgeline_form_markup($settings=[]) {
    $title=$settings['form_title']??'Tell us about your project';
    $button=$settings['submit_text']??'Send project enquiry ↗';
    $uid=wp_unique_id('fl-form-');
    $status=sanitize_key($_GET['enquiry']??'');
    $messages=['saved'=>'Your enquiry has been saved. This demonstration stores it locally; email delivery is not configured.','received'=>'Your enquiry has been received and an email notification has been requested.','mail-failed'=>'Your enquiry has been saved, but the email notification could not be sent.','invalid'=>'Please check your name, email, service, message, and privacy acknowledgement, then try again.','expired'=>'This form has expired. Refresh the page and try again.','rate'=>'Please wait a moment before sending another enquiry.','storage'=>'Your enquiry could not be saved. Please try again.'];
    ob_start(); ?><div class="fl-enquiry" id="project-enquiry">
    <h2><?php echo esc_html($title); ?></h2>
    <?php if(isset($messages[$status])): ?><div class="fl-alert <?php echo in_array($status,['invalid','expired','rate','storage'],true)?'error':''; ?>" role="status" tabindex="-1"><?php echo esc_html($messages[$status]); ?></div><?php endif; ?>
    <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
    <input type="hidden" name="action" value="forgeline_enquiry"><?php wp_nonce_field('forgeline_enquiry','fl_nonce'); ?>
    <div class="fl-form-grid">
    <div class="fl-field"><label for="<?php echo esc_attr($uid); ?>name">Your name *</label><input id="<?php echo esc_attr($uid); ?>name" name="fl_name" autocomplete="name" maxlength="100" required></div>
    <div class="fl-field"><label for="<?php echo esc_attr($uid); ?>email">Email address *</label><input id="<?php echo esc_attr($uid); ?>email" name="fl_email" type="email" autocomplete="email" maxlength="180" required></div>
    <div class="fl-field full"><label for="<?php echo esc_attr($uid); ?>company">Company <span>(optional)</span></label><input id="<?php echo esc_attr($uid); ?>company" name="fl_company" autocomplete="organization" maxlength="160"></div>
    <div class="fl-field full"><label for="<?php echo esc_attr($uid); ?>service">How can we help? *</label><select id="<?php echo esc_attr($uid); ?>service" name="fl_service" required><option value="">Select a capability</option><?php foreach(forgeline_services() as $service): ?><option><?php echo esc_html($service); ?></option><?php endforeach; ?></select></div>
    <div class="fl-field full"><label for="<?php echo esc_attr($uid); ?>message">About your project *</label><textarea id="<?php echo esc_attr($uid); ?>message" name="fl_message" rows="5" minlength="10" maxlength="4000" placeholder="Tell us what you have in mind, including approximate scope and timeline." required></textarea></div>
    </div><div class="fl-honeypot" aria-hidden="true"><label>Leave this empty<input name="fl_website" tabindex="-1" autocomplete="off"></label></div>
    <label class="fl-consent"><input type="checkbox" name="fl_consent" value="1" required><span>I agree to the use of these details to handle my enquiry, as described in the <a href="<?php echo esc_url(home_url('/privacy/')); ?>">privacy notice</a>.</span></label>
    <button type="submit"><?php echo esc_html($button); ?></button>
    <?php if(get_option('forgeline_demo_mode',true)): ?><p class="fl-form-note">Coursework demonstration. Enquiries are saved locally. Please use sample details and avoid confidential information.</p><?php endif; ?>
    </form></div><?php return ob_get_clean();
}
function forgeline_services() { return ['Structural fabrication','Welding & assembly','Custom metalwork','Site installation','General enquiry']; }
add_shortcode('forgeline_enquiry', 'forgeline_form_markup');
add_action('admin_post_nopriv_forgeline_enquiry','forgeline_handle_enquiry');
add_action('admin_post_forgeline_enquiry','forgeline_handle_enquiry');
function forgeline_handle_enquiry() {
    $redirect=function($status){wp_safe_redirect(add_query_arg('enquiry',$status,home_url('/contact/')).'#project-enquiry',303);exit;};
    if($_SERVER['REQUEST_METHOD']!=='POST')$redirect('invalid');
    if(!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fl_nonce']??'')),'forgeline_enquiry'))$redirect('expired');
    if(!empty($_POST['fl_website']))$redirect('invalid');
    $name=sanitize_text_field(wp_unslash($_POST['fl_name']??''));
    $email=sanitize_email(wp_unslash($_POST['fl_email']??''));
    $company=sanitize_text_field(wp_unslash($_POST['fl_company']??''));
    $service=sanitize_text_field(wp_unslash($_POST['fl_service']??''));
    $message=sanitize_textarea_field(wp_unslash($_POST['fl_message']??''));
    if(strlen($name)<2||strlen($name)>100||!is_email($email)||strlen($email)>180||strlen($company)>160||!in_array($service,forgeline_services(),true)||strlen($message)<10||strlen($message)>4000||($_POST['fl_consent']??'')!=='1')$redirect('invalid');
    $key='fl_rate_'.hash_hmac('sha256',sanitize_text_field($_SERVER['REMOTE_ADDR']??'local'),wp_salt('nonce'));
    if(get_transient($key))$redirect('rate');
    $body="Name: $name\nEmail: $email\nCompany: $company\nService: $service\n\n$message\n\nPrivacy acknowledgement: yes";
    $post_id=wp_insert_post(['post_type'=>'fl_enquiry','post_status'=>'private','post_title'=>$service.' — '.$name,'post_content'=>$body],true);
    if(is_wp_error($post_id))$redirect('storage');
    set_transient($key,1,30);
    $recipient=get_option('forgeline_recipient','');
    if(!is_email($recipient))$redirect('saved');
    $sent=wp_mail($recipient,'ForgeLine enquiry #'.$post_id.': '.$service,$body,['Reply-To: '.$email]);
    $redirect($sent?'received':'mail-failed');
}
