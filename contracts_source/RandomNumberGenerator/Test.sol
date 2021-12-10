// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

// Creating a contract
contract Test {
	
    // Defining a variable
    address public admin;
    uint public random;
        
    // Creating a constructor to
    // use Global variable
    constructor() {	
        admin = msg.sender;
    }
    function genRandom( bytes32 _seed) public {
        random = uint(keccak256(abi.encodePacked(
            block.timestamp,
            _seed,
            blockhash(block.number),
            block.coinbase,
            block.difficulty,
            block.gaslimit,
            tx.gasprice
        )));
    }
}
