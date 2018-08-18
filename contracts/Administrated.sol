pragma solidity ^0.4.24;

import "../node_modules/zeppelin-solidity/contracts/access/rbac/RBAC.sol";

contract Administrated is RBAC {
  /**
   * A constant role name for indicating admins.
   */
  string public constant ROLE_ADMIN = "admin";
  uint public numAdmins;

  /**
   * @dev modifier to scope access to admins
   * // reverts
   */
  modifier onlyAdmin()
  {
    checkRole(msg.sender, ROLE_ADMIN);
    _;
  }

  modifier notAdmin()
  {
    require(!hasRole(msg.sender, ROLE_ADMIN));
    _;
  }

  constructor()
    public
  {
    addRole(msg.sender, ROLE_ADMIN);
    numAdmins = 1;
  }

  /**
   * @dev add a role to an account
   * @param _account the account that will have the admin role
   */
  function addAdminRole(address _account)
    public
    onlyAdmin
  {
    addRole(_account, ROLE_ADMIN);
    numAdmins++;
  }

  /**
   * @dev remove a role from an account
   * @param _account the account that will no longer have the admin role
   */
  function removeAdminRole(address _account)
    public
    onlyAdmin
  {
    removeRole(_account, ROLE_ADMIN);
    numAdmins--;
  }

  function isAdmin(address _address) 
    public
    view
    returns(bool)
  {
    return hasRole(_address, ROLE_ADMIN);
  }

}