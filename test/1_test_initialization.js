let EthFundMe = artifacts.require('EthFundMe')

contract('Initialization', (accounts) => {
  let EthFundMeInstance

  before('set up contract instances', (done) => {
    EthFundMe.deployed().then((instance) => {
      EthFundMeInstance = instance
      done()
    })
  })

  it('accounts 0 should be an admin', (done) => {
    EthFundMeInstance.isAdmin.call(accounts[0]).then((isAdmin) => {
      assert.equal(isAdmin, true, 'isAdmin should be true')
      done()
    })
  })

  it('should try to add an admin from non admin account and fail', (done) => {
    EthFundMeInstance.addAdminRole(accounts[1], {from: accounts[1]}).catch((e) => {
      EthFundMeInstance.isAdmin.call(accounts[1], {from: accounts[1]}).then((isAdmin) => {
        assert.equal(isAdmin, false, 'accounts 1 should not be an admin')
        done()
      })
    })
  })

  it('should add an admin from an admin account', (done) => {
    EthFundMeInstance.addAdminRole(accounts[1], {from: accounts[0]}).then(() => {
      return EthFundMeInstance.isAdmin(accounts[1], {from: accounts[1]});
    }).then((isAdmin) => {
      assert.equal(isAdmin, true, 'accounts 1 should be an admin')
      done()
    })
  })

  it('should add a third admin from the second admin account', (done) => {
    EthFundMeInstance.addAdminRole(accounts[2], {from: accounts[1]}).then(() => {
      return EthFundMeInstance.isAdmin(accounts[2], {from: accounts[2]});
    }).then((isAdmin) => {
      assert.equal(isAdmin, true, 'accounts 2 should be an admin')
      done()
    })
  })

})
