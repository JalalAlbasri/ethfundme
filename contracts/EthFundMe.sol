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
    uint timestamp;
  }

  struct Contributor {
    uint amountContributed;
    Contribution[] contributions;
  }

  States public state;
  uint public id;
  string public title;
  uint public goal;
  address public manager;
  mapping (address => Contributor) public contributors;
  uint public funds;

  

  constructor(uint _id, string _title, uint _goal, address _manager) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
    state = States.Pending;
    //TODO: create a poll for administrators to approve/reject the campaign.
  }

  function contribute() public payable {
    //FIXME: check msg.value is positive integer
    contributors[msg.sender].contributions.push(Contribution(msg.value, now));
    
    //FIXME: Check these for integer overflow
    contributors[msg.sender].amountContributed += msg.value;
    funds += msg.value;
  }
  
  //FIXME: what happens if address passed in hasn't made a contribution?
  //maybe need to require that a contributor exists at that address
  function getNumContributions(address contributor) public view returns(uint numContributions) {
    numContributions = contributors[contributor].contributions.length;
  }

  function getContribution(address contributor, uint i) public view returns(uint amount, uint timestamp) {
    amount = contributors[contributor].contributions[i].amount;
    timestamp = contributors[contributor].contributions[i].timestamp;
  }



}