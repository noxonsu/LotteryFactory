var fs = require('fs');
var path = require('path');
var solc = require('solc');


var contract = fs.readFileSync(path.resolve('contracts/Lottery.sol'))

var input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: contract.toString()
    }
  },
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 99999,
    },
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log(output)
var result = {
  abi: output.contracts['Lottery.sol']['PancakeSwapLottery'].abi,
  bytecode: output.contracts['Lottery.sol']['PancakeSwapLottery'].evm.bytecode.object,
}

fs.writeFileSync(path.resolve('contracts/Lottery.json'), JSON.stringify(result))
