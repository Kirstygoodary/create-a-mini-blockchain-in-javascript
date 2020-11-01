const EC = require('elliptic').ec // to generate pub and private key, sign transactions and to verify signature
const ec = new EC('secp256k1')

const key = ec.genKeyPair() // ec module generates the key pair
const publicKey = key.getPublic('hex') // public key in the form of a hex
const privateKey = key.getPrivate('hex') // private key in the form of a hex

// console.log(publicKey, privateKey)
