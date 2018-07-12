pragma solidity ^0.4.24;

contract EthFundMe {
  address[] public admins;
  uint public numCampaigns;
  mapping(uint => address) public campaigns;

  constructor(address[] _admins) public {
    admins = _admins;
  }

  function getNumAdmins() public view returns(uint) {
    return admins.length;
  }

  function getAdmins() public view returns(address[]) {
    return admins;
  }

  function createCampaign(string title, uint goal) public returns(address) {
    Campaign newCampaign = new Campaign(numCampaigns, title, goal, msg.sender);
    campaigns[numCampaigns] = address(newCampaign);
    numCampaigns++;
    return address(newCampaign);
  }

}

contract Campaign {
  enum States {
    Pending, 
    Open, 
    Closed, 
    Rejected
  }

  struct Contribution {
    uint amount;
  }

  struct Contributor {
    address contributorAddress;
    uint totalContributed;
    mapping (uint => Contribution) contributions;
  }

  States public state;
  uint public id;
  string public title;
  uint public goal;
  address public manager;
  mapping (uint => Contributor) public contributors;
  uint public funds;

  constructor(uint _id, string _title, uint _goal, address _manager) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
    state = States.Pending;
  }

}