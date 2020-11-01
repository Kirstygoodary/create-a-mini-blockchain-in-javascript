const EC = require('elliptic').ec // to generate pub and private key, sign transactions and to verify signature
const ec = new EC('secp256k1')
const { Blockchain, Transaction } = require('./blockchain')
const { public, private } = require('./key')

const myKey = ec.keyFromPrivate(private) // gets key from private key
const myWalletAddress = myKey.getPublic('hex') // gets public key in the form of a hex

let kirstyCoin = new Blockchain() // creating a new blockchain

/** Below... Here, we are creating a new transaction with the public address
 *
 * Then we're signing the transaction with myKey on line 8
 *
 * Then we are adding the transaction to the blockchain
 */

const tx1 = new Transaction(myWalletAddress, '0x23496y4643', 100)
tx1.signTransaction(myKey)
kirstyCoin.addTransaction(tx1)

// console.log('Mining block one...')
// kirstyCoin.addBlock(new Block(1, '02/11/2020', { amount: 1 })) // adding blocks to the blockchain

// console.log('Mining block 2...')
// kirstyCoin.addBlock(new Block(2, '04/11/2020', { amount: 3 }))

// console.log('Is blockchain valid? ' + kirstyCoin.isChainValid())

//console.log(JSON.stringify(kirstyCoin, null, 4))

// kirstyCoin.createTransaction(new Transaction('address1', 'address2', 100))
// kirstyCoin.createTransaction(new Transaction('address2', 'address1', 50))

console.log('Starting the miner...')
kirstyCoin.minePendingTransactions(myWalletAddress)

console.log(
  'Balance of Kirstys address is ' +
    kirstyCoin.getBalanceOfAddress(myWalletAddress),
)

// console.log('Starting the miner again...')
// kirstyCoin.minePendingTransactions('0x123456789')

// console.log(
//   'Balance of Kirstys address is ' +
//     kirstyCoin.getBalanceOfAddress('0x123456789'),
// )
