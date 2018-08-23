pragma solidity ^0.4.24;

import "./Administrated.sol";
import "./Approvable.sol";
import "./EmergencyStoppable.sol";
import "../node_modules/zeppelin-solidity/contracts/ReentrancyGuard.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

/**
  @dev The Campaign Contract

  Manages and holds data for a Crowd Funding Campaign
  Produced by the CampaignFactory
  extends Approvable Contract allowing an Approval State to be managed.
  extends ReentrancyGaurd OpenZeppelin Library gaurding it against reentrancy attacks
  (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v1.10.0/contracts/ReentrancyGuard.sol)
  

  The Campaign Contract start in a Pending state and must be approved by admins to become active.
  
  Campaigns have a fixed duration. At the end of the Campaign if contributed funds are greater or
  equal to the goal the Campaign Manager will be allowed to withdraw all the Contract Funds via a 
  Pull Payment/Withdrawl pattern.

  It funding fails to meet the goal Contributors will be allowed to retrieve their contributed funds,
  again utilizing Pull Payment/Withdrawl pattern.

  At any point the Campaign can be cancelled by the Campaign Manager, in which case contributors will 
  be allowed to withdraw contributed funds.

  The Campaign is EmergencyStoppable and provides an EmergencyWithdraw function that will allow
  Contributors to retrieve their contributed funds in the event of Emergency.
 */

contract Campaign is Approvable, ReentrancyGuard {
  
  /**
    EVENTS
   */
  /**
    @dev Event emitted when the Campaign has been
    Approved and goes Campaign State changes to Active
    payload is the startDate of the campaign
   */   
  event campaignStarted (
    uint256 startDate
  );

  /**
    @dev Event emitted when the Campaign ends and 
    campaign State cahnges to Successful or Unsuccessful
    payload is the end date of the campaign and a boolean
    denoting the campaign's success or failure
   */     
  event campaignEnded (
    uint256 endDate,
    bool isSuccessful
  );

  /**
    @dev Event emitted when the Campaign is cancelled by the
    Campaign manager
    payload is the date the campaign was cancelled
   */     
  event campaignCancelled (
    uint256 cancelledDate
  );

  /**
    @dev Event emitted when a contribution is made to the Camapign
    payload is the address of the contributor and the amount in eth
    contributed
   */     
  event contributionMade (
    address contributor,
    uint256 amount
  );

  /**
    @dev Event emitted when a withdrawl is made from the Campaign
    payload is the address of the beneficiary and the amount withdrawn 
    in eth
   */     
  event withdrawlMade (
    address beneficiary,
    uint256 amount 
  );

  /**
    STATE VARIABLES
   */

  // DATA STRUCTURES

  /**
    Valid Campaign States.
   */
  enum CampaignStates {
    Pending,
    Active,
    Successful,
    Unsuccessful,
    Cancelled
  }

  /**
    Holds the details of a Contribution
    addr The address of a Contributor
    amount The amount contributed in eth
    timestamp The time of the contribution
   */
  struct Contribution {
    address addr;
    uint256 amount;
    uint256 timestamp;
    bool withdrawn;
  }

  // Initial Campaign State set to Pending
  // This means it is Pending Approval from admins before going active
  CampaignStates public campaignState = CampaignStates.Pending;

  /**
    Address of the Administrated Contract that will be used to determine 
    admin status of accounts.
   */
  Administrated public administrated;

  // The current funds in the Campaign
  // Initialized to Contract's balance in case the Contract is 
  // created with eth in the balance
  uint256 public funds = address(this).balance;

  // Tracks the total raised funds, since funds will be decremented
  // when withdrawls are made
  uint256 public totalRaised = funds;
  
  // The Campaign EndDate.
  // Will be set once the Campaign is Approved.
  uint256 public endDate;

  // Campaign Details
  uint256 public id;
  string public title;
  uint256 public goal;
  uint256 public duration;
  string public description;
  string public image; // url to an associated image
  address public manager;

  // Contributions are sotred in an Array instead of a mapping (address=> Contribution)
  // because we rarely need to retrieve Contributions individually but contributor but
  // more often as a set on Contributions e.g. for a UI
  Contribution[] public contributions;


  // These mappins are used in Withdrawl Functions to restrict access and determine
  // withdrawl amount for each contributor

  // Keeps track of whether an address has contributed
  mapping (address => bool) public hasContributed;
  // Keeps track of whether an address has withdrawn
  mapping (address => bool) public hasWithdrawn;

  /**
    @dev constructor
    @param _id The Campaign Id, corresponds to the index for the campaign address in the CampaignFactory
    @param _title The title of the Campaign
    @param _goal The funding goal in ether of the campaign
    @param _duration The intended duration of the Active campaign in days
    @param _description A description of the Campaign purposes
    @param _image The url of an image for the campaign
    @param _manager The Campaign Manager
    @param administratedAddress the address of currently deployed adminstrated Contract with current 
    // admin management information/functionality
   */

  constructor(
    uint256 _id, 
    string _title, 
    uint256 _goal,  
    uint256 _duration, 
    string _description,
    string _image,
    address _manager,
    address administratedAddress
  ) public {
    id = _id;
    title = _title;
    goal = _goal;
    duration = SafeMath.mul(_duration, 1 days);
    description = _description;
    image = _image;
    manager = _manager;
    administrated = Administrated(administratedAddress);
  }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  /**
    @dev modifier restricts access to only the Campaign Manager
   */
  modifier onlyManager() {
    require(msg.sender == manager, "Only campaign manager authorized");
    _;
  }
  
  /**
    @dev modifier restricts access to only not the Campaign Manager
   */
  modifier onlyNotManager() {
    require(msg.sender != manager, "Campaign manager not authorized");
    _;
  }

  /**
    @dev modifier restricts access to only the Campaign Manager of an Admin
   */
  modifier onlyManagerOrAdmin() {
    require(msg.sender == manager || administrated.isAdmin(msg.sender), "Only campaign manager or admin authorized");
    _;
  }


  /**
    @dev modifier restricts access to only accounts that have not made a withdrawl
   */
  modifier onlyHasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false, "User has already withdrawn");
    _;
  }

  /**
    @dev modifier restricts access to only accounts that have made a contribution
   */
  modifier onlyHasContributed() {
    require(hasContributed[msg.sender] == true, "User has not contributed");
    _;
  }

  // STATE MANAGEMENT
  /**
    @dev modifier restricts access to only during given campaign state
   */
  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState, "Incorrect campaignState for function");
    _;
  }
  
  /**
    @dev modifier restricts access to only before the campaign has ended
   */
  modifier onlyBeforeCampaignEnd() {
    require(campaignState <= CampaignStates.Active, "Campaign must be active");
    _;
  }
  
  /**
    @dev modifier restricts access to only after the campaign has ended
   */
  modifier onlyAfterCampaignEnd() {
    require(campaignState > CampaignStates.Active, "Campaign must have ended");
    _;
  }

  /**
    @dev modifier transitions the campaign state before function execution
    Will determine the success/failure of the campaign 
   */
  modifier transitionState() {
    if (campaignState == CampaignStates.Active && block.timestamp > endDate
    ) {
      
      if (funds >= goal) {
        campaignState = CampaignStates.Successful;
      } else {
        campaignState = CampaignStates.Unsuccessful;
      }

    }
    _;
  }

  // INPUT VALIDATION
  /**
    @dev modifier validates contributions for interger overflow errors 
   */
  modifier validateContribution() {
    //No Zero Contributions
    require(msg.value > 0, "No zero contributions"); 
     //Integer Overflow Protection
    require(SafeMath.add(funds, msg.value) > funds, "Integer overflow check failed");
    // require(funds + msg.value > funds, "Integer overflow check failed");
    _;
  }

  // FUNCTIONS

  /**
    @dev returns true if msg.sender has the admin role
    This funstion is required to be implemented by the EmergencyStoppable and Approvable Interfaces.
    It is used to determine if the calling user (msg.sender) has the authority to stop/start
    the contract.
  */
  function isAuthorized() 
    internal 
    returns(bool)
  {
    return administrated.isAdmin(msg.sender);
  }

  /**
    @dev returns the number of admins
    This function is required by the Approvable interface to determine the number of voters
   */
  function getNumVoters()
    internal
    returns(uint256)
  {
    return administrated.numAdmins();
  }

  /**
    @dev implements the onApproval function from the Approvable Contract
    Called by Approvable Contract once a Contract is Approved.
    Transitions the Campaign into it's Active state and sets the endDate
    for the Campaign
   */
  function onApproval() internal 
  {
    endDate = SafeMath.add(block.timestamp, duration);
    campaignState = CampaignStates.Active;
    emit campaignStarted(block.timestamp);
  }

  /**
    @dev Implements the onRejection function from the Approvable Contract
    Called by the Approvable Contract once a Contract is Rejected
    Transitions the Campaign into the Unsuccessful State
   */
  function onRejection() internal
  {
    campaignState = CampaignStates.Unsuccessful;
  }

  /**
    @dev allows the Campaign Manager to withdraw all Contract Funds
    utilizing the Withdrawl Pattern
   */
  function managerWithdrawl() private 
    onlyManager
  {
    hasWithdrawn[msg.sender] = true;
    funds = 0;
    emit withdrawlMade(msg.sender, address(this).balance);
    msg.sender.transfer(address(this).balance);
  }

  /**
    @dev allows a Campaign Contributor to withdraw their contributed
    funds utilizing the Withdrawl Pattern
   */
  function contributorWithdrawl() private 
    onlyHasContributed
  {
    hasWithdrawn[msg.sender] = true;

    uint totalContributed = 0;

    for (uint i = 0; i < contributions.length; i++) {
      if (contributions[i].addr == msg.sender && contributions[i].withdrawn == false) {
        // totalContributed += contributions[i].amount;
        totalContributed = SafeMath.add(totalContributed, contributions[i].amount);
        contributions[i].withdrawn = true;
      }
    }

    // funds -= totalContributed;
    funds = SafeMath.sub(funds, totalContributed);

    // If the campaign is still active withdrawl is an emergency withdrawl
    // In that case decrement the withdrawl amount from totalRaised
    if (campaignState == CampaignStates.Active) {
      // totalRaised -= totalContributed;
      totalRaised = SafeMath.sub(totalRaised, totalContributed);
    }
    emit withdrawlMade(msg.sender, totalContributed);
    msg.sender.transfer(totalContributed);
  }

  /**
    INTERFACE
   */
  /**
    @dev Allows a Contribution to be made
    Disallowed during Emergency (Stopped State)
    Restricted to not the Campaign Manager
    Will transition state before executing. Will revert if Campaign has ended.
    No Zero Contributions are allowed
   */
  function contribute() public payable 
    stoppedInEmergency
    onlyNotManager 
    transitionState
    onlyDuringCampaignState(CampaignStates.Active)
    validateContribution 
  {
    hasContributed[msg.sender] = true;
    hasWithdrawn[msg.sender] = false;
    contributions.push(Contribution(msg.sender, msg.value, block.timestamp, false));
    // funds += msg.value;
    funds = SafeMath.add(funds, msg.value);
    // totalRaised += msg.value;
    totalRaised = SafeMath.add(totalRaised, msg.value);
    emit contributionMade(msg.sender, msg.value);
  }

  /**
    @dev Allows the Campaign Manager to Cancel the Campaign at any point
    before the Campaign is Over.
    If Contributions have been made Contributors will be allowed to retrieve their funds
    Disallowed during Emergency (Stopped State)
   */    
  function cancelCampaign() public
    stoppedInEmergency
    onlyManager
    transitionState
    onlyBeforeCampaignEnd
  {
    approvalState = ApprovalStates.Cancelled;
    campaignState = CampaignStates.Cancelled;
    emit campaignCancelled(block.timestamp);
  }

  /**
    @dev Allows the Campaign Manager or an Admin to transition Campaign state
    if the end date has been reached.
    Disallowed during Emergency (Stopped State)
   */    
  function endCampaign() public 
    stoppedInEmergency
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
  {
    emit campaignEnded(block.timestamp, (campaignState == CampaignStates.Successful));
  }

  // Wrapper to private function doing the actual work as described in ReentrancyGuard.sol
  function withdraw() external
    stoppedInEmergency
    nonReentrant // modifier from ReentracyGuard OpenZeppelin Library protects against being called again
    onlyHasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd 
  {
    // If the Campaign was Successful only the Campaign Manager is allowed to withdraw funds
    if (campaignState == CampaignStates.Successful) {
      managerWithdrawl();
    }

    // If the Campaign was Unsuccessful or Cancelled Contributors are allowed to withdraw their
    // contributed funds
    if(campaignState == CampaignStates.Unsuccessful || campaignState == CampaignStates.Cancelled) {
      contributorWithdrawl();
    }
  }

  /**
    @dev Allows Contributors to withdraw their contributed funds if the Campaign is put into an
    Emergency stopped state by an admin
   */
  function emergencyWithdraw() external
    onlyInEmergency
    nonReentrant
    onlyHasNotWithdrawn
  {
    contributorWithdrawl();
  }

  // GETTERS

  /**
    @dev returns the number of contributions (length on contributions array)
   */
  function getNumContributions() public view returns(uint256 numContributions) {
    return contributions.length;
  }

  // TESTING/UI HELPERS
  // These functions are not crucial to contract functionality but useful for 
  // testing and UI 

  /**
    @dev calculates whether or not the Campaign is Active
    Will not return false positive on Pending state becuase endDate will be 0
   */
  function isActive() public view returns(bool) {
    return (block.timestamp < endDate);
  }

  /**
    @dev returns the current block timestamp
    Used in testing.
   */
  function getBlockTimestamp() public view returns(uint256) {
    return block.timestamp;
  }

  /**
    @dev triggers the transtionCampaign modifier
   */
  function transitionCampaign() public
    stoppedInEmergency
    transitionState 
  {
    
  }

  /**
    @dev Returns uint256 representation of campaignState
    Only used in TestCampaignFactory Solidity Test since we can't check enum returns
 */
  function getCampaignState() public 
    stoppedInEmergency
    transitionState
    returns(uint256) 
  {
    return uint256(campaignState);
  }

  /**
    @dev Returns the total eth contributed by given user.
    Useful for UI purposes.
   */
  function getTotalContributed() 
    public
    view
    returns (uint)
  {
    uint256 totalContributed = 0;
    for (uint256 i = 0; i < contributions.length; i++) {
      if (contributions[i].addr == msg.sender) {
        // totalContributed += contributions[i].amount;
        totalContributed = SafeMath.add(totalContributed, contributions[i].amount);
      }
    }
    return totalContributed;
  }

}