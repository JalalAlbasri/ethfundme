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
        campaignInstance = Campiagn.at(address);
        campaignInstance.id.call();
      })
      .then(_id => {
        id = _id;
        campaignInstance.title.call();
      })
      .then(_title => {
        title = _title;
        campaignInstance.goal.call();
      })
      .then(_goal => {
        goal = _goal;
        campaignInstance.manager.call();
      })
      .then(_manager => {
        manager = _manager;
        campaignInstance.state.call();
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
        assert.equal(
          manager,
          accounts[3],
          'campaign manager should be accounts[3]'
        );
        assert.equal(state, 0, 'state should be 0 (State.Pending)');
      });
  });
});
