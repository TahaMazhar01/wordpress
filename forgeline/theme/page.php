<?php defined('ABSPATH') || exit; get_header(); ?>
<main id="main-content" tabindex="-1"><?php while(have_posts()) { the_post(); the_content(); } ?></main>
<?php get_footer(); ?>
