const DURATION = 10 * 24 * 60 * 60

function increaseTime(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: 0
    }, (err1) => {
      console.log(`timestamp 2: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1
      }, (err2, res) => {
        console.log(`timestamp 3: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}

module.exports = function (callback) {
  console.log(`timestamp 1: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)

  increaseTime(DURATION)
    .then(() => {
      console.log(`timestamp 4: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
      callback()
    })
    .catch((err) => {
      console.log(err)
      callback(err)
    })
}


// function increaseTime(duration) {
//   return new Promise((resolve, reject) => {
//     const id = Date.now()
//     web3.currentProvider.send({
//       jsonrpc: '2.0',
//       method: 'evm_increaseTime',
//       params: [duration],
//       id: id
//     }, (err) => {
//       console.log(`timestamp 2: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
//       if (err) reject(err)
//       resolve()
//     })
//   })
// }

// function mine() {
//   return new Promise((resolve, reject) => {
//     const id = Date.now()
//     web3.currentProvider.send({
//       jsonrpc: '2.0',
//       method: 'evm_mine',
//       id: id
//     }, (err) => {
//       console.log(`timestamp 3: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
//       if (err) reject(err)
//       resolve()
//     })
//   })
// }

// module.exports = function (callback) {
//   console.log(`timestamp 1: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
//   increaseTime(TEN_DAYS)
//     .then(mine()).then(() => {
//       console.log(`timestamp 4: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
//       callback()
//     })
//     .catch((err) => {
//       console.log(err)
//       callback(err)
//     })
// }
