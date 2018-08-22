##Avoiding Common Attacks

### Withdrawl Pattern / Pull over Push Payments

The *managerWithdraw* and *contributorWithdraw* funnctions in [Campaign](/contracts/Campaign.sol) utilize the Withdrawl Pattern to avoid errors during withdraw and 
protect against *Reentrancy attacks*

#### Prefer *transfer()* over *send()*

The withdrawl functions also user tansfer() instead of send() because it automatically reverts.

### No Reentrancy
To protect against *Race Conditions* introduced by calling untrusted external functions the Withdrawl Functions are protected by the [Reentrancy Guard](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ReentrancyGuard.sol) library from OpenZeppelin.

It is used to protect against Reentrancy attacks initiated by receipients of a transfer calling the withdraw function again from their fallback function.

### Checks-Effects Pattern

All functions that execute transaction or state variable changes adhere to the Checks-Effects Pattern, 

In all these functions as a first step *checks* are performed on arguments and state.

As a second step and only if all the checks pass *effects* to the state variables of the current contract are made.

Furthermore no state changes are ever made after external function calls.

### Access Restriction

All public interface functions are protexted by modifier that restrict access to only accounts that are authorize to make those transactions.

### Safemath (Integer Overflow/Underflow)

All numerical user input is verfied using the OpenZeppelin [Safemath](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol) Library to protect against
integer overflow/unferflow vulnerabilities.

### Don't Assume Contract Created with Zero Balance

Although they are created by the *createCampaign* function in CampaignFactory we do not assume that [Campaign](/contracts/Campaign.sol) Contracts are created with a zero balance and initialize
the funds state variable to the contracts balance rather than zero.

### block.timestamp (30 second rule)

Block miners are able to manipulate block timestamps ~30 seconds. block.timestamp is used in Campaigns to transition Campaign State.
All usage of block.timestamp is able to tolerate a 30 second drift in time in accordance with [Consensys best practices](https://consensys.github.io/smart-contract-best-practices/recommendations/#30-second-rule).