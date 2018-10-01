var ipfsAPI = require('ipfs-api')
var data = Buffer.from('privet world')

// connect to ipfs daemon API server
var ipfs = ipfsAPI('ipfs.bluffbet.app', '443', {protocol: 'https'}) // leaving out the arguments will default to these values

const files = [
  {
    content: data
  }
]
ipfs.files.add(data, (err, state) => {
  console.log(err, state)
})
