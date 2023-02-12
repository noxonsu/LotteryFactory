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

function lotteryfactory_frontsettings_page() {

  ?>
  <div class="wrap">
    Lottery page settings
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
      height: 640px;
    }
  </style>
  <div>
    <iframe class="lotterySettingsIframe" src="<?php echo $settings_url ?>"></iframe>
  </div>
</div>

<?php
}
