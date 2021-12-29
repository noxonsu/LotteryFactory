<?php

function lotteryfactory_update_options() {
  check_ajax_referer( 'lotteryfactory-nonce', 'nonce' );

  if ( ! current_user_can( 'manage_options' ) ) die();

  $options_whitelist = array(
    'numbers_count' => array(
      'type'  => 'number',
      'min'   => 2,
      'max'   => 6
    )
  );
  $error = false;
  $values_to_set = array();
  if (isset($_POST['data']) and is_array($_POST['data'])) {
    $indata = $_POST['data'];
    if (isset($indata['postId']) and is_numeric($indata['postId'])) {
      $postId = intval($indata['postId']);
      if (isset($indata['options']) and is_array($indata['options'])) {
        $continue_check = true;
        foreach($indata['options'] as $option_key=>$option_value) {
          if (isset($options_whitelist[$option_key])) {
            switch ($options_whitelist[$option_key]['type']) {
              case 'number':
                if (is_numeric($option_value)) {
                  $check_value = intval($option_value);
                  $check_opts = $options_whitelist[$option_key];
                  if (isset($check_opts['min']) && $check_value < $check_opts['min']) {
                    $error = "Option {$option_key} may be greater than {$check_opts['min']}";
                    $continue_check = false;
                    break;
                  }
                  if (isset($check_opts['max']) && $check_value > $check_opts['max']) {
                    $error = "Option {$option_key} may be less than {$check_opts['max']}";
                    $continue_check = false;
                    break;
                  }
                  $values_to_set[$option_key] = $check_value;
                } else {
                  $error = "Option {$option_key} must be numeric";
                  $continue_check = false;
                  break;
                }
                break;
              default:
                $error = "Not implement type {$options_whitelist[$option_key]['type']}. Break save";
                $continue_check = false;
                break;
            }
            if (!$continue_check) break;
          } else {
            $error = "Option {$option_key} not exists";
            break;
          }
        }
      } else {
        $error = 'Update options required';
      }
    } else {
      echo $indata['postId'];
      $error = 'Post ID required';
    }
  } else {
    $error = 'Input data required';
  }

  if (!$error) {
    foreach($values_to_set as $metaKey=>$metavalue) {
      update_post_meta( $postId, $metaKey, $metavalue );
    }
    wp_send_json( array(
      'success' => true
    ) );
    exit();
  }
  wp_send_json( array(
    'success' => false,
    'error' => ($error) ? $error : 'unknown'
  ));
}

add_action( 'wp_ajax_lotteryfactory_update_options', 'lotteryfactory_update_options' );