pragma solidity ^0.4.24;

// import "./Approvable.sol";
import "./EmergencyStoppable.sol";
import "./Campaign.sol";


// Contract Development 1
// DONE: Timing campaigns
// DONE: Ending Campaign and Payouts
// DONE: Manager can cancel Campaign before approved
// DONE: Rewrite state transition according to solidy state machine pattern

// Contract Developement 2
// TASK: Implement Circuit Breaker Pattern!
// TASK: Use a Library
// TASK: Comment Contracts and Tests
// TASK: Review All variable/function etc Names
// TASK: Review All variable/function etc accessibility
// TASK: Split Contract Files
// TASK: Write Solidity Tests
// TASK: Review uints and restrict size if possible
// DONE: Use a library/Package to advance time in tests
// TASK: Review Security Best Practices
// TASK: Review Design Patterns
// TASK: Error messages for require statements
// TASK: Campaign Factory Contract

// Frontend
// TASK: Set up React Project and React Crash Course
// TASK: Frontend
// TASK: Events + Listening for them

// Submitable
// TASK: Packaging and Other Documentation
// TASK: Make sure it works on Ubuntu
// TASK: Review Grading Rubric
// TASK: Release on testnet

// import 'zeppelin-solidity/contracts/access/rbac/RBAC.sol';
// contract EthFundMe is RBAC, EmergencyStoppable {

contract EthFundMe is EmergencyStoppable {

  modifier onlyAdmin() {
    require(isAdmin[msg.sender]);
    _;
  }

  /**
    IMPLEMENT EmergencyStoppable INTERFACE

   */
    function isAuthorized() internal 
    onlyAdmin
    returns(bool) 
  {
    return true;
  }

  /**
    EVENTS
   */
  event CampaignCreated (
    address indexed campaignAddress
  );
  

  /**
    ADMINS
   */
  address[] public admins;
  mapping (address=> bool) public isAdmin;

  /**
    Allows initialization of the contract with up to 3 admins
   */
  constructor(address[] _admins) public {
    //FIXME: Can I put a require statement in a contructor? What happens if it fails?
    require(_admins.length <= 3);
    
    admins = _admins;
    for (uint i = 0; i < admins.length; i++) {
      isAdmin[admins[i]] = true;
    }
  }

  function getNumAdmins() public view returns (uint) {
    return admins.length;
  }

  /**
    CAMPAIGNS
  */
  address[] public campaigns;

  function getNumCampaigns() public view returns (uint) {
    return campaigns.length;
  }
  
  modifier notAdmin() {
    require(isAdmin[msg.sender] == false, "Admins cannot create campaigns");
    _;
  }

  function createCampaign(string title, uint goal, uint duration, string description, string image) public 
    stoppedInEmergency
    notAdmin
    returns(address) {
    Campaign newCampaign = new Campaign(campaigns.length, title, goal, duration, description, image, msg.sender, address(this));
    campaigns.push(address(newCampaign));
    emit CampaignCreated(address(newCampaign));
    return address(newCampaign);
  }

}

