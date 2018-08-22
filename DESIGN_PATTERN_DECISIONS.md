## Design Patterns

### Factory Pattern

[Campaign](/contracts/Campaign.sol) contracts are created and deployed by [CampaignFactory](/contracts/CampaignFactory.sol) via the Contract Factory Design Pattern.

The [CampaignFactory](/contracts/CampaignFactory.sol) Contract is also used to store Campaign Contract Addresses so that they can be retrieved whenever necessary.

The Facotry Pattern was chosed to create Campaign contracts because a Campaign very well modelled as a smart contract. Each Campaign can be easily created, managed and ended as it's own smart contract. 

In order to allow users to create and deploy Campaign Contracts the Factory Design Pattern is a great choice.

## Circuit Breaker / Emergency Stop / Failsafe Mode

The [EmergencyStoppable](#emergencystoppable) Contract implements the circuit braker pattern and allows authorized users to stop the [CampaignFactory](/contracts/CampaignFactory.sol) 
and [Campaign](/contracts/Campaign.sol) Contracts in case of emergency.

These contracts then enter *stopped* failsafe mode that augments their behaviour.

EmergencyStoppable also provides modifiers that child contracts can use to restrict access to interface functions depeneding on the stopped state of the Contract.

It was important to use a failsafe/circuit breaker pattern on Campaign Contracts that hold funds to give admins the ability to step in and allow contributors to recover their funds if anything went wrong with the Contract.

### Checks-Effects Pattern

All functions that execute transaction or state variable changes adhere to the Checks-Effects Pattern, 

In all these functions as a first step *checks* are performed on arguments and state.

As a second step and only if all the checks pass *effects* to the state variables of the current contract are made.

Furthermore no state changes are ever made after external function calls.

The Checks Effects Pattern is a basic one and a good habit to get into when developing Smart Contracts and protects against coding errors and race condition associated with the early modification of state variables.

### State Machine / Lifecycle Pattern
Both [Approvable](/contracts/Approvable.sol) and [Campaign](/contracts/Campaign.sol) maintain states in whicht the contracts behave differently depending on what state they are in.

Function modifiers are used to ensure the correct state before function execution and restrict functions accessibility based on state.

I used the state machine pattern because both Campaigns behave differently depending on many factors, Whether they have been approved/rejected, are the past their end date? did they meet their funding goals?

The State Machine pattern allowed me to easily manage the state and thus the behaviour of the contract.

 Transitioning between states using modifiers in front of functions that need to know the state easily ensures the correct behaviour.

 The state is also very useful in the UI to let users know what state the Campaign is in.

 ### Commit/Reveal Voting Pattern
[Approvable](/contracts/Approvable.sol) utilizes the commit/reveal voting pattern in which votes are placed as *keccak256* encrypted vote secrets that obscure them during the *Commit Phase*.

Later, in the *Reveal Phase* vote secrets are verified with the vote option and salt used in the encryption, reveal and counted.

The Commit Reveal voting pattern is used becauase it allows the safe commiting of votes without revealing what they are until the reveal phase so they dont influence the voting process.

### Differentiating Function and Event Names

All Events are named with the 'Log' Prefix that differentiates them from functions.