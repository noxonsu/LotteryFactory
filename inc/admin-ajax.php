<?php

function lotteryfactory_update_options() {
  check_ajax_referer( 'lotteryfactory-nonce', 'nonce' );

  if ( ! current_user_can( 'manage_options' ) ) die();

}

add_action( 'wp_ajax_lotteryfactory_update_options', 'lotteryfactory_update_options' );