<?php
/**
 * Functions
 *
 * @package Lottery Factory
 */

/**
 * Get default Infura ID
 */
function lotteryfactory_default_infura_id() {
	return '8043bb2cf99347b1bfadfb233c5325c0';
}

function lotteryfactory_generate_salt() {
  $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  $randomString = '';

  for ($i = 0; $i < 128; $i++) {
      $index = rand(0, strlen($characters) - 1);
      $randomString .= $characters[$index];
  }

  return $randomString;
}

function lotteryfactory_prepare_vendor() {
  $version = (LOTTERYFACTORY_VER) ? LOTTERYFACTORY_VER : 'no';
  $SEP = DIRECTORY_SEPARATOR;

  $cache_dir = LOTTERYFACTORY_PATH . 'vendor' . $SEP . LOTTERYFACTORY_VER . $SEP;
  $vendor_source = LOTTERYFACTORY_PATH . 'vendor_source' . $SEP . 'static' . $SEP . 'js' . $SEP;

  if (!file_exists($cache_dir)) {
    $js_files = scandir($vendor_source);
    mkdir($cache_dir, 0777);
    foreach ($js_files as $k => $file) {
      if (is_file($vendor_source . $file)) {
        $filename = basename($file);
        $file_ext = explode(".", $filename);
        $file_ext = strtoupper($file_ext[count($file_ext)-1]);
        if ($file_ext === 'JS') {
          $source = file_get_contents($vendor_source . $filename);
          $count_replace = 0;
          $modified = str_replace(
            array(
              'static/js/',
              './images/',
              'images/'
            ),
            array(
              LOTTERYFACTORY_URL . 'vendor/' . LOTTERYFACTORY_VER . '/static/js/',
              'images/',
              LOTTERYFACTORY_URL . 'vendor_source/images/'
            ),
            $source,
            $count_replace
          );
          file_put_contents($cache_dir . $filename, $modified);
          chmod($cache_dir . $filename, 0777);
        }
      }
    }
  }
}

function lotteryfactory_blockchains() {
  return array(
    'bsc_testnet' => array(
      'chainId'   => 97,
      'rpc'       => 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'title'     => 'Binance Block Chain (ERC20) - Testnet'
    ),
    'matic_testnet' => array(
      'chainId'   => 80001,
      'rpc'       => 'https://rpc-mumbai.maticvigil.com',
      'title'     => 'Poligon Matic - Testnet (mumbai)'
    )
  );
}