<?php
  $lottery_id = get_option( 'lotteryfactory_id_at_homepage', 'false');
  $lottery = lottery_get_data($lottery_id);

  if ($lottery['hide_footer_header'] === 'true') {
    lottery_default_header();
  } else {
    get_header();
  }

  $lottery_html = lotteryfactory_main_shortcode(array( 'id' => $lottery_id ));

  echo $lottery_html;

  if ($lottery['hide_footer_header'] === 'true') {
    lottery_default_footer();
  } else {
    get_footer();
  }
?>