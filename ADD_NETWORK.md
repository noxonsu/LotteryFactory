# How to add custom network

## Example of adding a Polygon (Matic) Mumbai Testnet network

### Add network config to `lotteryfactory_blockchains` function in `./inc/functions.php` 132 line

```php
function lotteryfactory_blockchains() {
return array(
  ...,
  'matic_testnet' => array(
    'chainId'   => 80001,
    'rpc'       => 'https://rpc-mumbai.maticvigil.com',
    'title'     => 'Polygon Matic - Testnet (mumbai)',
    'etherscan' => 'https://mumbai.polygonscan.com'
  ),
  ...
);
```

Where:

- `matic_testnet` - network slug;
- `chainId` - network chain id;
- `rpc` -  network RPC interface;
- `title` - network name;
- `etherscan` - network explorer.

### Add network native currency and network configs in `./srs/deployer/constants.ts`

1. Add network native currency config to `CURRENCIES` constant:

    ```ts
    export const CURRENCIES = [
      ...,
      MATIC: { // currency slug (uses as property in `AVAILABLE_NETWORKS_INFO`)
        name: "Polygon", // currency name
        symbol: 'MATIC', // currency symbol
        decimals: 18 // currency decimals
      },
      ...
    ];
    ```

2. Add network config to `AVAILABLE_NETWORKS_INFO` constant:

    ```ts
    export const AVAILABLE_NETWORKS_INFO = [
      ...,
      {
        slug: 'matic_testnet', // network slug (should be similar as network slug in php config file)
        chainName: 'Polygon - Testnet (mumbai)', // network name
        chainId: '0x13881', // network chain id (hexadecimal number in string type)
        networkVersion: 80001, // network chain id (in number type)
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'], // array of network RPC interfaces (you should add only 1 or more RPCs)
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'], // array of network explorers (you should add 1 or more explorers)
        isTestnet: true, // network type (use "true" only with testnet networks)
        nativeCurrency: CURRENCIES.MATIC // network native currency object from 'CURRENCIES' constant
      },
      ...
    ];
    ```
