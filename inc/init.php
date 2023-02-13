<?php
/**
 * Lottery Factory Init
 *
 * @package Lottery Factory
 */

/**
 * Init
 */
require LOTTERYFACTORY_PATH . 'App' . DIRECTORY_SEPARATOR . 'autoload.php';

/**
 * Functions
 */
require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'functions.php';

/**
 * Ajax
 */
require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'admin-ajax.php';

/**
 * Enqueue Scripts
 */
// require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'scripts.php';

/**
 * Shortcodes
 */
// require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'shortcode.php';

/**
 * MetaBox
 */
// require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'metabox.php';

/**
 * Post Type
 */
// require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'post-type.php';


require LOTTERYFACTORY_PATH . 'inc' . DIRECTORY_SEPARATOR . 'admin_settings_page.php';
