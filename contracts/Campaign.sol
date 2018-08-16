pragma solidity ^0.4.24;

import "./EthFundMe.sol";
import "./EmergencyStoppable.sol";
import "../node_modules/zeppelin-solidity/contracts/ReentrancyGuard.sol";

contract Campaign is ReentrancyGuard, EmergencyStoppable {

  /**
    Implement EmergencyStoppable Interface
   */
  function isAuthorized() 
    internal 
    returns(bool)
  {
    return efm.isAdmin(msg.sender);
  }

  /**
    DATA STRUCTURES
   */

  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected,
    Cancelled
  }
  
  enum CampaignStates {
    Pending,
    Active,
    Successful,
    Unsuccessful,
    Cancelled
  }

  struct Contribution {
    address addr;
    uint amount;
    uint timestamp;
  }


  ApprovalStates public approvalState = ApprovalStates.Commit;
  CampaignStates public campaignState = CampaignStates.Pending;


  /**
    STATE VARIABLES
   */

  EthFundMe public efm;

  uint public funds = address(this).balance;
  uint public endDate;

  uint public id;
  string public title;
  uint public goal;
  uint public duration;
  string public description;
  string public image;
  address public manager;

  Contribution[] public contributions;
  mapping (address => uint) public totalContributed;
  mapping (address => bool) public hasContributed;
  mapping (address => bool) public hasWithdrawn;

  uint public numApprovals;
  uint public numRejections;

  uint public numVoteSecrets;
  uint public numVoteReveals;

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;

  /**
    CONSTRUCTOR
   */

  constructor(
    uint _id, 
    string _title, 
    uint _goal,  
    uint _duration, 
    string _description,
    string _image,
    address _manager,
    address efmAddress
  ) public {
    id = _id;
    title = _title;
    goal = _goal;
    duration = _duration * 1 days;
    description = _description;
    image = _image;
    manager = _manager;
    efm = EthFundMe(efmAddress);
  }

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION
  modifier onlyAdmin() {
    require(efm.isAdmin(msg.sender));
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender] == true);
    _;
  }

  modifier onlyNotRevealedAdmin() {
    require(hasRevealed[msg.sender] == false);
    _;
  }

    modifier onlyNotManager() {
    require(msg.sender != manager);
    _;
  }

  modifier onlyManager() {
    require(msg.sender == manager);
    _;
  }

  modifier onlyManagerOrAdmin() {
    // FIXME: Is this modifier still used/required? 
    require(msg.sender == manager || efm.isAdmin(msg.sender));
    _;
  }

  modifier onlyHasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false);
    _;
  }

  modifier onlyHasContributed() {
    require(hasContributed[msg.sender] == true);
    _;
  }

  // STATE MANAGEMENT

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState);
    _;
  }

  modifier onlyBeforeCampaignEnd() {
    require(campaignState <= CampaignStates.Active);
    _;
  }

  modifier onlyAfterCampaignEnd() {
    require(campaignState > CampaignStates.Active);
    _;
  }

  // FIXME: Could be renamed to endCampaign
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

  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState);
    _;
  }

  modifier endCommit() {
    _;
    if (numVoteSecrets == 3) {
      approvalState = ApprovalStates.Reveal;
    }
  }

  // Doesn't require all votes to be revealed only enough.
  modifier endReveal() {
    _;
    if (numApprovals >= 2) {
      approvalState = ApprovalStates.Approved;
      onApproval();
    } 
    if (numRejections >= 2) {
      approvalState = ApprovalStates.Rejected;
      onRejection();
    }
  }

  // INPUT VALIDATION

  modifier validateContribution() {
    //No Zero Contributions
    require(msg.value > 0); 
     //Integer Overflow Protection
    require(funds + msg.value > funds);
    require(totalContributed[msg.sender] + msg.value > totalContributed[msg.sender]);
    _;
  }

  // PRIVATE FUNCTIONS

  function onApproval() 
    private 
  {
    endDate = now + duration;
    campaignState = CampaignStates.Active;
  }

  function onRejection() private {
    campaignState = CampaignStates.Unsuccessful;
  }

  function managerWithdrawl() private 
    onlyManager
  {
      hasWithdrawn[msg.sender] = true;
      funds = 0;
      msg.sender.transfer(address(this).balance);
  }

  function contributorWithdrawl() private 
    onlyHasContributed
  {
    hasWithdrawn[msg.sender] = true;
    funds -= totalContributed[msg.sender];
    msg.sender.transfer(totalContributed[msg.sender]);
  }

  /**
    INTERFACE
   */

  function vote(bytes32 secretVote) public 
    stoppedInEmergency
    onlyAdmin
    onlyDuringApprovalState(ApprovalStates.Commit) 
    endCommit {
      voteSecrets[msg.sender] = secretVote;
      if (hasVoted[msg.sender] == false) {
        numVoteSecrets++;
        hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public 
    stoppedInEmergency
    onlyVotedAdmin 
    onlyNotRevealedAdmin
    onlyDuringApprovalState(ApprovalStates.Reveal) 
    endReveal {
      require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);

      if (voteOption) {
        numApprovals++;
      } else {
        numRejections++;
      }

      numVoteReveals++;
      hasRevealed[msg.sender] = true;
  }

  function contribute() public payable 
    stoppedInEmergency
    onlyNotManager 
    transitionState
    onlyDuringCampaignState(CampaignStates.Active)
    validateContribution {
      hasContributed[msg.sender] = true;
      contributions.push(Contribution(msg.sender, msg.value, now));
      totalContributed[msg.sender] += msg.value;
      funds += msg.value;
    }
  
  // TODO: Might restrict this to only Managers
  function cancelCampaign() public
    stoppedInEmergency
    onlyManager
    transitionState
    onlyBeforeCampaignEnd
    {
      approvalState = ApprovalStates.Cancelled;
      campaignState = CampaignStates.Cancelled;
    }

  // FIXME: Consider removing this function. It's essentially unnecessary since withdraw will end the campaign
  // but it exists as a formal way of ending the campaign.
  function endCampaign() public 
    stoppedInEmergency
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
    {
    }

  // Wrapper to private function doing the actual work as described in ReentrancyGuard.sol
  function withdraw() external
    stoppedInEmergency
    nonReentrant // TODO: How do we test, need a reentrancy contract to call this function. 
    onlyHasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd {
      if (campaignState == CampaignStates.Successful) {
        managerWithdrawl();
      }

      if(campaignState == CampaignStates.Unsuccessful || campaignState == CampaignStates.Cancelled) {
        contributorWithdrawl();
      }
  }

  function emergencyWithdraw() external
    onlyInEmergency
    nonReentrant
    onlyHasNotWithdrawn
    {
      contributorWithdrawl();
    }

  // GETTERS

  function getNumContributions() public view returns(uint numContributions) {
    return contributions.length;
  }

  // HELPERS

  function isActive() public view returns(bool) {
    return (block.timestamp < endDate);
  }

  function getBlockTimestamp() public view returns(uint) {
    return block.timestamp;
  }

  function transitionCampaign() public
    stoppedInEmergency
    transitionState 
  {
    
  }

  function getTotalContributedFunds() public view returns(uint) {
    uint result = 0;
    for (uint i = 0; i < contributions.length; i++) {
      result += contributions[i].amount;
    }
    return result;
  }

}