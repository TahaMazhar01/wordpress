<?php
defined('ABSPATH') || exit;
class ForgeLine_Enquiry_Widget extends \Elementor\Widget_Base {
    public function get_name(){return 'forgeline-enquiry';}
    public function get_title(){return 'ForgeLine Project Enquiry';}
    public function get_icon(){return 'eicon-form-horizontal';}
    public function get_categories(){return ['general'];}
    protected function register_controls(){
        $this->start_controls_section('form_content',['label'=>'Enquiry form']);
        $this->add_control('form_title',['label'=>'Form heading','type'=>\Elementor\Controls_Manager::TEXT,'default'=>'Tell us about your project']);
        $this->add_control('submit_text',['label'=>'Button text','type'=>\Elementor\Controls_Manager::TEXT,'default'=>'Send project enquiry ↗']);
        $this->add_control('help',['type'=>\Elementor\Controls_Manager::RAW_HTML,'raw'=>'Enquiries are saved in Project enquiries. Configure the notification recipient in Settings → ForgeLine handover. Form field markup and validation are in the editable ForgeLine Site Tools plugin source.']);
        $this->end_controls_section();
    }
    protected function render(){echo forgeline_form_markup($this->get_settings_for_display());}
}
