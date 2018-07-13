var EthFundMe = artifacts.require('EthFundMe');
var Campaign = artifacts.require('Campaign');

contract('EthFundMe', accounts => {
  it('there should be 3 admins', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.getNumAdmins.call();
      })
      .then(numAdmins => {
        assert.equal(numAdmins, 3, 'there should be 3 admins');
      });
  });

  it('the first admin should be accounts[0]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(0);
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[0],
          'the first admin should be accounts[0]'
        );
      });
  });

  it('the second admin should be accounts[1]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(1);
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[1],
          'the second admin should be accounts[1]'
        );
      });
  });

  it('the third admin should be accounts[2]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(2);
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[2],
          'the third admin should be accounts[2]'
        );
      });
  });

  it('should create a new campaign', () => {
    var EthFundMeInstance;

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance;
        return EthFundMeInstance.createCampaign('first campaign', 10, {
          from: accounts[3]
        });
      })
      .then(() => {
        return EthFundMeInstance.numCampaigns.call();
      })
      .then(numCampaigns => {
        assert.equal(numCampaigns, 1, 'numCampaigns should be 1');
      });
  });

  it('should set Campaign properties correctly', () => {
    var EthFundMeInstance;
    var CampaignInstance;
    var id;
    var title;
    var goal;
    var manager;
    var state;

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance;
        return EthFundMeInstance.campaigns.call(0);
      })
      .then(address => {
        CampaignInstance = Campaign.at(address);
        return CampaignInstance.id.call();
      })
      .then(_id => {
        id = _id;
        return CampaignInstance.title.call();
      })
      .then(_title => {
        title = _title;
        return CampaignInstance.goal.call();
      })
      .then(_goal => {
        goal = _goal;
        return CampaignInstance.manager.call();
      })
      .then(_manager => {
        manager = _manager;
        return CampaignInstance.state.call();
      })
      .then(_state => {
        state = _state;

        assert.equal(id, 0, 'id should be 0');
        assert.equal(
          title,
          'first campaign',
          "title should be 'first campaign'"
        );
        assert.equal(goal, 10, 'goal should be 10');
        assert.equal(state, 0, 'state should be 0 (State.Pending)');
        assert.equal(
          manager,
          accounts[3],
          'campaign manager should be accounts[3]'
        );
        assert.notEqual(
          manager,
          EthFundMe.address,
          'manager should not be the EthFundMe contract'
        );
      });
  });

  it ("should make a single contribution of 1 ether", () => {
    var EthFundMeInstance;
    var CampaignInstance;
    var numContributions;
    var contribution;
    var funds;

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance;
        return EthFundMeInstance.campaigns.call(0);
      })
      .then(address => {
        CampaignInstance = Campaign.at(address);
        return CampaignInstance.contribute({ from: accounts[4], value: 1 });
      })
      .then(() => {
        return CampaignInstance.getNumContributions.call(accounts[4]);
      })
      .then((_numContributions) => {
        numContributions = _numContributions;
        return CampaignInstance.getContribution.call(accounts[4], 0);
      })
      .then((_contribution) => {
        contribution = _contribution
        return CampaignInstance.funds.call();
      })
      .then((_funds) => {
        funds = _funds;
        let campaignBalance = web3.eth.getBalance(CampaignInstance.address);

        assert.equal(numContributions, 1, 'there should be 1 contribution');
        assert.equal(funds, 1, '1 ether should have been contributed');
        assert.equal(contribution[0], 1, 'contribution amount should be 1');
        assert.equal(campaignBalance, 1, 'Campaign balance should be 1');
      });
  })
});
