<?php
/**
Plugin Name: Lottery Factory
Description: Blockchain Lottery
Requires PHP: 7.1001
Text Domain: lotteryfactory
Domain Path: /lang
Version: 1.1.1105
 */

/* Define Plugin Constants */
defined( 'ABSPATH' ) || exit;
define( 'LOTTERYFACTORY_TEMPLATE_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'templates' );
define( 'LOTTERYFACTORY_BASE_DIR', __DIR__ );
define( 'LOTTERYFACTORY_BASE_FILE', __FILE__ );
define( 'LOTTERYFACTORY_PATH', plugin_dir_path( __FILE__ ) );
define( 'LOTTERYFACTORY_URL', plugin_dir_url( __FILE__ ) );
define( 'LOTTERYFACTORY_VER', '1.1.1105');

/**
 * Plugin Init
 */
require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'init.php';
