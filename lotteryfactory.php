<?php
/**
Plugin Name: Lottery Factory
Description: Blockchain Lottery
Requires PHP: 7.1
Text Domain: lotteryfactory
Domain Path: /lang
Version: 1.2.2
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
/* Define Plugin Constants */
defined( 'ABSPATH' ) || exit;
define( 'LOTTERYFACTORY_TEMPLATE_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'templates' );
define( 'LOTTERYFACTORY_BASE_DIR', __DIR__ );
define( 'LOTTERYFACTORY_BASE_FILE', __FILE__ );
define( 'LOTTERYFACTORY_PATH', plugin_dir_path( __FILE__ ) );

$plugin_url = plugins_url('', __FILE__);

// Check if the site is accessed via HTTPS and adjust the URL if necessary
if ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
    $plugin_url = str_replace('http://', 'https://', $plugin_url)."/";
}
echo $plugin_url;
die(); 
define( 'LOTTERYFACTORY_URL', $plugin_ur);
define( 'LOTTERYFACTORY_VER', '1.2.2');

/**
 * Plugin Init
 */
require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'init.php';
