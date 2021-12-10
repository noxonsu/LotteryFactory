<?php
/**
 * Functions
 *
 * @package Lottery Factory
 */

/**
 * Get default Infura ID
 */
function lotteryfactory_default_infura_id() {
	return '8043bb2cf99347b1bfadfb233c5325c0';
}

function lotteryfactory_generate_salt() {
  $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  $randomString = '';

  for ($i = 0; $i < 128; $i++) {
      $index = rand(0, strlen($characters) - 1);
      $randomString .= $characters[$index];
  }

  return $randomString;
}

function lotteryfactory_blockchains() {
  return array(
    'bsc_testnet' => array(
      'chainId'   => 97,
      'rpc'       => 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'title'     => 'Binance Block Chain (ERC20) - Testnet'
    ),
    'matic_testnet' => array(
      'chainId'   => 80001,
      'rpc'       => 'https://rpc-mumbai.maticvigil.com',
      'title'     => 'Poligon Matic - Testnet (mumbai)'
    )
  );
}