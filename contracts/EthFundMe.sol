// Contract Development 1
// DONE: Timing campaigns
// DONE: Ending Campaign and Payouts
// DONE: Manager can cancel Campaign before approved
// DONE: Rewrite state transition according to solidy state machine pattern

// Contract Developement 2
// DONE: Implement Circuit Breaker Pattern!
// TASK: Use a Library
  // -- Change tests to use new admin style (they must add admins)
  // -- setup script must add admins
  // -- reveal logic must check num admins and take majority
  // -- UI for stopping efm
  // -- UI for adding admins
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

pragma solidity ^0.4.24;

import "./EmergencyStoppable.sol";
import "./Campaign.sol";
import '../node_modules/zeppelin-solidity/contracts/access/rbac/RBAC.sol';

contract EthFundMe is RBAC, EmergencyStoppable {

  /**
   * A constant role name for indicating admins.
   */
  string public constant ROLE_ADMIN = "admin";
  uint public numAdmins = 1;

  /**
   * @dev modifier to scope access to admins
   * // reverts
   */
  modifier onlyAdmin()
  {
    checkRole(msg.sender, ROLE_ADMIN);
    _;
  }

  modifier notAdmin()
  {
    require(!hasRole(msg.sender, ROLE_ADMIN));
    _;
  }

  /**
   * @dev constructor. Sets msg.sender as admin by default
   */
  constructor() public {
    addRole(msg.sender, ROLE_ADMIN);
  }

  /**
   * @dev add a role to an account
   * @param _account the account that will have the admin role
   */
  function addAdminRole(address _account)
    public
    onlyAdmin
  {
    addRole(_account, ROLE_ADMIN);
    numAdmins++;
  }

  /**
   * @dev remove a role from an account
   * @param _account the account that will no longer have the admin role
   */
  function removeAdminRole(address _account)
    public
    onlyAdmin
  {
    removeRole(_account, ROLE_ADMIN);
    numAdmins--;
  }

  function isAdmin(address _address) 
    public
    view
    returns(bool)
  {
    return hasRole(_address, ROLE_ADMIN);
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
    CAMPAIGNS
  */
  address[] public campaigns;

  function getNumCampaigns() public view returns (uint) {
    return campaigns.length;
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

