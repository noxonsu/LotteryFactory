<?php
/**
 * Add Lottery settings page
 */
function lotteryfactory_menu_page() {
	$menu_page = add_menu_page(
		esc_html__( 'LotteryFactory', 'lotteryfactory' ),
		esc_html__( 'LotteryFactory', 'lotteryfactory' ),
		'manage_options',
		'lotteryfactory',
		'lotteryfactory_settings_page_view',
		'dashicons-swap-logo',
		81
	);
}
add_action( 'admin_menu', 'lotteryfactory_menu_page' );

/**
 * Page
 */
function lotteryfactory_settings_page_view() {

  $settings_url = LOTTERYFACTORY_URL . "/staticbuild/settings.html?isSettingsFrame=true";
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
