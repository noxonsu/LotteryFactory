<?php
/**
 * Post Type
 *
 * @package Lottery Factory
 */

/**
 * Register Post Type lotteryfactory
 */
function lotteryfactory_post_type() {

	$labels = array(
		'name'                  => esc_html__( 'Lottery', 'lotteryfactory' ),
		'singular_name'         => esc_html__( 'Lottery', 'lotteryfactory' ),
		'menu_name'             => esc_html__( 'Lottery', 'lotteryfactory' ),
		'name_admin_bar'        => esc_html__( 'Lottery', 'lotteryfactory' ),
		'all_items'             => esc_html__( 'All Lotteries', 'lotteryfactory' ),
		'add_new_item'          => esc_html__( 'Add New Lottery', 'lotteryfactory' ),
		'add_new'               => esc_html__( 'Add New', 'lotteryfactory' ),
		'new_item'              => esc_html__( 'New Lottery', 'lotteryfactory' ),
		'edit_item'             => esc_html__( 'Edit Lottery', 'lotteryfactory' ),
    'view_item'             => esc_html__( 'View Lottery', 'lotteryfactory' ),
		'update_item'           => esc_html__( 'Update Lottery', 'lotteryfactory' ),
		'search_items'          => esc_html__( 'Search Lottery', 'lotteryfactory' ),
		'not_found'             => esc_html__( 'Not found', 'lotteryfactory' ),
		'not_found_in_trash'    => esc_html__( 'Not found in Trash', 'lotteryfactory' ),
	);
	$args   = array(
		'labels'             => $labels,
		'supports'           => array( 'title', 'thumbnail' ),
		'hierarchical'       => false,
		'public'             => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_admin_bar'  => false,
		'show_in_nav_menus'  => false,
		'can_export'         => true,
		'publicly_queryable' => true,
		'capability_type'    => 'post',
		'menu_icon'          => 'dashicons-admin-site-alt3',
	);
	register_post_type( 'lotteryfactory', $args );
  flush_rewrite_rules( false );
}
add_action( 'init', 'lotteryfactory_post_type' );

function lottery_custom_template($single) {

    global $post;

    /* Checks for single template by post type */
    if ( $post->post_type == 'lotteryfactory' ) {
      return LOTTERYFACTORY_PATH . 'templates/singlepage.php';
      //die('this');
    }

    return $single;

}

add_filter('single_template', 'lottery_custom_template');


/**
 * Remove date from posts column
 *
 * @param array $columns Columns.
 */
function lotteryfactory_remove_date_column( $columns ) {
	unset( $columns['date'] );
	return $columns;
}
add_filter( 'manage_lotteryfactory_posts_columns', 'lotteryfactory_remove_date_column' );

/**
 * Remove quick edit
 *
 * @param array  $actions Actions.
 * @param object $post Post.
 */
function lotteryfactory_remove_quick_edit( $actions, $post ) {
	if ( 'lotteryfactory' === $post->post_type ) {
		unset( $actions['inline hide-if-no-js'] );
	}
	return $actions;
}
add_filter( 'post_row_actions', 'lotteryfactory_remove_quick_edit', 10, 2 );
