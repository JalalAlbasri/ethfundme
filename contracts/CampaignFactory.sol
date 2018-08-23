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
  // -- DONE: Make Administerable/Administrated a super class of efm and campaign and put rbac stuff in it
// DONE: Split Contract Files (Campaign/Approvable)
// DONE: Events
// DONE: Error messages for require statements
// DONE: Write Solidity Tests
// DONE: Comment Contracts
// DONE: Review All variable/function etc Names
// DONE: Review All variable/function etc accessibility
// DONE: Review uint256s and restrict size if possible (at least make them uint256)
// DONE: Use a library/Package to advance time in tests
// DONE: Change CampaignFactory to CampaignFactory
// TASK: Use OpenZeppelin Safemath - Use OpenZeppelin from EthPm
// DONE: Approvable in its own file?
// DONE: Put all setup scripts into one, make more campaigns and time travel so that ~half are complete
// TASK: Have setup script leave from campaigns in reveal stage.
// TASK: Put 'Log' on Event Names
// DONE: Add a License

// TESTS:
// DONE: Make sure tests work on -b 3
// DONE: use increaseTime from openzeppelin! Test 
// DONE: Put All Transactions into their own it statement
// DONE: Comment Tests
// DONE: Homogenize import statements
// DONE: Number in test name
// DONE: Reenable solidity test
// TASK: Rename VoteSecret/Option to Approve Reject for clarity
// DONE: Check events in tests too

// DONE: Review Security Best Practices - writeup
// DONE: Review Design Patterns - writeup
// TASK: Put UI Screenshots in Readme?

// Frontend
// DONE: Fix Contribute
// DONE: Set up React Project and React Crash Course
// DONE: Frontend
// DONE: Listening for Events
  // -- TASK: UI for stopping CampaignFactory
  // -- TASK: UI for adding admins
  // DONE: Progress Calculator, use funds when active, use totalRaised when Successful/Unsuccessful
  // DONE: Fix Withdrawn in ui, show when active
  // DONE: Rename getTotalContributed to getTotalRaisedFunds
  // DONE: Don't show goalProgress on Pending Campaign
  // TASK: Use Events to Update UI.

// Submitable
// TASK: Packaging and Other Documentation
// TASK: Make sure it works on Ubuntu
// TASK: Review Grading Rubric
// TASK: Release on testnet

pragma solidity ^0.4.24;

import "./Administrated.sol";
import "./EmergencyStoppable.sol";
import "./Campaign.sol";

/**
  @title CampaignFactory
  @dev The Initial Contract deployed by this project.
  
  CampaignFactory has a single function in it's interface, createCampaign that is intended
  to be used by Users creating a new Crowd Funding Campaign.
  
  Create Campaign is the Campaign Factory function that will deploy a new instance of
  the Campaign Contract.

  CampaignFactory extends the Administrated and EmergencyStoppable Contracts. Allowing it to access
  Admin verification and management functions and EmergencyStoppable behaviour.

  It passes it's own address to the Campaign Contract constructor so that Campaigns can 
  access Administrated Admin verification functions through CampaignFactory.
 */

contract CampaignFactory is Administrated, EmergencyStoppable {

  /**
    Implement EmergencyStoppable Interface
   */

  /**
    @dev returns true if msg.sender has the admin role
    This funstion is required to be implemented by the EmergencyStoppable Interface.
    It is used to determine if the calling user (msg.sender) has the authority to stop/start
    the contract.
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

  /**
    @dev Event emitted when a Campaign is created from the Campaign Factory
    The payload is the newly created Campaign's address
   */
  event CampaignCreated (
    address indexed campaignAddress
  );

  /**
    STATE VARIABLES
  */

  // array to hold addresses of campaigns
  address[] public campaigns;

  /**
    INTERFACE
   */
  /**
    @dev Creates a new Campaign Contract and deploys it.
    @param title The title of the Campaign
    @param goal The funding goal in ether of the campaign
    @param duration The intended duration of the Active campaign in days
    @param description A description of the Campaign purposes
    @param image The url of an image for the campaign

    The main interface function for this Contract. Creates and deploys and new Campaign Contract
    It passes msg.sender as the campaign manager and the address of this contract so that Camapaign
    Contracts can access Administrated functionality (verifying admins)
   */
  function createCampaign(string title, uint256 goal, uint256 duration, string description, string image) public 
    stoppedInEmergency
    notAdmin
    returns(address)
  {
    Campaign newCampaign = new Campaign(campaigns.length, title, goal, duration, description, image, msg.sender, address(this));
    campaigns.push(address(newCampaign));
    emit CampaignCreated(address(newCampaign));
    return address(newCampaign);
  }

  /**
    GETTERS
   */

  /**
    @dev returns the number of campaigns created
    Since we use an array to hold the campaigns we dont need a numCampaigns variable
    like if we had used a mapping but we need a getter function if we want to get the 
    length of the array
   */
  function getNumCampaigns() public view returns (uint256) {
    return campaigns.length;
  }

}

