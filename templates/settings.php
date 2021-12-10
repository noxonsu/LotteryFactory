<?php
/**
 * Settings Page
 *
 * @package Lottery Factory
 */

?>

<div class="wrap">
	<h2><?php echo esc_html( get_admin_page_title() ); ?></h2>

	<form action="#" method="post" class="wp-lotteryfactory-widget-form">
		<table class="form-table">
			<tbody>

				<tr>
					<th scope="row">
						<label><?php esc_html_e( 'Info', 'lotteryfactory' ); ?></label>
					</th>
					<td>
						<p class="description">
							<?php esc_html_e( 'First of all please','lotteryfactory' ); ?> <a href="update-core.php?force-check=1"><?php esc_html_e(' check for updates', 'lotteryfactory' ); ?></a>.<br> <?php esc_html_e( 'How to use? Just enter [lotteryfactory] shortcode in your page or post.', 'lotteryfactory' ); ?>
						</p>
					</td>
				</tr>

				<tr>
					<th scope="row">
						<label for="blogname"><?php echo esc_html_e( 'Infura ID', 'lotteryfacotry' ); ?></label>
					</th>
					<td>
						<input name="lotteryfactory_infura_id" type="text" value="<?php echo esc_attr( get_option( 'lotteryfactory_infura_id', lotteryfactory_default_infura_id() ) ); ?>" placeholder="<?php echo esc_attr( lotteryfactory_default_infura_id() ); ?>" class="regular-text">
					</td>
				</tr>

				<?php
				/*
				<tr>
					<th scope="row">
						<label for="blogname"><?php echo esc_html_e( 'Fortmatic Key', 'lotteryfacotry' ); ?></label>
					</th>
					<td>
						<input name="lotteryfactory_fortmatic_key" type="text" value="<?php echo esc_attr( get_option( 'lotteryfactory_fortmatic_key' ) ); ?>" class="regular-text">
					</td>
				</tr>
				*/
				?>

				<tr>
					<th scope="row">
						<label><?php esc_html_e('Newtwork ', 'lotteryfactory'); ?></label>
					</th>
					<td>
						<?php
							$lottery_factory_network = get_option( 'lotteryfactory_networkName','ropsten' );
							$networks = array(
								'ropsten',
								'mainnet',
								'rinkeby',
								'bsc',
								'bsc_test',
								'matic',
								'matic_test',
								'xdai',
								'aurora'
							);
						?>
						<select name="lotteryfactory_networkName">
							<?php foreach ( $networks as $network ) { ?>
								<option value="<?php echo esc_attr( $network ); ?>" <?php selected( $lottery_factory_network, $network ); ?>><?php echo esc_html( $network ); ?></option>
							<?php } ?>
						</select>
						<p class="description">
							<?php esc_html_e('Ropsten or Mainnet. We recommend to test on testnet with testnet tokens before launch', 'lotteryfactory'); ?>
						</p>
					</td>
				</tr>

				<tr>
					<th scope="row"></th>
					<td>
						<?php submit_button( esc_html__( 'Save settings', 'lotteryfactory' ) ); ?>
					</td>
				</tr>
			</tbody>
		</table>
	</form>

</div>

