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

    $lottery = lottery_get_data($post->ID);
    $lottery_at_homepage = get_option( 'lotteryfactory_id_at_homepage', 'false');
		// Form fields.
    ?>
    <input type="hidden" id="lotteryfactory_post_id" value="<?php echo $post->ID?>" />
    <table class="form-table">
      <tr>
        <th><label><?php echo esc_html__( 'Design', 'lotteryfactory' );?></label></th>
        <td>
          <input type="checkbox" name="lottery_hide_footer_header" id="lottery_hide_footer_header" <?php echo ($lottery['hide_footer_header'] === 'true') ? 'checked' : ''?> />
          <label for="lottery_hide_footer_header"><?php echo esc_html__( 'Hide WP footer and header', 'lotteryfactory' ); ?></label>
        </td>
      </tr>
      <tr>
        <th><label><?php echo esc_html__( 'As home page', 'lotteryfactory' ); ?></label></th>
        <td>
          <input type="checkbox" name="lottery_at_homepage" id="lottery_at_homepage" <?php echo ($lottery_at_homepage == $post->ID) ? 'checked' : ''?>/>
          <label for="lottery_at_homepage"><?php echo esc_html__( 'Show this lottery at home page' ); ?></label>
        </td>
      </tr>
      <tr>
        <th><label><?php echo esc_html__( 'Blockchain', 'lotteryfactory' ); ?></label></th>
        <td>
          <select name="lottery_blockchain" id="lottery_blockchain" value="<?php echo $lottery['blockchain']?>">
            <?php
            foreach ( lotteryfactory_blockchains() as $key => $value) {
              ?>
              <option data-chain="<?php echo $value['chainId']?>" value="<?php echo $key?>" <?php echo ($key === $lottery['blockchain']) ? 'selected' : ''?>>
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
              'Click &quot;Request lottery status &quot; to control her'
              )
            ?>
          </p>
          <p class="description" id="lottery_status_fetchholder" <?php echo (!($lottery['contract'] and $lottery['token_symbol'])) ? 'style="display: none;"' : ''?>>
            <a class="button button-secondary" id="lotteryfactory_fetchstatus">
              <?php echo esc_html__( 'Request lottery status', 'lotteryfactory' ) ?>
            </a>
          </p>
        </td>
      </tr>
      <tbody id="lottery_info" style="display: none">
        <tr>
          <th><label><?php echo esc_html__( 'Lottery owner', 'lotteryfactory' ); ?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <strong id="lottery_owner"></strong>
            </p>
            <p class="description">
              <?php echo esc_html__('Owner can do all operations with lottery'); ?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Lottery Operator', 'lotteryfactory' ); ?></label></th>
          <td>
            <p class="lotteryfactory-form-inline" id="lottery_operator_viewbox">
              <a class="button button-secondary" id="lottery_operator_change">
                <strong id="lottery_operator"></strong>
                <span>(<?php echo esc_html__('Click for change', 'lotteryfactory');?>)</span>
              </a>
            </p>
            <p class="lotteryfactory-form-inline" id="lottery_operator_changebox" style="display: none;">
              <input type="text" class="large-text" />
              <a class="button button-secondary" id="lottery_operator_do_change">
                <?php echo esc_html__('Change', 'lotteryfactory');?>
              </a>
              <a class="button button-secondary" id="lottery_operator_cancel_change">
                <?php echo esc_html__('Cancel', 'lotteryfactory');?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__('Operator can only start, stop lottery and draw numbers', 'lotteryfactory');?>
            </p>
          </td>
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
      <tbody id="lottery_settings" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'Settings' )?></strong></th>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Token price in USD');?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" min="0" step="any" id="lottery_token_price" name="lottery_token_price" value="<?php echo $lottery['token_price']?>" />
              <a class="button button-secondary"
                data-lottery-action="save-ajax-param"
                data-lottery-target="token_price"
                data-lottery-source="#lottery_token_price"
              >
                <?php echo esc_html__('Update'); ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'Price of one token in USD. Set zero to hide price in USD' );?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('View token decimals'); ?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" min="0" step="any" id="lottery_token_viewdecimals" name="lottery_token_viewdecimals" value="<?php echo $lottery['token_viewdecimals']?>" />
              <a class="button button-secondary"
                data-lottery-action="save-ajax-param"
                data-lottery-target="token_viewdecimals"
                data-lottery-source="#lottery_token_viewdecimals"
              >
                <?php echo esc_html__('Update'); ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'View amounts rounded to this decimals' );?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Token Buy URL');?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="site" id="lottery_tokenbuy_link" class="large-text" name="lottery_tokenbuy_link" value="<?php echo $lottery['tokenbuy_link']?>" />
              <a class="button button-secondary"
                data-lottery-action="save-ajax-param"
                data-lottery-target="tokenbuy_link"
                data-lottery-source="#lottery_tokenbuy_link"
              >
                <?php echo esc_html__('Update'); ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'Link to a site where a user can buy tokens to pay for a ticket'); ?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Number of balls')?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" min="2" max="6" step="1" id="lottery_numbers_count" name="lottery_numbers_count" class="large-text" value="<?php echo $lottery['numbers_count']?>" />
              <a class="button button-secondary" id="lottery_numbers_count_change">
                <?php echo esc_html__( 'Change', 'lotteryfactory' ) ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'The number of balls participating in the lottery. From 2 to 6.' ) ?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Distribution of prizes %') ?></label></th>
          <td>
            <table>
              <thead>
                <tr>
                  <td data-winning-number="1" class="lotteryfactory-winning-percent"><?php echo esc_html__('1 ball')?></td>
                  <td data-winning-number="2" class="lotteryfactory-winning-percent"><?php echo esc_html__('2 balls')?></td>
                  <td data-winning-number="3" class="lotteryfactory-winning-percent <?php echo ($lottery['numbers_count']) >=3 ? '' : '-hidden'?>"><?php echo esc_html__('3 balls')?></td>
                  <td data-winning-number="4" class="lotteryfactory-winning-percent <?php echo ($lottery['numbers_count']) >=4 ? '' : '-hidden'?>"><?php echo esc_html__('4 balls')?></td>
                  <td data-winning-number="5" class="lotteryfactory-winning-percent <?php echo ($lottery['numbers_count']) >=5 ? '' : '-hidden'?>"><?php echo esc_html__('5 balls')?></td>
                  <td data-winning-number="6" class="lotteryfactory-winning-percent <?php echo ($lottery['numbers_count']) >=6 ? '' : '-hidden'?>"><?php echo esc_html__('6 balls')?></td>
                  <td><?php echo esc_html__('Sum'); ?></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <?php
                  function render_lottery_winning_percent_input($number, $value, $numbers_count) {
                    ?>
                  <td
                    data-winning-number="<?php echo $number?>"
                    class="lotteryfactory-winning-percent <?php echo $numbers_count >= $number ? '' : '-hidden'?>"
                  >
                    <p class="lotteryfactory-form-inline">
                      <input
                        type="hidden"
                        min="0"
                        max="100"
                        step="0.01"
                        novalidate
                        value="<?php echo $value?>"
                        class="lottery-winning-percent-input"
                        name="lottery_winning_percent_<?php echo $number?>"
                        data-winning-number="<?php echo $number?>"
                      />
                      <label>%</label>
                    </p>
                    <div style="text-align: center;">
                      <a
                        class="button button-secondary"
                        data-lottery-action="fix-winning-percents"
                        data-winning-number="<?php echo $number?>"
                      >
                        <?php echo esc_html__('+&nbsp;/&nbsp;-') ?>
                      </a>
                    </div>
                  </td>
                    <?php
                  }
                  render_lottery_winning_percent_input(1, $lottery['winning_1'], $lottery['numbers_count']);
                  render_lottery_winning_percent_input(2, $lottery['winning_2'], $lottery['numbers_count']);
                  render_lottery_winning_percent_input(3, $lottery['winning_3'], $lottery['numbers_count']);
                  render_lottery_winning_percent_input(4, $lottery['winning_4'], $lottery['numbers_count']);
                  render_lottery_winning_percent_input(5, $lottery['winning_5'], $lottery['numbers_count']);
                  render_lottery_winning_percent_input(6, $lottery['winning_6'], $lottery['numbers_count']);
                  ?>
                  <td style="vertical-align: top;">
                    <p class="lotteryfactory-form-inline">
                      <strong>=</strong>
                      <strong id="lotteryfactory-winning-percent-total"></strong>
                      <strong>%</strong>
                      <a class="button button-secondary" id="lottery-winning-percent-save">
                        <?php echo esc_html__( "Save" ) ?>
                      </a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <div id="lotteryfactory-winning-percent-error" class="lotteryfactory-error -hidden">
              <?php echo esc_html__( "The sum must be equal to 100%" ); ?>
            </div>
            <div>
              <label><?php echo esc_html__( "Distribute the winning percentage based on the number of matched balls"); ?></label>
            </div>
            <div>
              <label><?php echo esc_html__( "The amount should be equal to 100%. Use the &quot;+&nbsp;/&nbsp;&quot; button to add or remove percentages for the combination you want. Then the amount will be equal to 100%"); ?></label>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody id="lottery_draw" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'The lottery is over. You need to calculate the winning combination' )?></strong></th>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__('Unique &quot;salt&quot;')?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="text" id="lottery_draw_salt" class="large-text" value="<?php echo esc_attr(lotteryfactory_generate_salt())?>" />
              <a class="button button-secondary" id="lotteryfactory_gen_drawsalt">
                <?php echo esc_html__( 'Generate random', 'lotteryfactory' ) ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__( 'Unique string. Used to generate random numbers within the blockchain. The uniqueness of the string guarantees protection against fraud' ) ?>
            </p>
          </td>
        </tr>
        <tr>
          <th></th>
          <td>
            <p class="description">
              <a class="button button-secondary" id="lotteryfactory_draw_numbers">
                <?php echo esc_html__( 'Calculate winning numbers', 'lotteryfactory' ) ?>
              </a>
            </p>
          </td>
        </tr>
      </tbody>
      <tbody id="lottery_round" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'Lottery started' ) ?></strong>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Bank' )?></label></th>
          <td><strong id="lottery_current_bank">000</strong><strong>&nbsp;<?php echo $lottery['token_symbol']?></strong></td>
        </tr>
        <tr id="lottery_inject_funds_holder" style="display: none;">
          <th><label><?php echo esc_html__( 'Inject funds' )?></label></th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" id="lottery_inject_funds_tobank" min="0" step="any" value="0" />
              <a class="button button-secondary" id="lottery_inject_funds">
                <?php echo esc_html__( 'Add to bank' ); ?>
              </a>
            </p>
            <p class="description">
              <?php echo esc_html__('You can add some amount of tokens to bank of current lottery round') ?>
            </p>
          </td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Start time' )?></label></th>
          <td><strong id="lottery_current_starttime">000</strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'End time' )?></label></th>
          <td><strong id="lottery_current_endtime">000</strong></td>
        </tr>
        <tr>
          <th><label><?php echo esc_html__( 'Time left' )?></label></th>
          <td>
            <strong id="lottery_current_timeleft" style="display: none">000</strong>
            <a class="button button-secondary" id="lottery_current_close_goto_draw" style="display: none">
              <?php echo esc_html__( 'Time is over. Click to close the round and proceed to calculating the winning combination', 'lotteryfactory' ) ?>
            </a>
          </td>
        </tr>
      </tbody>
      <tbody id="lottery_start" style="display: none">
        <tr>
          <td colspan="2" align="center">
            <strong class="lottery-status-header"><?php echo esc_html__( 'There are no running lotteries. Fill out the form to start the lottery', 'lotteryfactory' ) ?></strong>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Price of one ticket', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" id="lottery_ticket_price" min="0" step="any" name="lottery_ticket_price" value="<?php echo esc_attr($lottery['last_ticket_price'])?>" />
              <strong><?php echo esc_html__( $lottery['token_symbol'] )?></strong>
            </p>
            <p class="description"><?php echo esc_html__('Price in tokens for one lottery ticket', 'lotteryfactory')?></p>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Treasury fee', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <p class="lotteryfactory-form-inline">
              <input type="number" id="lottery_treasury_fee" min="0" max="30" name="lottery_treasury_fee" value="<?php echo esc_attr($lottery['last_treasury_fee'])?>" />
              <strong>%</strong>
            </p>
            <p class="description"><?php echo esc_html__('Treasury fee from 0% to 30%. After the completion of the lottery, this percentage will be sent to the treasury (the owner of the lottery). The remainder will be raffled among the players', 'lotteryfactory')?></p>
          </td>
        </tr>
        <tr>
          <th>
            <label><?php echo esc_html__( 'Date and time of the end of the lottery', 'lotteryfactory' ); ?></label>
          </th>
          <td>
            <div class="lotteryfactory-form-inline">
              <input id="lottery_enddate" type="date" />
              <input id="lottery_endtime" type="time" />
            </div>
            <p class="description"><?php echo esc_html__("5 minutes to 4 days", "lotteryfactory") ?></p>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <p class="description">
              <a class="button button-secondary" id="lotteryfactory_startlottery">
                <?php echo esc_html__( 'Launch the lottery', 'lotteryfactory' ) ?>
              </a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <div id="lotteryfactory_loaderOverlay" class="lotteryfactory-overlay">
			<div class="lotteryfactory-loader"></div>
      <div class="lotteryfactory-loader-status" id="lotteryfactory_loaderStatus">Loading...</div>
		</div>
    <div class="notice lotteryfactory-notice hide-all"><p></p></div>
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
      'last_treasury_fee' => 'lottery_treasury_fee',
      'numbers_count'     => 'lottery_numbers_count',
      'winning_1'         => 'lottery_winning_percent_1',
      'winning_2'         => 'lottery_winning_percent_2',
      'winning_3'         => 'lottery_winning_percent_3',
      'winning_4'         => 'lottery_winning_percent_4',
      'winning_5'         => 'lottery_winning_percent_5',
      'token_price'       => 'lottery_token_price',
      'tokenbuy_link'     => 'lottery_tokenbuy_link'
    );
    $post_meta_checkboxs = array(
      'hide_footer_header'=> 'lottery_hide_footer_header'
    );
    $post_meta_values = array();
    foreach( $post_meta_keys as $metaKey => $postKey) {
      $postValue = isset( $_POST[ $postKey ] ) ? sanitize_text_field( $_POST[ $postKey ] ) : '';
      update_post_meta( $post_id, $metaKey, $postValue );
    }
    foreach( $post_meta_checkboxs as $metaKey => $postKey) {
      $postValue = (isset( $_POST[ $postKey ] ) && ( $_POST[ $postKey ] == 'on' )) ? 'true' : 'false';
      update_post_meta( $post_id, $metaKey, $postValue );
    }
    // Lottery at home page
    $current_lottery_at_homepage = get_option( 'lotteryfactory_id_at_homepage', 'false');
    $set_this_at_homepage = ( isset( $_POST['lottery_at_homepage'] ) and ($_POST[ 'lottery_at_homepage' ] == 'on' )) ? true : false;

    if (!$set_this_at_homepage and ($current_lottery_at_homepage !== 'false') and (intval($current_lottery_at_homepage) == $post_id)) {
      delete_option('lotteryfactory_id_at_homepage');
    } else if ($set_this_at_homepage) {
      update_option('lotteryfactory_id_at_homepage', $post_id);
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
