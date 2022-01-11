<?php
namespace LOTTERYFACTORY\Controllers;

use LOTTERYFACTORY\Controller;


class HomePageController extends Controller {


	/**
	 *
	 */
	public function handle() {
		add_action( 'template_include', array( $this, 'template' ) );


	}

	public function template($template) {
    if (is_front_page()) {
      $lottery_at_homepage = get_option( 'lotteryfactory_id_at_homepage', 'false');

      if (($lottery_at_homepage !== 'false') and is_numeric($lottery_at_homepage)) {
        return LOTTERYFACTORY_PATH . 'templates' . DIRECTORY_SEPARATOR . 'homepage.php';
      }
    }
    return $template;
	}





}
