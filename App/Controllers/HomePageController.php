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

        return $template;
	}





}
