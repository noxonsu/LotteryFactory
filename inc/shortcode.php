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
  ob_start();
  echo '<pre>';
  print_r($atts);
  print_r($lottery);
  print_r($lottery_chain);
  echo '</pre>';
  ?>
  <strong>THISSSS <?php echo LOTTERYFACTORY_URL?></strong>
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
  <script>!function(e){function r(r){for(var n,u,i=r[0],c=r[1],f=r[2],p=0,s=[];p<i.length;p++)u=i[p],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&s.push(o[u][0]),o[u]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(l&&l(r);s.length;)s.shift()();return a.push.apply(a,f||[]),t()}function t(){for(var e,r=0;r<a.length;r++){for(var t=a[r],n=!0,i=1;i<t.length;i++){var c=t[i];0!==o[c]&&(n=!1)}n&&(a.splice(r--,1),e=u(u.s=t[0]))}return e}var n={},o={1:0},a=[];function u(r){if(n[r])return n[r].exports;var t=n[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,u),t.l=!0,t.exports}u.e=function(e){var r=[],t=o[e];if(0!==t)if(t)r.push(t[2]);else{var n=new Promise((function(r,n){t=o[e]=[r,n]}));r.push(t[2]=n);var a,i=document.createElement("script");i.charset="utf-8",i.timeout=120,u.nc&&i.setAttribute("nonce",u.nc),i.src=function(e){return u.p+"<?php echo $relative_path?>/vendor/static/js/"+({}[e]||e)+"."+{3:"adfd545b",4:"8a5a3952",5:"c33fb961",6:"778397f2",7:"16d634a1"}[e]+".chunk.js"}(e);var c=new Error;a=function(r){i.onerror=i.onload=null,clearTimeout(f);var t=o[e];if(0!==t){if(t){var n=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;c.message="Loading chunk "+e+" failed.\n("+n+": "+a+")",c.name="ChunkLoadError",c.type=n,c.request=a,t[1](c)}o[e]=void 0}};var f=setTimeout((function(){a({type:"timeout",target:i})}),12e4);i.onerror=i.onload=a,document.head.appendChild(i)}return Promise.all(r)},u.m=e,u.c=n,u.d=function(e,r,t){u.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},u.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,r){if(1&r&&(e=u(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(u.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var n in e)u.d(t,n,function(r){return e[r]}.bind(null,n));return t},u.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return u.d(r,"a",r),r},u.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},u.p="<?php echo LOTTERYFACTORY_URL?>",u.oe=function(e){throw console.error(e),e};var i=this["webpackJsonppancake-frontend"]=this["webpackJsonppancake-frontend"]||[],c=i.push.bind(i);i.push=r,i=i.slice();for(var f=0;f<i.length;f++)r(i[f]);var l=c;t()}([])</script>
  <script src="<?php echo LOTTERYFACTORY_URL?>/vendor/static/js/2.e3d2bd83.chunk.js"></script>
  <script src="<?php echo LOTTERYFACTORY_URL?>/vendor/static/js/main.3ea37187.chunk.js"></script>
  <?php
  $ret = ob_get_clean();
  return $ret;
	return $html;
}
add_shortcode( 'lotteryfactory', 'lotteryfactory_main_shortcode' );
