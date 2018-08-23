// Contract Development 1
// DONE: Timing campaigns
// DONE: Ending Campaign and Payouts
// DONE: Manager can cancel Campaign before approved
// DONE: Rewrite state transition according to solidy state machine pattern

// Contract Developement 2
// DONE: Implement Circuit Breaker Pattern!
// DONE: Use a Library
// DONE: -- Change tests to use new admin style (they must add admins)
// DONE: -- setup script must add admins
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
// DONE: Use OpenZeppelin Safemath - Use OpenZeppelin from EthPm
// DONE: Approvable in its own file?
// DONE: Put all setup scripts into one, make more campaigns and time travel so that ~half are complete
// DONE: Have setup script leave from campaigns in reveal stage.
// DONE: Put 'Log' on Event Names
// DONE: Add a License
// DONE: Try again to use increase time from node_mudles in setup script. Try with inport!
// TASK: Better image library

// TESTS:
// DONE: Make sure tests work on -b 3
// DONE: use increaseTime from openzeppelin! Test
// DONE: Put All Transactions into their own it statement
// DONE: Comment Tests
// DONE: Homogenize import statements
// DONE: Number in test name
// DONE: Reenable solidity test
// DONE: Rename VoteSecret/Option to Approve Reject for clarity
// DONE: Check events in tests too
// TASK: Listen for all events in Tests
// DONE: Test changing admin priviledges during stopped CampaignFactory Contract
// DONE: Test Cant grant an admin admin role again and cant revoke admin role from non admin

// DOCUMENTATION
// DONE: Review Security Best Practices - writeup
// DONE: Review Design Patterns - writeup
// DONE: Make a Libraries used section.
// DONE: Project Structure Section where you say where everything is

// UI
// DONE: Fix Contribute
// DONE: Set up React Project and React Crash Course
// DONE: Frontend
// DONE: Listening for Events
// -- TASK: UI for stopping CampaignFactory
// -- DONE: UI for adding admins
// DONE: Progress Calculator, use funds when active, use totalRaised when Successful/Unsuccessful
// DONE: Fix Withdrawn in ui, show when active
// DONE: Rename getTotalContributed to getTotalRaisedFunds
// DONE: Don't show goalProgress on Pending Campaign
// TASK: Mobile View Support.
// DONE: Remove Logging
// TASK: Put Background color on Jumbo
// TASK: Add a Footer

// Submitable
// TASK: Fix all line ending to LF
// DONE: Packaging and Other Documentation
// TASK: Make sure it works on Ubuntu
// DONE: Review Grading Rubric
// TASK: Release on testnet
