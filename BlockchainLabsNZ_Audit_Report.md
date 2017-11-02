# Leverj Audit Report

## Preamble
This audit report was undertaken by BlockchainLabs.nz for the purpose of providing feedback to Leverj. It has subsequently been shared publicly without any express or implied warranty.

Solidity contracts were sourced from the public Github repo [leverj/token-contracts](https://github.com/leverj/token-contracts) prior to commit [667f838a86cb8df57de217f3ed5fbd9bbf0a2d4e](https://github.com/leverj/token-contracts/tree/667f838a86cb8df57de217f3ed5fbd9bbf0a2d4e) - we would encourage all community members and token holders to make their own assessment of the contracts.

## Scope
All Solidity code contained in [/contracts](https://github.com/leverj/token-contracts/tree/667f838a86cb8df57de217f3ed5fbd9bbf0a2d4e) was considered in scope along with the tests contained in [/test](https://github.com/leverj/token-sale/tree/master/test) as a basis for static and dynamic analysis.

## Focus Areas
The audit report is focused on the following key areas - though this is not an exhaustive list.
### Correctness
- No correctness defects uncovered during static analysis?
- No implemented contract violations uncovered during execution?
- No other generic incorrect behaviour detected during execution?
- Adherence to adopted standards such as ERC20?
### Testability
- Test coverage across all functions and events?
- Test cases for both expected behaviour and failure modes?
- Settings for easy testing of a range of parameters?
- No reliance on nested callback functions or console logs?
- Avoidance of test scenarios calling other test scenarios?
### Security
- No presence of known security weaknesses?
- No funds at risk of malicious attempts to withdraw/transfer?
- No funds at risk of control fraud?
- Prevention of Integer Overflow or Underflow?
### Best Practice
- Explicit labeling for the visibility of functions and state variables?
- Proper management of gas limits and nested execution?
- Latest version of the Solidity compiler?

## Classification
### Defect Severity
- Minor - A defect that does not have a material impact on the contract execution and is likely to be subjective.
- Moderate - A defect that could impact the desired outcome of the contract execution in a specific scenario.
- Major - A defect that impacts the desired outcome of the contract execution or introduces a weakness that may be exploited.
- Critical - A defect that presents a significant security vulnerability or failure of the contract across a range of scenarios.

## Findings
### Minor
- **Add a fallback function for non tech investors** -  Consider adding a fallback function so just sending eth to the contract would be enough to purchase tokens ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/7)
  - [ ] Fixed
- **Measure time milestones with timestamps, not block height** -  The sale has 3 milestones `freezeBlock`, `startBlock`, and `endBlock`. ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/6)
  - [ ] Fixed
- **Use the same version of Solidity for each contract** - Both versions `^0.4.11`, and `^0.4.8` are used in the contracts ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/5)
  - [ ] Fixed
- **Consistent formatting** -  Minor formatting inconsistencies to be fixed on [#L13](https://github.com/leverj/token-contracts/blob/master/contracts/Sale.sol#L13]), [#L79](https://github.com/leverj/token-contracts/blob/master/contracts/Sale.sol#L79) ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/3)
  - [ ] Fixed
- **Declare variable with memory as the data location** - This line makes the compiler give out a warning, changing it to ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/2)
  - [ ] Fixed
- **Imported file is not in the repo and the declaration is never used** -  See line [#136](https://github.com/ElKornacio/contracts-early/blob/master/contracts/LATokenMinter.sol#L136]) ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/1)
  - [ ] Fixed

### Moderate
- **SafeMath should be used for all mathematical operations** - Is imported, but it is not used: - [`Sale.sol` #L76](https://github.com/leverj/token-contracts/blob/master/contracts/Sale.sol#L76) ... [View on GitHub](https://github.com/BlockchainLabsNZ/leverj-contracts/issues/4)
  - [ ] Fixed

### Major
- None found
### Critical
- None found

We have reviewed this document to ensure that there are no ommisions and that the developers' comments are a fair summary of each function.

## Conclusion
Overall we have been satisfied with the resulting contracts following the audit feedback period. We took part in carefully reviewing all source code provided to fully satisfy test coverage in all areas.

The developers have followed common best practices and demonstrated an awareness for compiling contracts in a modular format to avoid confusion and improve transparency.
