const SHA256 = require('crypto-js/sha256')

class Block {
  constructor(_index, _timestamp, _data, _previousHash = '') {
    this.index = _index
    this.timestamp = _timestamp
    this.data = _data
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
  }

  createGenesisBlock = () => {
    return new Block(0, '01/11/2020', 'Genesis Block', '0')
  }

  getLatestBlock = () => {
    return this.chain[this.chain.length - 1]
  }

  addBlock = (newBlock) => {
    newBlock.previousHash = this.getLatestBlock().hash // gets the hash from the previous block
    newBlock.mineBlock(this.difficulty) // calls mineBlock with the level of difficulty, in which it recalculates the hash until puzzle solved
    this.chain.push(newBlock) // pushes the new block on to the blockchain
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

console.log('Mining block one...')
kirstyCoin.addBlock(new Block(1, '02/11/2020', { amount: 1 })) // adding blocks to the blockchain

console.log('Mining block 2...')
kirstyCoin.addBlock(new Block(2, '04/11/2020', { amount: 3 }))

// console.log('Is blockchain valid? ' + kirstyCoin.isChainValid())

//console.log(JSON.stringify(kirstyCoin, null, 4))
