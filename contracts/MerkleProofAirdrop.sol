pragma solidity ^0.4.24;


import "./MerkleProof.sol";
/**
 * @title MerkleProof
 * @dev Merkle proof verification based on
 * https://github.com/ameensol/merkle-tree-solidity/blob/master/src/MerkleProof.sol
 */
contract MerkleProofAirdrop {
  bytes32 root;
  uint public total;
  mapping(address => bool) public claimed;
  event Drop(address rec, uint amount);

  constructor(bytes32 _root) {
    root = _root;
  }


  function drop(bytes32[] proof, address _receipent, uint256 _amount) public {
    bytes32 leaf = keccak256(keccak256(abi.encode(_receipent, _amount)));
    require(!claimed[_receipent]);
    require(verify(proof, root, leaf));
    // transfer tokens
    emit Drop(_receipent, _amount);
  }

  function verify(
    bytes32[] proof,
    bytes32 root,
    bytes32 leaf
  )
    public
    pure
    returns (bool)
  {
    return MerkleProof.verify(proof, root, leaf);
  }
}
