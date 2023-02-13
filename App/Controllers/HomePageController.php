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
      $lottery_at_homepage = get_option( 'lotteryfactory_is_home', 'false');

      if ($lottery_at_homepage !== 'false') {
        return LOTTERYFACTORY_PATH . 'templates' . DIRECTORY_SEPARATOR . 'lotterypage.php';
      }
    }
    return $template;
	}





}
