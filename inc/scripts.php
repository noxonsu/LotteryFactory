<?php
/**
 * Enqueue Scripts
 *
 * @package Lottery Factory
 */

/**
 * Never worry about cache again!
 */
function lotteryfactory_load_scripts() {

	wp_register_script( 'web3', LOTTERYFACTORY_URL . 'assets/js/web3.min.js', array(), '1.2.11', true );
	wp_register_script( 'web3modal', LOTTERYFACTORY_URL . 'assets/js/web3modal.min.js', array(), '1.9.4', true );
	wp_register_script( 'bignumber', LOTTERYFACTORY_URL . 'assets/js/bignumber.min.js', array(), '8.0.2', true );
	wp_register_script( 'web3-provider', LOTTERYFACTORY_URL . 'assets/js/web3-provider.min.js', array(), '1.2.1', true );
	wp_register_script( 'fortmatic', LOTTERYFACTORY_URL . 'assets/js/fortmatic.js', array(), '2.0.6', true );

	$dependencies = array(
		'web3',
		'web3modal',
		'bignumber',
		'web3-provider',
		'fortmatic'
	);

	// create my own version codes.
	$my_js_ver  = gmdate( 'ymd-Gis', filemtime( LOTTERYFACTORY_PATH . 'lib/farmfactory.js' ) );
	$my_css_ver = gmdate( 'ymd-Gis', filemtime( LOTTERYFACTORY_PATH . 'assets/css/farmfactory.css' ) );

	wp_enqueue_script( 'lotteryfactory-js', LOTTERYFACTORY_URL . 'lib/farmfactory.js', $dependencies, $my_js_ver, true );
  wp_enqueue_script( 'token-price', LOTTERYFACTORY_URL . 'assets/js/token-price.js', array(), '1.0.0', true);

	wp_enqueue_style( 'lotteryfactory-css', LOTTERYFACTORY_URL . 'assets/css/farmfactory.css', false, $my_css_ver );

	if ( wp_count_posts( 'lotteryfactory' ) ) {
/*
	$inline_scripts = '
	var networkName = "' . get_option( 'farmfactory_networkName', 'ropsten' ) . '";

	var chainIds = {
	  "mainnet": 1,
    "ropsten": 3,
    "rinkeby": 4,
    "kovan": 42,
    "bsc": 56,
    "bsc_test": 97,
    "matic": 137,
    "matic_test": 80001,
    "xdai": 100,
    "aurora": 1313161554
	};

	var chainId = chainIds[networkName.toLowerCase()];

	var walletConnectOptions;

	if (chainId === 56 || chainId === 97) {
	  walletConnectOptions = {
      infuraId: "' . get_option( 'farmfactory_infura_id', farmfactory_default_infura_id() ) . '",
      rpc: {
        56: "https://bsc-dataseed1.binance.org:443",
      },
      network: "binance",
    };
	}
	else {
	  walletConnectOptions = {
	    infuraId: "' . get_option( 'farmfactory_infura_id', farmfactory_default_infura_id() ) . '",
	  }
	}

	farmFactory.init({
		networkName: networkName,
		wallet: {
			providerOptions: {
				walletconnect: {
					package: window.WalletConnectProvider.default,
					options: walletConnectOptions,
				},
				fortmatic: {
					package: window.Fortmatic,
					options: {
						key: "' . get_option( 'farmfactory_fortmatic_key_deprecated' ) . '",
					},
				},
			},
		},
	});
	';

	wp_add_inline_script( 'farmfactory-js', $inline_scripts, 'after' );
  */
	}

}
add_action('wp_enqueue_scripts', 'lotteryfactory_load_scripts');

/**
 * Admin Enqueue Scripts
 *
 * @param string $hook Current page.
 */
function lotteryfactory_admin_scripts( $hook ) {

	global $typenow;

	if ( 'post-new.php' === $hook || 'post.php' === $hook || 'toplevel_page_LOTTERYFACTORY' === $hook ) {
		if ( 'toplevel_page_LOTTERYFACTORY' === $hook || 'lotteryfactory' === $typenow ) {

			wp_enqueue_style( 'lotteryfactory-admin', LOTTERYFACTORY_URL . 'assets/css/lotteryfactory-admin.css', false, LOTTERYFACTORY_VER );

			$ver = wp_rand( 1, 2222222 );

			wp_enqueue_script( 'lotteryfactory-deployer', LOTTERYFACTORY_URL . 'lib/lotterydeployer.js', array(), $ver, true );

			wp_enqueue_script( 'lotteryfactory-admin', LOTTERYFACTORY_URL . 'assets/js/lotteryfactory-admin.js', array( 'lotteryfactory-deployer' ), $ver, true );

			$post_type_object = get_post_type_object( $typenow );

      
		}
	}

}
add_action( 'admin_enqueue_scripts', 'lotteryfactory_admin_scripts' );
