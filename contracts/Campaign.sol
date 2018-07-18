pragma solidity ^0.4.24;

import "./EthFundMe.sol";
// import "./Approvable.sol";

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

  enum PollStates {
    Commit,
    Reveal,
    Concluded
  }

  enum ApprovalStates {
    Pending,
    Approved,
    Rejected
  }

  PollStates public pollState = PollStates.Commit;
  ApprovalStates public approvalState = ApprovalStates.Pending;

  uint public numApprovals;
  uint public numRejections;

  uint public numVotes; //TODO: change to numVoteSecrets
  uint public numReveals; //TODO: change to numVoteReveals

  mapping(address => bytes32) public voteSecrets;
  mapping(address => bool) public hasVoted;
  mapping(address => bool) public hasRevealed;


  constructor(address efmAddress) Administrated(efmAddress) public {
    
  }

  function onApproval() internal;
  function onRejection() internal;

  modifier onlyDuringPollState(PollStates _pollState) {
    require(pollState == _pollState);
    _;
  }

  modifier onlyVotedAdmin() {
    require(hasVoted[msg.sender]);
    _;
  }

  modifier endCommit() {
    _;
    if (numVotes == 3) {
      pollState = PollStates.Reveal;
    }
  }

  modifier tallyVotes(bool voteOption) {
    _;
    
  }

  modifier endReveal() {
    _;
    
    if (numReveals == 3) {
      pollState = PollStates.Concluded;
      
      if (numApprovals >= 2) {
        approvalState = ApprovalStates.Approved;
        onApproval();
      } else {
        approvalState = ApprovalStates.Rejected;
        onRejection();
      }
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

  function vote(bytes32 secretVote) public onlyAdmin onlyDuringPollState(PollStates.Commit) endCommit {
    voteSecrets[msg.sender] = secretVote;
    if (hasVoted[msg.sender] == false) {
      numVotes++;
      hasVoted[msg.sender] = true;
    }
  }

  function reveal(bool voteOption, uint salt) public onlyVotedAdmin onlyDuringPollState(PollStates.Reveal) endReveal {
    require(hasRevealed[msg.sender] == false);
    require(keccak256(abi.encodePacked(voteOption, salt)) == voteSecrets[msg.sender]);
    
    hasRevealed[msg.sender] = true;
    numReveals++;

    if (voteOption) {
      numApprovals++;
    } else {
      numRejections++;
    }
  }
}

contract Campaign is Approvable {

  enum CampaignStates {
    PendingApproval,
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

  CampaignStates public campaignState = CampaignStates.PendingApproval;

  uint public id;
  string public title;
  uint public goal;
  address public manager;
  uint public funds;

  uint public numContributors;
  mapping (address => Contributor) public contributors;
  mapping (address => bool) public hasContributed;

  function onApproval() internal {
    campaignState = CampaignStates.Open;
  }

  function onRejection() internal {
    campaignState = CampaignStates.Unsuccessful;
  }

  modifier onlyDuringCampaignState(CampaignStates _campaignState) {
    require(campaignState == _campaignState);
    _;
  }

  modifier notManager() {
    require(msg.sender != manager);
    _;
  }

  constructor(uint _id, string _title, uint _goal, address _manager, address efmAddress) Approvable(efmAddress) public {
    id = _id;
    title = _title;
    goal = _goal;
    manager = _manager;
  }

  modifier contributionOverflowProtection() {
    require(msg.value > 0);
    require(funds + msg.value > funds);
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

  // Check that campaign has been approved and is open
  function contribute() public payable 
    onlyDuringCampaignState(CampaignStates.Open) 
    notManager 
    newContributor 
    contributionOverflowProtection {
      contributors[msg.sender].contributions[contributors[msg.sender].numContributions] = Contribution(msg.value, now);
      contributors[msg.sender].numContributions++;
      contributors[msg.sender].totalContributed += msg.value;
      funds += msg.value;
  }
  
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