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


  function drop(bytes32[] proof, address _recipient, uint256 _amount) public {
    bytes32 leaf = keccak256(keccak256(abi.encode(_recipient, _amount)));
    // require(!claimed[_recipient]);
    require(verify(proof, root, leaf));
    claimed[_recipient] = true;
    // transfer tokens
    emit Drop(_recipient, _amount);
  }

  function dropAll(
    bytes32[] _merkleProofs,
    uint256[] _indexesProofs,
    address[] _receipent,
    uint256[] _amount
  ) public {

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

  function verifyProofs(
    uint[] start,
    uint[] length,
    bytes32[] proofs,
    bytes32 root,
    bytes32[] leafs
  )
    public
    pure
    returns (bool)
  {
    uint previous = 0;
    // [0], [4], [....], root, [leaf1]
    // [0,4], [4,4], [.... ....], root, [leaf1, leaf2]
    for(uint256 i = 0; i < leafs.length; i++) {
      bytes32 computedHash = leafs[i];
      if(i != 0) {
        previous += length[i];
      }
      for (uint256 j = start[i]; j < previous + length[i]; j++) {
        bytes32 proofElement = proofs[j];

        if (computedHash < proofElement) {
          computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
        } else {
          computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
        }
      }
      require(computedHash == root, "not match");
    }
    return true;
  }

}
