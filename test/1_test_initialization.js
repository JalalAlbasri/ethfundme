let EthFundMe = artifacts.require('EthFundMe')

contract('Initialization', (accounts) => {
  let EthFundMeInstance

  before('set up contract instances', (done) => {
    EthFundMe.deployed().then((instance) => {
      EthFundMeInstance = instance
      done()
    })
  })

  it('should initialize with 3 admins', (done) => {
    EthFundMeInstance.getNumAdmins.call().then((numAdmins) => {
      assert.equal(numAdmins, 3, 'there should be 3 admins')
      done()
    })
  })

  it('should initialize first admin', (done) => {
    EthFundMeInstance.admins.call(0).then((admin) => {
      assert.equal(admin, accounts[0], 'the first admin should be accounts[0]')
      done()
    })
  })

  it('should initialize second admin', (done) => {
    EthFundMeInstance.admins.call(1).then((admin) => {
      assert.equal(admin, accounts[1], 'the second admin should be accounts[1]')
      done()
    })
  })

  it('should initialize third admin', (done) => {
    EthFundMeInstance.admins.call(2).then((admin) => {
      assert.equal(admin, accounts[2], 'the third admin should be accounts[2]')
      done()
    })
  })

  it('should detect valid admin', (done) => {
    EthFundMeInstance.isAdmin.call(accounts[0]).then((isAdmin) => {
      assert.equal(isAdmin, true, 'accounts[0] is an admin')
      done()
    })
  })

  it('should detect invalid admin', (done) => {
    EthFundMeInstance.isAdmin.call(accounts[3]).then((isAdmin) => {
      assert.equal(isAdmin, false, 'accounts[3] is not an admin')
      done()
    })
  })
})
