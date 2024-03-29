<?php
/**
 * Shortcodes
 *
 * @package Lottery Factory
 */

function lotteryfactory_notconfigured($errors, $hide_footer_header) {
  ob_start();
  ?>
  <style type="text/css">
    .lottery-error-holder {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      left: 0px;
      top: 0px;
      bottom: 0px;
      right: 0px;
    }
    .lottery-error-view {
      display: block;
      width: 100%;
    }
    .lottery-error-view SPAN {
      display: block;
      text-align: center;
      font-size: 30pt;
      font-family: Arial;
      color: #c30303;
    }
    .lottery-error-view STRONG {
      display: block;
      text-align: center;
      font-size: 14pt;
      font-family: sans-serif;
      color: #2c2c2c;
    }
  </style>
  <?php echo (!$hide_footer_header) ? '<div class="lottery-error-holder">' : '' ?>
    <div class="lottery-error-view">
      <span><?php echo esc_html__( 'Lottery not configured' , 'lotteryfactory'); ?></span>
      <?php
      foreach ($errors as $k=>&$error) {
        ?><strong><?php echo $error?></strong><?php
      }
      ?>
    </div>
  <?php echo (!$hide_footer_header) ? '</div>' : '' ?>
  
  <?php
  return ob_get_clean();
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
    'blockchain'        => 'eth_rinkeby',
    'token'             => '',
    'token_name'        => '',
    'token_symbol'      => '',
    'token_decimals'    => '',
    'contract'          => '',
    'last_ticket_price' => '1',
    'last_treasury_fee' => '2',
    'hide_footer_header'=> 'true',
    'hide_service_link' => 'false',
    'numbers_count'     => '6',
    'token_price'       => '0',
    'tokenbuy_link'     => '',
    'token_viewdecimals'=> '2',
    // wining percents and burn amount
    'winning_1'         => '2.5',
    'winning_2'         => '3.75',
    'winning_3'         => '6.25',
    'winning_4'         => '12.5',
    'winning_5'         => '25',
    'winning_6'         => '50',
    'last_treasury_fee' => '2',
  ) as $key => $default) {
    $data = get_post_meta( $id, $key, true);
    if ( empty( $data ) ) $data = $default;
    $lottery[ $key ] = $data;
  }

  $errors = array();
  if (!$lottery['blockchain']) $errors[] = esc_html__( 'Blockchain not specified', 'lotteryfactory');
  if (!$lottery['contract']) $errors[] = esc_html__( 'Lottery contract not deployed', 'lotteryfactory');
  if (!$lottery['token']) $errors[] = esc_html__( 'Lottery token not specified', 'lotteryfactory');
  if (count($errors)) return lotteryfactory_notconfigured($errors, ($lottery['hide_footer_header'] == 'false'));
  /*
    Формула расчета реальных процентов выиграша с учетом админ-фи
    admin_fee = last_treasury_fee = burn
    win = winning_1(2,3,4,5,6)
    burn_part = 100 / burn
    win_part = (100 - burn) / burn
    real_win = win / burn_part * win_part
  */
  $burn = floatval($lottery['last_treasury_fee']);
  $burn_part = 100 / $burn;
  $win_part = (100 - $burn) / $burn;
  $winning_1 = floatval($lottery['winning_1']) / $burn_part * $win_part;
  $winning_2 = floatval($lottery['winning_2']) / $burn_part * $win_part;
  $winning_3 = floatval($lottery['winning_3']) / $burn_part * $win_part;
  $winning_4 = floatval($lottery['winning_4']) / $burn_part * $win_part;
  $winning_5 = floatval($lottery['winning_5']) / $burn_part * $win_part;
  $winning_6 = floatval($lottery['winning_6']) / $burn_part * $win_part;
  
  $lottery_chain = lotteryfactory_blockchains()[$lottery['blockchain']];
  lotteryfactory_prepare_vendor();
  ob_start();
  ?>
  <style>
    /*
    #root::before,
    #root::after,
    #root *::before,
    #root *::after {
      all: unset;
    }/*
    #root * {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      vertical-align: baseline;
    }
    */

    /*
    article, aside, details, figcaption, figure, 
    footer, header, hgroup, menu, nav, section {
      display: block;
    }
    body {
      line-height: 1;
      font-size: 16px;
    }
    ol,
    ul {
      list-style: disc;
      list-style-position: inside;
    }
    blockquote,
    q {
      quotes: none;
    }
    blockquote:before,
    blockquote:after,
    q:before,
    q:after {
      content: "";
      content: none;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    [role="button"] {
      cursor: pointer;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    * {
      font-family: 'Kanit', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }


    input[type=range] {
      -webkit-appearance: none; 
      width: 100%;
      background: transparent;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-ms-track {
      width: 100%;
      cursor: pointer;
      background: transparent; 
      border-color: transparent;
      color: transparent;
    }
    */
  </style>
  <div id="lottery-style-holder"></div>
  <div id="root" class="alignfull"></div>
  <div id="portal-root"></div>
  <script>
    window.SO_LotteryConfig = {
      chainId: <?php echo $lottery_chain['chainId']?>,
      chainName: "<?php echo $lottery_chain['title']?>",
      rpc: "<?php echo $lottery_chain['rpc']?>",
      etherscan: "<?php echo $lottery_chain['etherscan']?>",
      contract: "<?php echo $lottery['contract']?>",
      token: {
        symbol: "<?php echo $lottery['token_symbol']?>",
        address: "<?php echo $lottery['token']?>",
        decimals: "<?php echo $lottery['token_decimals']?>",
        title: "<?php echo $lottery['token_name']?>",
        price: <?php echo ($lottery['token_price'] !== '0') ? "parseFloat(${lottery['token_price']})" : "false"; ?>,
        viewDecimals: <?php echo $lottery['token_viewdecimals'];?>
      },
      buyTokenLink: <?php echo ($lottery['tokenbuy_link'] !== '') ? '"' . $lottery['tokenbuy_link'] . '"' : "false"; ?>,
      numbersCount: parseInt("<?php echo $lottery['numbers_count']?>", 10),
      hideServiceLink: <?php echo ($lottery['hide_service_link'] === 'true') ? "true" : "false" ; ?>,
      winPercents: {
        burn: <?php echo $burn?>,
        match_1: <?php echo $winning_1?>,
        match_2: <?php echo $winning_2?>,
        match_3: <?php echo $winning_3?>,
        match_4: <?php echo $winning_4?>,
        match_5: <?php echo $winning_5?>,
        match_6: <?php echo $winning_6?>
      }
    }
  </script>
  <script>!function(e){function r(r){for(var n,a,i=r[0],c=r[1],l=r[2],p=0,s=[];p<i.length;p++)a=i[p],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&s.push(o[a][0]),o[a]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(f&&f(r);s.length;)s.shift()();return u.push.apply(u,l||[]),t()}function t(){for(var e,r=0;r<u.length;r++){for(var t=u[r],n=!0,i=1;i<t.length;i++){var c=t[i];0!==o[c]&&(n=!1)}n&&(u.splice(r--,1),e=a(a.s=t[0]))}return e}var n={},o={1:0},u=[];function a(r){if(n[r])return n[r].exports;var t=n[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,a),t.l=!0,t.exports}a.e=function(e){var r=[],t=o[e];if(0!==t)if(t)r.push(t[2]);else{var n=new Promise((function(r,n){t=o[e]=[r,n]}));r.push(t[2]=n);var u,i=document.createElement("script");i.charset="utf-8",i.timeout=120,a.nc&&i.setAttribute("nonce",a.nc),i.src=function(e){return "<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/"+({}[e]||e)+".chunk.js"}(e);var c=new Error;u=function(r){i.onerror=i.onload=null,clearTimeout(l);var t=o[e];if(0!==t){if(t){var n=r&&("load"===r.type?"missing":r.type),u=r&&r.target&&r.target.src;c.message="Loading chunk "+e+" failed.\n("+n+": "+u+")",c.name="ChunkLoadError",c.type=n,c.request=u,t[1](c)}o[e]=void 0}};var l=setTimeout((function(){u({type:"timeout",target:i})}),12e4);i.onerror=i.onload=u,document.head.appendChild(i)}return Promise.all(r)},a.m=e,a.c=n,a.d=function(e,r,t){a.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,r){if(1&r&&(e=a(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(a.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var n in e)a.d(t,n,function(r){return e[r]}.bind(null,n));return t},a.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(r,"a",r),r},a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},a.p="/",a.oe=function(e){throw console.error(e),e};var i=this["webpackJsonppancake-frontend"]=this["webpackJsonppancake-frontend"]||[],c=i.push.bind(i);i.push=r,i=i.slice();for(var l=0;l<i.length;l++)r(i[l]);var f=c;t()}([])</script>
  <script src="<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/2.chunk.js"></script>
  <script src="<?php echo LOTTERYFACTORY_URL?>vendor/<?php echo LOTTERYFACTORY_VER?>/main.chunk.js"></script>
  <?php
  $ret = ob_get_clean();
  return $ret;
}
add_shortcode( 'lotteryfactory', 'lotteryfactory_main_shortcode' );
