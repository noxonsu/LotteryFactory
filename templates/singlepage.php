<?php
  $lottery = lottery_get_data(get_the_ID());

  if ($lottery['hide_footer_header'] === 'true') {
    lottery_default_header();
  } else {
    get_header();
  }

  $lottery_html = lotteryfactory_main_shortcode(array( 'id' => get_the_ID() ));

  echo $lottery_html;

  if ($lottery['hide_footer_header'] === 'true') {
    lottery_default_footer();
  } else {
    get_footer();
  }
?>