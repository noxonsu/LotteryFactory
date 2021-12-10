<?php
defined( 'ABSPATH' ) || exit;

spl_autoload_register( function ( $class ) {

	if ( strpos( $class, 'LOTTERYFACTORY' ) !== false ) {
		require __DIR__ . '/../' . str_replace( [ '\\', 'LOTTERYFACTORY' ], [ '/', 'App' ], $class ) . '.php';

	}
} );

foreach ( glob( __DIR__ . '/Controllers/*.php' ) as $file ) {
	$class = '\LOTTERYFACTORY\Controllers\\' . basename( $file, '.php' );
	if ( class_exists( $class ) ) {
		$obj = new $class;
	}

}