<?php
/**
 * MetaBoxes
 *
 * @package Lottery Factory
 */

/**
 * Adds a meta box to post type lotteryfactory
 */
class LotteryFactory_Meta_Box {

	/**
	 * Construct
	 */
	public function __construct() {
		if ( is_admin() ) {
			add_action( 'load-post.php', array( $this, 'init_metabox' ) );
			add_action( 'load-post-new.php', array( $this, 'init_metabox' ) );
		}

	}

	/**
	 * Init Metabox
	 */
	public function init_metabox() {

		add_action( 'add_meta_boxes', array( $this, 'add_metabox' ) );
		add_action( 'save_post', array( $this, 'save_metabox' ), 10, 2 );

	}

	/**
	 * Add Metabox
	 */
	public function add_metabox() {
		add_meta_box(
			'lotteryfactory_meta',
			esc_html__( 'Lottery Factory Details', 'lotteryfactory' ),
			array( $this, 'render_metabox' ),
			'lotteryfactory',
			'normal',
			'high'
		);
	}

	/**
	 * Render Metabox
	 *
	 * @param object $post Post.
	 */
	public function render_metabox( $post ) {

		/* Add nonce for security and authentication */
		wp_nonce_field( 'lotteryfactory_meta_action', 'lotteryfactory_meta_nonce' );

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
      $data = get_post_meta( $post->ID, $key, true);
      if ( empty( $data ) ) $data = $default;
      $lottery[ $key ] = $data;
    }

		// Form fields.
    ?>
    <table class="form-table">
      <tr>
        <th><label><?php echo esc_html__( 'Blockchain', 'lotteryfactory' ); ?></label></th>
        <td>
          <select name="lottery_blockchain" id="lottery_blockchain" value="<?php echo $lottery['blockchain']?>">
            <?php
            foreach ( lotteryfactory_blockchains() as $key => $value) {
              ?>
              <option value="<?php echo $key?>" <?php echo ($key === $lottery['blockchain']) ? 'selected' : ''?>>
                <?php echo esc_html__($value['title'], 'lotteryfactory');?>
              </option>
              <?php
            }
            ?>
          </select>
        </td>
      </tr>
      <tr>
        <th><label><?php echo esc_html__( 'Lottery token Address', 'lotteryfactory' ); ?></label></th>
        <td>
          <div class="lotteryfactory-form-inline">
            <input type="text" name="lottery_token" id="lottery_token" class="large-text" value="<?php echo $lottery['token']?>">
            <a class="button button-secondary" id="lotteryfactory_fetchtoken_button">
              <?php echo esc_html__( 'Fetch', 'lotteryfactory' ) ?>
            </a>
          </div>
          <p class="description">
          <?php
            echo sprintf( esc_html__( 'ERC20 address of token&#039;s contract which users will be used for buy tickets. Press Fetch for get info about token. Free test tokens %s.', 'lotteryfactory' ), '<a href="https://github.com/bokkypoobah/WeenusTokenFaucet" target="_blank">https://github.com/bokkypoobah/WeenusTokenFaucet</a>' );
          ?>
          </p>
        </td>
      </tr>
      <tbody id="lottery_token_info" <?php if (!$lottery['token_symbol']) echo ' style="display: none" '; ?>>
        <tr>
          <th><label><?php echo esc_html__( 'Token name', ' lotteryfactory' ); ?></label></th>
          <td>
            <strong id="lottery_token_name_view"><?php echo esc_html__( $lottery['token_name'] )?></strong>
            <input type="hidden" name="lottery_token_name" id="lottery_token_name" value="<?php echo esc_attr( $lottery['token_name'] ) ?>" />
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Token symbol', ' lotteryfactory' ); ?></label></th>
          <td>
            <strong id="lottery_token_symbol_view"><?php echo esc_html__( $lottery['token_symbol'] )?></strong>
            <input type="hidden" name="lottery_token_symbol" id="lottery_token_symbol" value="<?php echo esc_attr( $lottery['token_symbol'] ) ?>" />
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Token decimals', ' lotteryfactory' ); ?></label></th>
          <td>
            <strong id="lottery_token_decimals_view"><?php echo esc_html__( $lottery['token_decimals'] )?></strong>
            <input type="hidden" name="lottery_token_decimals" id="lottery_token_decimals" value="<?php echo esc_attr( $lottery['token_decimals'] ) ?>" />
          </td>
        </tr>
      </tbody>
      <tr>
        <th><label><?php echo esc_html__( 'Lottery contract', 'lotteryfactory' ); ?></label></th>
        <td>
          <div class="lotteryfactory-form-inline">
            <input name="lottery_address" id="lottery_address" type="text" class="large-text" value="<?php echo esc_attr( $lottery['contract'] ) ?>">
            <a class="button button-secondary" id="lotteryfactory_fetchcontract_button">
              <?php echo esc_html__( 'Fetch', 'lotteryfactory' ) ?>
            </a>
            <a class="button button-secondary" id="lotteryfactory_deploy_button">
              <?php echo esc_html__( 'Deploy', 'lotteryfactory' ) ?>
            </a>
          </div>
          <p class="desctiption">
            <?php echo esc_html__(
              'Use "Deploy" button next to the field to create new Lottery contract. After deployment address will be automatically placed in the field above', 'lotteryfactory' 
              );
            ?>
          </p>
          <p class="desctiption" style="color: red;">
            <?php echo esc_html__(
              'If you have Lottery contract address then you can pass it to this field and press &quot;Fetch&quot;. NOTE: please be sure that you fill Lottery contract address! If you are not sure PLEASE PRESS "Deploy" button!!! Otherwise, this may lead to incorrect operations of the program and you may lose your tokens!"', 'lotteryfactory' 
              )
            ?>
          </p>
          <p class="description">
            <?php echo esc_html__(
              'Нажмите &quot;Запросить статус лотереи&quot; чтобы управлять ей'
              )
            ?>
          </p>
          <p class="description" id="lottery_status_fetchholder" <?php echo (!($lottery['contract'] and $lottery['token_symbol'])) ? 'style="display: none;"' : ''?>>
            <a class="button button-secondary" id="lotteryfactory_fetchstatus">
              <?php echo esc_html__( 'Запросить статус лотереи', 'lotteryfactory' ) ?>
            </a>
          </p>
        </td>
      </tr>
      <tbody id="lottery_info" style="display: none">
        <tr>
          <th><label><?php echo esc_html__( 'Lottery owner', 'lotteryfactory' ); ?></label></th>
          <td><strong id="lottery_owner"></strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Lottery Operator', 'lotteryfactory' ); ?></label></th>
          <td><strong id="lottery_operator"></strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Treasury address', 'lotteryfactory' ); ?></label></th>
          <td><strong id="lottery_treasury"></strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Current lottery #', 'lotteryfactory' ); ?></label></th>
          <td><strong id="lottery_current"></strong></td>
        </tr>
      </tbody>
      <tbody id="lottery_draw" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'Лотерея завершена. Нужно расчитать выигрышную комбинацию' )?></strong></th>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Уникальная &quot;соль&quot;')?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="text" id="lottery_draw_salt" class="large-text" value="<?php echo esc_attr(lotteryfactory_generate_salt())?>" />
              <a class="button button-secondary" id="lotteryfactory_gen_drawsalt">
                <?php echo esc_html__( 'Сгенерировать случайное', 'lotteryfactory' ) ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'Уникальная строка. Используется для генерации случайных чисел внутри блокчейна. Уникальность строки гарантирует защиту от мошеничества. (ссылка на faq об особенностях random в блокчейне)' ) ?>
            </p>
          </td>
        </tr>
        <tr>
          <th></th>
          <td>
            <p class="description">
              <a class="button button-secondary" id="lotteryfactory_draw_numbers">
                <?php echo esc_html__( 'Расчитать выигрышные числа', 'lotteryfactory' ) ?>
              </a>
            </p>
          </td>
        </tr>
      </tbody>
      <tbody id="lottery_round" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'Лотерея запущена' ) ?></strong>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Банк' )?></label></th>
          <td><strong id="lottery_current_bank">000</strong><strong>&nbsp;<?php echo $lottery['token_symbol']?></strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Время старта' )?></label></th>
          <td><strong id="lottery_current_starttime">000</strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Время окончания' )?></label></th>
          <td><strong id="lottery_current_endtime">000</strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Осталось времени' )?></label></th>
          <td>
            <strong id="lottery_current_timeleft" style="display: none">000</strong>
            <a class="button button-secondary" id="lottery_current_close_goto_draw" style="display: none">
              <?php echo esc_html__( 'Время вышло. Нажмите, чтобы закрыть раунт и перейти к расчёту выигрышной комбинации', 'lotteryfactory' ) ?>
            </a>
          </td>
        </tr>
      </tbody>
      <tbody id="lottery_start" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'Нет запущенных лотерей. Заполните форму, чтобы начать лотерею', 'lotteryfactory' ) ?></strong>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Цена одного билета', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" id="lottery_ticket_price" min="0" step="0.1" name="lottery_ticket_price" value="<?php echo esc_attr($lottery['last_ticket_price'])?>" />
              <strong><?php echo esc_html__( $lottery['token_symbol'] )?></strong>
            </p>
            <p class="description"><?php echo esc_html__('Цена в токенах за один билет лотереи', 'lotteryfactory')?></p>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Козначейский сбор', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" id="lottery_treasury_fee" min="0" max="30" name="lottery_treasury_fee" value="<?php echo esc_attr($lottery['last_treasury_fee'])?>" />
              <strong>%</strong>
            </p>
            <p class="description"><?php echo esc_html__('Козначейский сбор от 0% до 30%. После завершения лотереи этот процент будет отправлен в козначейство (владельцу лотереи). Остаток будет разыгран между игроками', 'lotteryfactory')?></p>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Дата и время завершения лотереи', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <div class="lotteryfactory-form-inline">
              <input id="lottery_enddate" type="date" />
              <input id="lottery_endtime" type="time" />
            </div>
            <p class="description"><?php echo esc_html__("От 5 минут до 4 дней", "lotteryfactory") ?></p>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <p class="description">
              <a class="button button-secondary" id="lotteryfactory_startlottery">
                <?php echo esc_html__( 'Запустить лотерею', 'lotteryfactory' ) ?>
              </a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <div id="lotteryfactory_loaderOverlay" class="lotteryfactory-overlay">
			<div class="lotteryfactory-loader"></div>
		</div>
    <?php
	}

	public function save_metabox( $post_id, $post ) {
		/* Add nonce for security and authentication */
		$nonce_name   = isset( $_POST['lotteryfactory_meta_nonce'] ) ? $_POST['lotteryfactory_meta_nonce'] : '';
		$nonce_action = 'lotteryfactory_meta_action';

		/* Check if a nonce is set */
		if ( ! isset( $nonce_name ) ) {
			return;
		}

		/* Check if a nonce is valid */
		if ( ! wp_verify_nonce( $nonce_name, $nonce_action ) ) {
			return;
		}

		/* Check if the user has permissions to save data */
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		/* Check if it's not an autosave */
		if ( wp_is_post_autosave( $post_id ) ) {
			return;
		}


    $post_meta_keys = array(
      'blockchain'        => 'lottery_blockchain',
      'token'             => 'lottery_token',
      'token_name'        => 'lottery_token_name',
      'token_symbol'      => 'lottery_token_symbol',
      'token_decimals'    => 'lottery_token_decimals',
      'contract'          => 'lottery_address',
      'last_ticket_price' => 'lottery_ticket_price',
      'last_treasury_fee' => 'lottery_treasury_fee'
    );
    $post_meta_values = array();
    foreach( $post_meta_keys as $metaKey => $postKey) {
      $postValue = isset( $_POST[ $postKey ] ) ? sanitize_text_field( $_POST[ $postKey ] ) : '';
      update_post_meta( $post_id, $metaKey, $postValue );
    }

	}

}

new LotteryFactory_Meta_Box;

/**
 * Shortcode
 */
function lotteryfactory_post_submitbox( $post ) {
	if ( 'lotteryfactory' === $post->post_type ) {
		?>
		<div class="misc-pub-section">
			<p class="description"><strong><?php esc_html_e( 'Shortcode', 'lotteryfactory' ); ?><strong></p>
			<input type="text" class="large-text lotteryfactory-schortcode-copy" value='[lotteryfactory id="<?php echo esc_attr( $post->ID ); ?>"]' readonly>
			<div class="copy-to-clipboard-container">
				<button type="button" class="button button-small copy-farm-shortcode" data-clipboard-target=".lotteryfactory-schortcode-copy"><?php esc_html_e( 'Copy Shortcode to clipboard', 'lotteryfactory' ); ?></button>
				<span class="success hidden" aria-hidden="true"><?php esc_html_e( 'Copied!', 'lotteryfactory' ); ?></span>
			</div>
		</div>
		<?php
	}
}
add_action( 'post_submitbox_misc_actions', 'lotteryfactory_post_submitbox' );