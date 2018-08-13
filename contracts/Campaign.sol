pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";

// It is a good practice to structure functions which interact
// with other contracts (i.e. call functions or send Ether)
// into three phases:
// 1. check conditions
// 2. perform actions (potentially change conditions)
// 3. interact with other contracts
// If these phases get mixed up, the other contract might call
// back into the current contract and change the state or cause
// effects (ether payout) to be done multiple times.
// If functions that are called internally include interactions with external
// contracts, they have to be considered interaction with
// external contracts too.

contract Administrated {
  EthFundMe public efm;
  
  constructor(address efmAddress) public {
    efm = EthFundMe(efmAddress);
  }

  modifier onlyAdmin {
    require(efm.isAdmin(msg.sender));
    _;
  }

}

contract Approvable is Administrated {

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

  ApprovalStates public approvalState = ApprovalStates.Commit;

  /**
    STATE VARIABLES
   */

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

  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  /**
    ABSTRACT FUNCTIONS
   */

  function onApproval() internal;
  function onRejection() internal;

  /**
    MODIFIERS
   */

  // ACCESS RESTRICTION

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender] == true);
    _;
  }

  modifier onlyNotRevealedAdmin() {
    require(hasRevealed[msg.sender] == false);
    _;
  }

  // STATE MANAGEMENT

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

  /**
    INTERFACE
   */

  function vote(bytes32 secretVote) public 
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
}

contract Campaign is Approvable {

  /**
    DATA STRUCTURES 
   */


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

  /**
    STATE VARIABLES
   */

  CampaignStates public campaignState = CampaignStates.Pending;
  uint public funds = address(this).balance;
  uint public endDate;

  uint public id;
  string public title;
  uint public goal;
  uint public duration;
  address public manager;

  Contribution[] public contributions;
  mapping (address => uint) public totalContributed;
  mapping (address => bool) public hasContributed;
  mapping (address => bool) hasWithdrawn;


  /**
    CONSTRUCTOR
   */

  constructor(
    uint _id, 
    string _title, 
    uint _goal,  
    uint _duration, 
    address _manager, 
    address efmAddress
  ) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    duration = _duration * 1 days;
    manager = _manager;
  }

  // STATE TRANSITION/RESTRICTION

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

  // ACCESS RESTRICTION

  modifier notManager() {
    require(msg.sender != manager);
    _;
  }

  modifier onlyManagerOrAdmin() {
    require(msg.sender == manager || efm.isAdmin(msg.sender));
    _;
  }

  modifier hasNotWithdrawn() {
    require(hasWithdrawn[msg.sender] == false);
    _;
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
  
  /**
    FUNCTIONS
   */

  // INTERNAL FUNCTIONS

  function onApproval() internal {
    endDate = now + duration;
    campaignState = CampaignStates.Active;
  }

  function onRejection() internal {
    campaignState = CampaignStates.Unsuccessful;
  }

  // INTERFACE

  function contribute() public payable 
    notManager 
    transitionState
    onlyDuringCampaignState(CampaignStates.Active)
    validateContribution {
      hasContributed[msg.sender] = true;
      contributions.push(Contribution(msg.sender, msg.value, now));
      totalContributed[msg.sender] += msg.value;
      funds += msg.value;
    }
  
  function cancelCampaign() public
    onlyManagerOrAdmin
    transitionState
    onlyBeforeCampaignEnd
    {
      approvalState = ApprovalStates.Cancelled;
      campaignState = CampaignStates.Cancelled;
    }

  // FIXME: Consider removing this function. It's essentially unnecessary since withdraw will end the campaign
  // but it exists as a formal way of ending the campaign.
  function endCampaign() public 
    onlyManagerOrAdmin
    transitionState
    onlyAfterCampaignEnd
    {
    }

  function withdraw() public 
    hasNotWithdrawn
    transitionState 
    onlyAfterCampaignEnd {
      if (campaignState == CampaignStates.Successful) {
        require(msg.sender == manager);
        hasWithdrawn[msg.sender] = true;
        funds = 0;
        msg.sender.transfer(funds);
      }

      if(campaignState == CampaignStates.Unsuccessful || campaignState == CampaignStates.Cancelled) {
        require(hasContributed[msg.sender] == true);
        hasWithdrawn[msg.sender] = true;
        funds -= totalContributed[msg.sender];
        msg.sender.transfer(totalContributed[msg.sender]);
      }
  }

  // GETTERS
  // FIXME: Should the getters transition state?
  // Decide this when building the frontend. If it can help update state correctly in the frontend it
  // might be a good idea, otherwise it's unneccessary.

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

  function transitionCampaign() public transitionState returns(bool) {
    return true;
  }

}