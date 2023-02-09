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

function lottery_get_data($lottery_id) {
  $lottery = array();
  foreach( array(
    'blockchain'        => 'matic_testnet',
    'token'             => '',
    'token_name'        => '',
    'token_symbol'      => '',
    'token_decimals'    => '',
    'contract'          => '',
    'last_ticket_price' => '1',
    'last_treasury_fee' => '2',
    'numbers_count'     => '6',
    'hide_footer_header'=> 'true',
    'hide_service_link'=> 'false',
    // default winning percents
    'winning_1'         => '2.5',
    'winning_2'         => '3.75',
    'winning_3'         => '6.25',
    'winning_4'         => '12.5',
    'winning_5'         => '25',
    'winning_6'         => '50',
    'token_price'       => '0',
    'tokenbuy_link'     => '',
    'token_viewdecimals'=> '2',
    /* Custom html code */
    'custom_html_before_head_close'   => '',
    'custom_html_after_body_open'     => '',
    'custom_html_before_body_close'   => ''
  ) as $key => $default) {
    $data = get_post_meta( $lottery_id, $key, true);
    if ( empty( $data ) ) $data = $default;
    $lottery[ $key ] = $data;
  }
  return $lottery;
}

function lottery_default_header($lottery_data) {
  ?>
  <!DOCTYPE html>
  <html class="no-js" <?php language_attributes(); ?>>
    <head>
      <meta charset="<?php bloginfo( 'charset' ); ?>">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" >
      <link rel="profile" href="https://gmpg.org/xfn/11">
      <title><?php echo wp_get_document_title(); ?></title>
      <?php
        if (function_exists( 'wp_robots_sensitive_page' )) {
          // wp_robots_sensitive_page(); // @To-Do need params
        } else {
          wp_sensitive_page_meta();
        }
      ?>
      <style type="text/css">
        HTML, BODY {
          margin: 0;
          padding: 0;
        }
      </style>
      <?php
      if (isset($lottery_data['custom_html_before_head_close'])) {
        echo wp_specialchars_decode( $lottery_data[ 'custom_html_before_head_close' ], ENT_QUOTES );
      }
      ?>
    </head>
    <body>
    <?php
      if (isset($lottery_data['custom_html_after_body_open'])) {
        echo wp_specialchars_decode( $lottery_data[ 'custom_html_after_body_open' ], ENT_QUOTES );
      }
    ?>
  <?php
}

function lottery_default_footer($lottery_data) {
  if (isset($lottery_data['custom_html_before_body_close'])) {
    echo wp_specialchars_decode( $lottery_data[ 'custom_html_before_body_close' ], ENT_QUOTES );
  }
  ?>
    </body>
  </html>
  <?php
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
      'title'     => 'Binance Smart Chain (BEP20) - Testnet',
      'etherscan' => 'https://testnet.bscscan.com'
    ),
    'bsc_mainnet' => array(
      'chainId'   => 56,
      'rpc'       => 'https://bscrpc.com/',
      'title'     => 'Binance Smart Chain (BEP20)',
      'etherscan' => 'https://bscscan.com'
    ),
    'matic_testnet' => array(
      'chainId'   => 80001,
      'rpc'       => 'https://matic-mumbai.chainstacklabs.com',
      'title'     => 'Polygon - Testnet (mumbai)',
      'etherscan' => 'https://mumbai.polygonscan.com'
    ),
    'matic_mainnet' => array(
      'chainId'   => 137,
      'rpc'       => 'https://polygon-rpc.com',
      'title'     => 'Polygon',
      'etherscan' => 'https://polygonscan.com'
    ),
    'eth_goerli'   => array(
      'chainId'   => 5,
      'rpc'       => 'https://goerli.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      'title'     => 'Ethereum - Testnet (goerli)',
      'etherscan' => 'https://goerli.etherscan.io'
    ),
    'eth_mainnet'   => array(
      'chainId'   => 1,
      'rpc'       => 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      'title'     => 'Ethereum',
      'etherscan' => 'https://etherscan.io'
    ),
    'arbeth_testnet' => array(
      'chainId'   => 421611,
      'rpc'       => 'https://rinkeby.arbitrum.io/rpc',
      'title'     => 'Arbitrum Testnet (Rinkeby)',
      'etherscan' => 'https://testnet.arbiscan.io'
    ),
    'arbeth_mainnet' => array(
      'chainId'   => 42161,
      'rpc'       => 'https://arb1.arbitrum.io/rpc',
      'title'     => 'Arbitrum',
      'etherscan' => 'https://arbiscan.io'
    ),
    'xdai_testnet' => array(
      'chainId'   => 77,
      'rpc'       => 'https://sokol.poa.network',
      'title'     => 'DAI Testnet (Sokol)',
      'etherscan' => 'https://blockscout.com/poa/sokol'
    ),
    'xdai_mainnet' => array(
      'chainId'   => 100,
      'rpc'       => 'https://rpc.gnosischain.com',
      'title'     => 'Gnosis Mainnet (xDai)',
      'etherscan' => 'https://blockscout.com/xdai/mainnet'
    ),
    'fantom_testnet' => array(
      'chainId'   => 4002,
      'rpc'       => 'https://rpc.testnet.fantom.network/',
      'title'     => 'Fantom testnet',
      'etherscan' => 'https://testnet.ftmscan.com'
    ),
    'fantom_mainnet' => array(
      'chainId'   => 250,
      'rpc'       => 'https://rpc.ftm.tools/',
      'title'     => 'Fantom',
      'etherscan' => 'https://ftmscan.com'
    ),
    'cronos_testnet' => array(
      'chainId'   => 338,
      'rpc'       => 'https://cronos-testnet-3.crypto.org:8545/',
      'title'     => 'Cronos Testnet',
      'etherscan' => 'https://testnet.cronoscan.com'
    ),
    'cronos_mainnet' => array(
      'chainId'   => 25,
      'rpc'       => 'https://mmf-rpc.xstaking.sg/',
      'title'     => 'Cronos Mainnet',
      'etherscan' => 'https://cronoscan.com'
    ),
    'ethw_mainnet' => array(
      'chainId'   => 10001,
      'rpc'       => 'https://mainnet.ethereumpow.org/',
      'title'     => 'ETHW-mainnet',
      'etherscan' => 'https://www.oklink.com/en/ethw'
    ),
    'kek_mainnet' => array(
      'chainId'   => 420420,
      'rpc'       => 'https://mainnet.kekchain.com/',
      'title'     => 'KeK Chain',
      'etherscan' => 'https://mainnet-explorer.kekchain.com'
    ),
  );
}
