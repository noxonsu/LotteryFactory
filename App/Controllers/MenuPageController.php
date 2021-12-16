<?php
namespace LOTTERYFACTORY\Controllers;

use LOTTERYFACTORY\Controller;

class MenuPageController extends Controller
{

	/**
	 *
	 */
	public function handle()
	{
		add_action('admin_menu', array($this, 'menu'));

	}

	public function menu()
	{
    /*
		add_submenu_page(
			'edit.php?post_type=lotteryfactory',
			esc_html__('Lottery settings', 'lotteryfactory'),
			esc_html__('Lottery settings', 'lotteryfactory'),
			'manage_options',
			'LOTTERYFACTORY',
			[$this, 'page']
		);
    */
	}

	public function page()
	{
		$this->handleRequest();
    echo "CALL PAGE";
		$this->view->display('/settings.php');

	}

	public function handleRequest()
	{
    /*
		if ( isset( $_POST['farmfactory_networkName'] ) && ! empty( $_POST['farmfactory_networkName'] ) ) {
			update_option( 'farmfactory_networkName', $_POST['farmfactory_networkName'] );
		}

		if ( isset( $_POST['farmfactory_infura_id'] ) && ! empty( $_POST['farmfactory_infura_id'] ) ) {
			update_option( 'farmfactory_infura_id', $_POST['farmfactory_infura_id'] );
		}

		if ( isset( $_POST['farmfactory_fortmatic_key'] ) && ! empty( $_POST['farmfactory_fortmatic_key'] ) ) {
			update_option( 'farmfactory_fortmatic_key', $_POST['farmfactory_fortmatic_key'] );
		}

		if ( ! empty( $_POST) ) {
			?>
			<div class="updated notice is-dismissible">
				<p><?php esc_html_e( 'Settings saved', 'farmfactory' ); ?></p>
			</div>
			<?php
		}
    */
	}

}
