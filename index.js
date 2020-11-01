const SHA256 = require('crypto-js/sha256')

class Transaction {
  constructor(_fromAddress, _toAddress, _amount) {
    this.fromAddress = _fromAddress
    this.toAddress = _toAddress
    this.amount = _amount
  }
}

class Block {
  constructor(_timestamp, _transactions, _previousHash = '') {
    this.timestamp = _timestamp
    this.transactions = _transactions
    this.previousHash = _previousHash
    this.hash = this.calculateHash()
    this.nonce = 0
  }

  calculateHash = () => {
    return SHA256(
      this.index +
        this.timestamp +
        this.previousHash +
        JSON.stringify(this.data) +
        this.nonce,
    ).toString()
    /**
     * SHA-256 hash is generated from the index, timestamp, previous block's
     * hash and the stringified version of the data
     *
     * The output is then converted in to a string
     */
  }

  mineBlock = (difficulty) => {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0') // whilst the number of zeros are not equal or lower than the target..
    ) {
      this.nonce++ // increase nonce by 1 as long as our hash doesn't start with enough zeros.
      this.hash = this.calculateHash() // recalculate hash
    }
    console.log('Block mined: ' + this.hash) // once the puzzle is solved, the block is mined and latest hash is saved
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 4
    this.pendingTransactions = [] // new block every 10 mins, therefore pending transactions during that time are stored here
    this.miningReward = 100 // no of coins every time a new block is mined
  }

  createGenesisBlock = () => {
    return new Block('01/11/2020', 'Genesis Block', '0')
  }

  getLatestBlock = () => {
    return this.chain[this.chain.length - 1]
  }

  minePendingTransactions = (miningRewardAddress) => {
    let block = new Block(Date.now(), this.pendingTransactions) // create a new block with pending transactions
    block.mineBlock(this.difficulty) // mine the block
    console.log('Block successfully mined')
    this.chain.push(block) // add the successfully mined block to the blockchain

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward), // clears the pending transactions and adds the reward as a pending transaction
    ]
  }

  createTransaction = (transaction) => {
    // in the parenthesis .. adding 'new Transaction('...', '...', '...')'
    this.pendingTransactions.push(transaction) // adds new transactions to the pending transactions
  }

  getBalanceOfAddress = (address) => {
    /**
     * In bitcoin, you don't have a balance.
     *
     * The transactions are just stored on the blockchain.
     *
     * If you ask for your balance, you have to go through all your
     * transactions in the blockchain and add / deduct it from 0 to
     * get the balance.
     */

    let balance = 0

    for (const block of this.chain) {
      // looping over each block in the chain
      for (const transaction of block.transactions) {
        // looping over each transaction in the chain
        if (transaction.fromAddress === address) {
          // if address is a fromAddress, reduce balance
          balance -= transaction.amount
        }
        if (transaction.toAddress === address) {
          // if address is toAddress, add to balance
          balance += transaction.amount
        }
      }
    }
    return balance
  }

  /** @function
   *  "isChainValid"
   * We're checking that the hash of the current block is the same
   *
   * We're also checking that the previous block's hash is still the
   * same in the current block
   */

  isChainValid = () => {
    for (let i = 1; i < this.chain.length; i++) {
      let currentBlock = this.chain[i]
      let previousBlock = this.chain[i - 1]
      // i starts at 1 because we don't need to loop over the genesis block

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }
}

let kirstyCoin = new Blockchain() // creating a new blockchain

// console.log('Mining block one...')
// kirstyCoin.addBlock(new Block(1, '02/11/2020', { amount: 1 })) // adding blocks to the blockchain

// console.log('Mining block 2...')
// kirstyCoin.addBlock(new Block(2, '04/11/2020', { amount: 3 }))

// console.log('Is blockchain valid? ' + kirstyCoin.isChainValid())

//console.log(JSON.stringify(kirstyCoin, null, 4))

kirstyCoin.createTransaction(new Transaction('address1', 'address2', 100))
kirstyCoin.createTransaction(new Transaction('address2', 'address1', 50))

console.log('Starting the miner...')
kirstyCoin.minePendingTransactions('0x123456789')

console.log(
  'Balance of Kirstys address is ' +
    kirstyCoin.getBalanceOfAddress('0x123456789'),
)

console.log('Starting the miner again...')
kirstyCoin.minePendingTransactions('0x123456789')

console.log(
  'Balance of Kirstys address is ' +
    kirstyCoin.getBalanceOfAddress('0x123456789'),
)
