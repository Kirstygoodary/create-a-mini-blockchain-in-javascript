const EC = require('elliptic').ec // to generate pub and private key, sign transactions and to verify signature
const ec = new EC('secp256k1')
const SHA256 = require('crypto-js/sha256')

class Transaction {
  constructor(_fromAddress, _toAddress, _amount) {
    this.fromAddress = _fromAddress
    this.toAddress = _toAddress
    this.amount = _amount
  }

  calculateHash = () => {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString() // creates a hash for the transaction
  }

  signTransaction = (signingKey) => {
    /**
     * We're checking that the public key is equal to the address
     * before signing a transaction
     */

    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!')
    }

    // takes the object from ec.genKeyPair() in keyGenerator.js
    const txHash = this.calculateHash()

    const sign = signingKey.sign(txHash, 'base64') // takes the signing key object and signs the txHash and encodes with base 64.
    this.signature = sign.toDER('hex') // stores the signature in the transaction.
  }

  isValid = () => {
    /**
     * We need to check that the transaction is valid
     */

    if (this.fromAddress === null) return true
    // if null, it's a mining reward transaction and therefore valid

    if (!this.signature || this.signature === 0) {
      // if there is no signature or the signature is empty, throw new Error
      throw new Error('No signature in this transaction')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    // here we are getting the public key in a hex from the address
    return publicKey.verify(this.calculateHash(), this.signature)
    // here we are checking whether the txHash was signed by the same public key
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

  hasValidTransactions = () => {
    // here we're looping over the transactions and checking that the transactions have been validated
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false
      }
    }
    return true
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

  addTransaction = (transaction) => {
    // in the parenthesis .. adding 'new Transaction('...', '...', '...')'

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include a from and to address')
    } // checks that the transaction has addresses

    if (!transaction.isValid()) {
      // checking that the transaction has been properly signed.
      throw new Error('Cannot add transaction to the chain')
    }
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

      if (!currentBlock.hasValidTransactions()) {
        //checking that the transactions have been validated
        return false
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        // checking that the hashes are equal
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        // checking the previous hash is equal
        return false
      }
    }
    return true
  }
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction
