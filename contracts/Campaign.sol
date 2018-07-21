pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";
// TODO: Split Contract Files

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

  enum ApprovalStates {
    Commit,
    Reveal,
    Approved,
    Rejected
  }

  ApprovalStates public approvalState = ApprovalStates.Commit;

  uint public numApprovals;
  uint public numRejections;

  uint public numVoteSecrets;
  uint public numVoteReveals;

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;


  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  function onApproval() internal;
  function onRejection() internal;

  modifier onlyDuringApprovalState(ApprovalStates _approvalState) {
    require(approvalState == _approvalState);
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender]);
    _;
  }

  modifier endCommit() {
    _;
    if (numVoteSecrets == 3) {
      approvalState = ApprovalStates.Reveal;
    }
  }

  modifier tallyVotes(bool voteOption) {
    _;
    
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

  // modifier timedTransitions() {
  //     if (stage == Stages.Commit &&
  //                 now >= creationTime + 10 minutes)
  //         nextStage();
  //     if (stage == Stages.Reveal &&
  //             now >= creationTime + 10 minutes)
  //         nextStage();
  //     _;
  // }

  function vote(bytes32 secretVote) public onlyAdmin onlyDuringApprovalState(ApprovalStates.Commit) endCommit {
    voteSecrets[msg.sender] = secretVote;
    if (hasVoted[msg.sender] == false) {
      numVoteSecrets++;
      hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public onlyVotedAdmin onlyDuringApprovalState(ApprovalStates.Reveal) endReveal {
    require(hasRevealed[msg.sender] == false);
    require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);
    
    hasRevealed[msg.sender] = true;
    numVoteReveals++;

    if (voteOption) {
      numApprovals++;
    } else {
      numRejections++;
    }
  }
}

// TODO: Timed Campaign
// TODO: Payout on Campaign End

contract Campaign is Approvable {

  enum CampaignStates {
    Pending,
    Open,
    Successful,
    Unsuccessful
  }

  struct Contribution {
    uint amount;
    uint timestamp;
  }

  struct Contributor {
    uint totalContributed;
    uint numContributions;
    mapping (uint => Contribution) contributions;
  }

  // STATE VARIABLES

  CampaignStates public campaignState = CampaignStates.Pending;
  uint public id;
  string public title;
  uint public goal;
  address public manager;
  uint public funds;

  uint public numContributors;
  mapping (address => Contributor) public contributors;
  mapping (address => bool) public hasContributed;

  // CONSTRUCTOR

  constructor(uint _id, string _title, uint _goal, address _manager, address efmAddress) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
  }

  // MODIFIERS

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState);
    _;
  }

  modifier notManager() {
    require(msg.sender != manager);
    _;
  }

  modifier validateContribution() {
    require(msg.value > 0); //No Zero Contributions
    require(funds + msg.value > funds); //Integer Overflow Protection
    require(contributors[msg.sender].totalContributed + msg.value > contributors[msg.sender].totalContributed);
    _;
  }

  modifier newContributor() {
    if (!hasContributed[msg.sender]) {
      contributors[msg.sender] = Contributor({
        totalContributed: 0,
        numContributions: 0
      });
      hasContributed[msg.sender] = true;
      numContributors++;
    }
    _;
  }

  modifier onlyManagerOrAdmin() {
    require(msg.sender == manager || efm.isAdmin(msg.sender));
    _;
  }


  // INTERNAL FUNCTIONS

  function onApproval() internal {
    campaignState = CampaignStates.Open;
  }

  function onRejection() internal {
    campaignState = CampaignStates.Unsuccessful;
  }

  // PUBLIC FUNCTIONS

  function contribute() public payable 
    onlyDuringCampaignState(CampaignStates.Open) 
    notManager 
    newContributor 
    validateContribution {
      contributors[msg.sender].contributions[contributors[msg.sender].numContributions] = Contribution(msg.value, now);
      contributors[msg.sender].numContributions++;
      contributors[msg.sender].totalContributed += msg.value;
      funds += msg.value;
  }
  
  function endCampaign() public onlyManagerOrAdmin {
      campaignState = CampaignStates.Unsuccessful;
    }

  // GETTERS

  function getTotalContributed(address contributor) public view returns(uint totalContributed) {
    totalContributed = contributors[contributor].totalContributed;
  }
  
  function getNumContributions(address contributor) public view returns(uint numContributions) {
    numContributions = contributors[contributor].numContributions;
  }

  function getContribution(address contributor, uint i) public view returns(uint amount, uint timestamp) {
    amount = contributors[contributor].contributions[i].amount;
    timestamp = contributors[contributor].contributions[i].timestamp;
  }


  


}