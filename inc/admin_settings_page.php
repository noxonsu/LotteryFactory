<?php
/**
 * Add Lottery settings page
 */
function lotteryfactory_menu_page() {
	$menu_page = add_menu_page(
		esc_html__( 'Lottery Factory', 'lotteryfactory' ),
		esc_html__( 'Lottery Factory', 'lotteryfactory' ),
		'manage_options',
		'lotteryfactory',
		'lotteryfactory_settings_page_view',
		'dashicons-swap-logo',
		81
	);
}
add_action( 'admin_menu', 'lotteryfactory_menu_page' );

function lotteryfactory_frontsettings_menu_page() {
	add_submenu_page(
		'lotteryfactory',
		esc_html__( 'Front settings', 'lotteryfactory' ),
		esc_html__( 'Front settings', 'lotteryfactory' ),
		'manage_options',
		'lotteryfactory_frontsettings',
		'lotteryfactory_frontsettings_page',
		1
	);
}
add_action('admin_menu', 'lotteryfactory_frontsettings_menu_page');

function lottery_page_slug(){
	$slug = 'lotteryfactory';
	if( get_option('lotteryfactory_slug') ) {
		$slug = get_option('lotteryfactory_slug');
	}
	return esc_html( $slug );
}
function lotteryfactory_frontsettings_page() {

  ?>
  <div class="wrap lottery_options">
    <table class="form-table">
      <tr>
				<th scope="row">
					<label><?php esc_html_e( 'Permalink', 'lotteryfactory' );?></label>
				</th>
				<td>
					<code><?php echo esc_url( home_url('/') );?></code>
					<input name="page_slug" type="text" value="<?php echo esc_attr( lottery_page_slug() );?>" class="regular-text code lotteryfactory-page-slug" <?php disabled( get_option( 'lotteryfactory_is_home' ), 'true' ); ?>>
					<code>/</code>
					<a href="<?php echo lottery_page_slug();  ?>" class="button mcwallet-button-url<?php if( get_option( 'lotteryfactory_is_home' ) ) { echo ' disabled';}?>" target="_blank">
            <?php esc_html_e( 'View page', 'lotteryfactory' );?>
          </a>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Use as home page', 'lotteryfactory' );?></label>
				</th>
				<td>
					<label for="mcwallet_is_home">
						<input name="is_home" type="checkbox" id="lotteryfactory_is_home" value="true" <?php checked( 'true', get_option( 'lotteryfactory_is_home' ) ); ?>>
						<?php esc_html_e( 'Use LotteryFactory as home page.', 'lotteryfactory' );?>
					</label>
				</td>
			</tr>
      <tr>
				<th scope="row"></th>
				<td>
					<?php
						submit_button( esc_attr__( 'Update options', 'lotteryfactory' ), 'primary', 'lotteryfactory-update-options', false );
					?>
          <script type="text/javascript">
            (($) => {
              $('#lotteryfactory-update-options').bind('click', (e) => {
                e.preventDefault();
                var thisBtn  = $(this);
                var thisParent = $('.lottery_options');
                var pageSlug = thisParent.find( '[name="page_slug"]' ).val();
                var pageHome = thisParent.find( '[name="is_home"]' );
                var ishome = 'false';
                if ( pageHome.is(':checked') ) {
                  ishome = 'true';
                }
                var data = {
                  action: 'lotteryfactory_update_pageoptions',
                  nonce: "<?php echo wp_create_nonce( 'lotteryfactory-nonce' )?>",
                  slug: pageSlug,
                  ishome: ishome,
                }
                $.post( "<?php echo admin_url( 'admin-ajax.php' ) ?>", data, function(response) {
                  alert('Saved');
                });
              })
            })(jQuery)
          </script>
				</td>
			</tr>
    </table>
  </div>
  <?php
}
/**
 * Main Settings Page
 */
function lotteryfactory_settings_page_view() {

  $settings_url = LOTTERYFACTORY_URL . "staticbuild/settings.html?isSettingsFrame=true";
?>

<div class="wrap">
  <style type="text/css">
    .lotterySettingsIframe {
      background: transparent;
      width: 100%;
      height: 800px;
    }
  </style>
  <div>
    <iframe class="lotterySettingsIframe" src="<?php echo $settings_url ?>"></iframe>
  </div>
</div>

<?php
}

function lotteryfactory_add_rewrite_rules() {
	$slug = 'lotteryfactory';
	if ( get_option('lotteryfactory_slug') ) {
		$slug = get_option('lotteryfactory_slug');
	}
	add_rewrite_rule( $slug . '/?$', 'index.php?lotteryfactory_page=1','top' );
}
add_action('init', 'lotteryfactory_add_rewrite_rules');
/**
 * Update options
 */
function lotteryfactory_update_pageoptions() {

	/* Check nonce */
	check_ajax_referer( 'lotteryfactory-nonce', 'nonce' );
  if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}
  
  if ( untrailingslashit( $_POST['slug'] ) ) {
    $slug = untrailingslashit( sanitize_title( $_POST['slug'] ) );
  }
  if ( $_POST['ishome'] == 'true' ) {
    update_option( 'lotteryfactory_is_home', sanitize_text_field( $_POST['ishome'] ) );
    $is_home = 'true';
  } else {
    delete_option( 'lotteryfactory_is_home' );
  }
  
  lotteryfactory_add_rewrite_rules();
  flush_rewrite_rules();

	$result_arr = array(
		'status'   => 'ok'
	);

	wp_send_json( $result_arr );

}
add_action( 'wp_ajax_lotteryfactory_update_pageoptions', 'lotteryfactory_update_pageoptions' );


function lotteryfactory_admin_enqueue_scripts( $hook ) {
  /* Translatable string */
  wp_localize_script('lotteryfactory-admin', 'lotteryfactory',
    array(
      'ajaxurl' => admin_url( 'admin-ajax.php' ),
      'nonce'   => wp_create_nonce( 'lotteryfactory-nonce' ),
    )
  );

}
add_action( 'admin_enqueue_scripts', 'lotteryfactory_admin_enqueue_scripts' );