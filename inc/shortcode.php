<?php
/**
 * Shortcodes
 *
 * @package Lottery Factory
 */

/**
 * Fram inline scripts
 *
 * @param number $id Pos id.
 */
function lotteryfactory_shortcode_inline_scripts( $id ) {
  /*
	$inline_scripts  = "\n";
	$inline_scripts .= "\t" . 'const widget' . esc_js( $id ) . ' = new farmFactory.Widget({' . "\n";
	$inline_scripts .= "\t\t" . 'selector: "ff-widget-' . esc_js( $id ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'farmAddress: "' . get_post_meta( $id, 'farm_address', true ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'rewardsAddress: "' . get_post_meta( $id, 'reward_address', true ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'stakingAddress: "' . get_post_meta( $id, 'staking_address', true ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'apy: "' . get_post_meta( $id, 'farm_apy', true ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'apyLabel: "' . get_post_meta( $id, 'farm_apy_label', true ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'rewardsTokenIcon: "' . get_the_post_thumbnail_url( $id, 'medium' ) . '",' . "\n";
	$inline_scripts .= "\t\t" . 'stakingTokenIcon: "' . wp_get_attachment_image_url( get_post_meta( $id, '_farm_thumbnail_id', true ), 'medium' ) . '",' . "\n";
	$inline_scripts .= "\t" . '});' . "\n";
  */
  $ver = wp_rand( 1, 2222222 );

  //// wp_enqueue_script( 'lotteryfactory-front-chunk', LOTTERYFACTORY_URL . 'vendor/static/js/2.e3d2bd83.chunk.js', array(), '1.0.0', true );
  //// wp_enqueue_script( 'lotteryfactory-front-main', LOTTERYFACTORY_URL . 'vendor/static/js/main.3ea37187.chunk.js', array(), '1.0.0', true );
  $inline_scripts = '/* script */';
  ob_start();
  ?>
  /* out script */
  var boo = 'foo';
  <?php
  $inline_scripts = ob_get_clean();
	return $inline_scripts;
}

/**
 * Main Shortcode
 */
function lotteryfactory_main_shortcode( $atts ) {

	$atts = shortcode_atts( array(
		'id' => null,
	), $atts );

	$id             = $atts['id'];
  $lottery = array();
  foreach( array(
    'blockchain'        => 'matic_testnet',
    'token'             => '',
    'token_name'        => '',
    'token_symbol'      => '',
    'token_decimals'    => '',
    'contract'          => '',
    'last_ticket_price' => '1',
    'last_treasury_fee' => '2'
  ) as $key => $default) {
    $data = get_post_meta( $id, $key, true);
    if ( empty( $data ) ) $data = $default;
    $lottery[ $key ] = $data;
  }
	$html           = '';
	$lotteryfactory          = wp_count_posts( 'lotteryfactory' )->publish;
	$inline_scripts = '';
	$html_before    = '<div class="ff-widgets-container">';
	$html_after     = '</div>';

	if ( null !== $id && get_post( $id ) ) {

		$inline_scripts = lotteryfactory_shortcode_inline_scripts( $id );

		$html = '<div id="ff-widget-' . esc_attr( $id ) . '"></div>';

	} elseif ( null === $id ) {

		$lotteryfactory_args  = array(
			'post_type'      => 'lotteryfactory',
			'posts_per_page' => -1,
		);
		$lotteryfactory_query = new WP_Query( $lotteryfactory_args );

		if ( $lotteryfactory_query->have_posts() ) :
			while ( $lotteryfactory_query->have_posts() ) :
				$lotteryfactory_query->the_post();
				$id = get_the_ID();

				$inline_scripts .= lotteryfactory_shortcode_inline_scripts( $id );

				$html .= '<div id="ff-widget-' . esc_attr( $id ) . '"></div>';

			endwhile;
		endif;

		wp_reset_postdata();

	}

	if ( $lotteryfactory ) {
		$html = $html_before . $html . $html_after;
		wp_add_inline_script( 'lotteryfactory-js', $inline_scripts, 'after' );
	}

  $relative_path = './';

  $lottery_chain = lotteryfactory_blockchains()[$lottery['blockchain']];
  lotteryfactory_prepare_vendor();
  ob_start();
  ?>
  <div id="root" class="alignfull"></div>
  <div id="portal-root"></div>
  <script>
    window.SO_LotteryConfig = {
    chainId: <?php echo $lottery_chain['chainId']?>,
    rpc: "<?php echo $lottery_chain['rpc']?>",
    contract: "<?php echo $lottery['contract']?>",
    token: {
      symbol: "<?php echo $lottery['token_symbol']?>",
      address: "<?php echo $lottery['token']?>",
      decimals: "<?php echo $lottery['token_decimals']?>",
      title: "<?php echo $lottery['token_name']?>",
      price: 1
    }
  }
  </script>
  <script>!function(e){function r(r){for(var n,a,i=r[0],c=r[1],l=r[2],p=0,s=[];p<i.length;p++)a=i[p],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&s.push(o[a][0]),o[a]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(f&&f(r);s.length;)s.shift()();return u.push.apply(u,l||[]),t()}function t(){for(var e,r=0;r<u.length;r++){for(var t=u[r],n=!0,i=1;i<t.length;i++){var c=t[i];0!==o[c]&&(n=!1)}n&&(u.splice(r--,1),e=a(a.s=t[0]))}return e}var n={},o={1:0},u=[];function a(r){if(n[r])return n[r].exports;var t=n[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,a),t.l=!0,t.exports}a.e=function(e){var r=[],t=o[e];if(0!==t)if(t)r.push(t[2]);else{var n=new Promise((function(r,n){t=o[e]=[r,n]}));r.push(t[2]=n);var u,i=document.createElement("script");i.charset="utf-8",i.timeout=120,a.nc&&i.setAttribute("nonce",a.nc),i.src=function(e){return "<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/"+({}[e]||e)+".chunk.js"}(e);var c=new Error;u=function(r){i.onerror=i.onload=null,clearTimeout(l);var t=o[e];if(0!==t){if(t){var n=r&&("load"===r.type?"missing":r.type),u=r&&r.target&&r.target.src;c.message="Loading chunk "+e+" failed.\n("+n+": "+u+")",c.name="ChunkLoadError",c.type=n,c.request=u,t[1](c)}o[e]=void 0}};var l=setTimeout((function(){u({type:"timeout",target:i})}),12e4);i.onerror=i.onload=u,document.head.appendChild(i)}return Promise.all(r)},a.m=e,a.c=n,a.d=function(e,r,t){a.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,r){if(1&r&&(e=a(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(a.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var n in e)a.d(t,n,function(r){return e[r]}.bind(null,n));return t},a.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(r,"a",r),r},a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},a.p="/",a.oe=function(e){throw console.error(e),e};var i=this["webpackJsonppancake-frontend"]=this["webpackJsonppancake-frontend"]||[],c=i.push.bind(i);i.push=r,i=i.slice();for(var l=0;l<i.length;l++)r(i[l]);var f=c;t()}([])</script>
  <script src="<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/2.chunk.js"></script>
  <script src="<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/main.chunk.js"></script>
  <?php
  $ret = ob_get_clean();
  return $ret;
	return $html;
}
add_shortcode( 'lotteryfactory', 'lotteryfactory_main_shortcode' );
