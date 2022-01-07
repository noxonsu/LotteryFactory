<?php

function lotteryfactory_update_options() {
  check_ajax_referer( 'lotteryfactory-nonce', 'nonce' );

  if ( ! current_user_can( 'manage_options' ) ) die();

  $options_whitelist = array(
    // Количество шаров учавствующих в розыгрыше
    'numbers_count' => array(
      'type'  => 'number',
      'min'   => 2,
      'max'   => 6
    ),
    // Процент выирыша при совпадении 1 шара
    'winning_1'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    // Процент выирыша при совпадении 2 шаров
    'winning_2'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    // Процент выирыша при совпадении 3 шаров
    'winning_3'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    // Процент выирыша при совпадении 4 шаров
    'winning_4'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    // Процент выирыша при совпадении 5 шаров
    'winning_5'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    // Процент выирыша при совпадении 6 шаров
    'winning_6'     => array(
      'type'  => 'float',
      'min'   => 0,
      'max'   => 100
    ),
    'token_price'   => array(
      'type'  => 'float',
      'min'   => 0
    ),
    'tokenbuy_link' => array(
      'type'  => 'string'
    ),
    'token_viewdecimals'  => array(
      'type'  => 'number',
      'min'   => 0,
      'max'   => 18
    ),
    'last_ticket_price'        => array(
      'type'  => 'float'
    ),
    'last_treasury_fee'        => array(
      'type'  => 'number',
      'min'   => 0,
      'max'   => 30
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
        foreach($indata['options'] as $option_key=>&$option_value) {
          if (isset($options_whitelist[$option_key])) {
            switch ($options_whitelist[$option_key]['type']) {
              case 'string':
                $values_to_set[$option_key] = sanitize_text_field( $option_value );
                break;
              case 'float':
                if (is_float(floatval($option_value))) {
                  $check_value = floatval($option_value);
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
                  $error = "Option {$option_key} must be float";
                  $continue_check = false;
                  break;
                }
                break;
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