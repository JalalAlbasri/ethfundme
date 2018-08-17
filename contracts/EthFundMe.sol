// Contract Development 1
// DONE: Timing campaigns
// DONE: Ending Campaign and Payouts
// DONE: Manager can cancel Campaign before approved
// DONE: Rewrite state transition according to solidy state machine pattern

// Contract Developement 2
// DONE: Implement Circuit Breaker Pattern!
// DONE: Use a Library
  // DONE: -- Change tests to use new admin style (they must add admins)
  // DONE:L -- setup script must add admins
  // -- DONE: reveal logic must check num admins and take majority
  // -- TASK: UI for stopping efm
  // -- TASK: UI for adding admins
  // -- DONE: Make Administerable/Administrated a super class of efm and campaign and put rbac stuff in it
// DONE: Split Contract Files (Campaign/Approvable)
// DONE: Events
// DONE: Error messages for require statements
// DONE: Write Solidity Tests
// TASK: Make sure tests work on -b 3
// TASK: Comment Contracts and Tests
// TASK: Review All variable/function etc Names
// TASK: Review All variable/function etc accessibility
// TASK: Review uints and restrict size if possible (at least make them uint256)
// DONE: Use a library/Package to advance time in tests
// TASK: Change ETHFUNDME to CampaignFactory
// TASK: Put all setup scripts into one, make more campaigns and time travel so that ~half are complete
// TASK: Use OpenZeppelin Safemath
// TASK: Approvable in its own file?

// TASK: Review Security Best Practices - writeup
// TASK: Review Design Patterns - writeup

// Frontend
// DONE: Set up React Project and React Crash Course
// DONE: Frontend
// TASK: Listening for Events
  // -- Check events in tests too

// Submitable
// TASK: Packaging and Other Documentation
// TASK: Make sure it works on Ubuntu
// TASK: Review Grading Rubric
// TASK: Release on testnet

pragma solidity ^0.4.24;

import "./Administrated.sol";
import "./EmergencyStoppable.sol";
import "./Campaign.sol";

contract EthFundMe is Administrated, EmergencyStoppable {

  /**
    Implement EmergencyStoppable Interface
   */
  function isAuthorized() internal 
    returns(bool)
  {
    return isAdmin(msg.sender);
  }
  
  constructor() public {
  }

  /**
    EVENTS
   */
  event CampaignCreated (
    address indexed campaignAddress
  );

  /**
    CAMPAIGNS
  */
  address[] public campaigns;

  function getNumCampaigns() public view returns (uint) {
    return campaigns.length;
  }
  
  function createCampaign(string title, uint goal, uint duration, string description, string image) public 
    stoppedInEmergency
    notAdmin
    returns(address)
  {
    Campaign newCampaign = new Campaign(campaigns.length, title, goal, duration, description, image, msg.sender, address(this));
    campaigns.push(address(newCampaign));
    emit CampaignCreated(address(newCampaign));
    return address(newCampaign);
  }

}

