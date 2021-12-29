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

	$my_css_ver = gmdate( 'ymd-Gis', filemtime( LOTTERYFACTORY_PATH . 'assets/css/lotteryfactory.css' ) );

	wp_enqueue_style( 'lotteryfactory-css', LOTTERYFACTORY_URL . 'assets/css/lotteryfactory.css', false, $my_css_ver );

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

      wp_localize_script('lotteryfactory-admin', 'lotteryfactory',
        array(
          'ajaxurl' => admin_url( 'admin-ajax.php' ),
          'nonce'   => wp_create_nonce( 'lotteryfactory-nonce' ),
        )
      );
		}
	}

}
add_action( 'admin_enqueue_scripts', 'lotteryfactory_admin_scripts' );
