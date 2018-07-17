pragma solidity ^0.4.24;

// import "./EthFundMe.sol";

// contract Approvable {
//   uint votesFor;		    /// tally of votes supporting proposal
//   uint votesAgainst;      /// tally of votes countering proposal
//   mapping(address => bool) didCommit;  /// indicates whether an address committed a vote for this poll
//   mapping(address => bool) didReveal;   /// indicates whether an address revealed a vote for this poll

//   uint public numVotes;
//   mapping(address => uint) public votes;

//   function vote(uint secretVote) public {
//     // require(EthFundMe.isAdmin(msg.sender));

//     votes[msg.sender] = secretVote;
//     numVotes++;
//   }

//   function getNumVotes() public view returns (uint) {
//     return numVotes;
//   }

// }