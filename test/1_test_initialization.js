/**
 * TEST #1 : Campaign Factory Initialization
 *
 * In This test we test Initialization of the CampaignFactory and
 * The functionality of the Administrated Contract.
 *
 * The Administrated Contract manages Admins and granting/revoking
 * admin priviledges.
 *
 * We test that the contract CampaignFactory is initialized with a
 * single admin.
 *
 * Then grant admin priviledges to two more accounts before finally
 * revoking admin priviledges from one of those accounts.
 *
 * We also test that non admin accounts are not able to grant admin
 * privilidges.
 */


const CampaignFactory = artifacts.require('CampaignFactory')
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

contract('#1 Initialization', (accounts) => {
  let CampaignFactoryInstance

  before('set up contract instances', async () => {
    CampaignFactoryInstance = await CampaignFactory.deployed()
  })

  it('accounts 0 should be an admin', async () => {
    const isAdmin = await CampaignFactoryInstance.isAdmin.call(accounts[0])
    assert.equal(isAdmin, true, 'isAdmin should be true')
  })

  it('should try to add an admin from non admin account and fail', async () => {
    await assertRevert(CampaignFactoryInstance.addAdminRole(accounts[1], { from: accounts[1] }))
  })

  it('should not have made accounts 1 an admin', async () => {
    const isAdmin = await CampaignFactoryInstance.isAdmin.call(accounts[1], { from: accounts[1] })
    assert.equal(isAdmin, false, 'accounts 1 should not be an admin')
  })

  it('should add an admin from an admin account', async () => {
    await expectEvent.inTransaction(
      CampaignFactoryInstance.addAdminRole(accounts[1], { from: accounts[0] }),
      'AdminAdded',
      { account: accounts[1] }
    )
  })

  it('should have made accounts[1] an admin', async () => {
    const isAdmin = await CampaignFactoryInstance.isAdmin(accounts[1], { from: accounts[1] })
    assert.equal(isAdmin, true, 'accounts 1 should be an admin')
  })

  it('should add a third admin from the second admin account', async () => {
    await expectEvent.inTransaction(
      CampaignFactoryInstance.addAdminRole(accounts[2], { from: accounts[1] }),
      'AdminAdded',
      { account: accounts[2] }
    )
  })

  it('should have made accounts[2] an admin', async () => {
    const isAdmin = await CampaignFactoryInstance.isAdmin(accounts[2], { from: accounts[2] })
    assert.equal(isAdmin, true, 'accounts 2 should be an admin')
  })

  it('should revoke admin priviledges from an admin', async () => {
    await expectEvent.inTransaction(
      CampaignFactoryInstance.removeAdminRole(accounts[2], { from: accounts[0] }),
      'AdminRemoved',
      { account: accounts[2] }
    )
  })

  it('should have made accounts[2] not an admin', async () => {
    const isAdmin = await CampaignFactoryInstance.isAdmin(accounts[2], { from: accounts[2] })
    assert.equal(isAdmin, false, 'accounts 2 should be an admin')
  })
})
