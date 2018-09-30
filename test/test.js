const { MerkleTree } = require('./merkleTree.js');
const {soliditySha3} = web3.utils;
const MerkleProofWrapper = artifacts.require('MerkleProofAirdrop');

require('chai')
  .should();

contract('MerkleProof', function (accounts) {

  describe('verify', function () {
    it('should return true for a valid Merkle proof', async function () {
      const elements = ['a', 'b', 'c', 'd'];
      const merkleTree = new MerkleTree(elements);
      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);

      const leaf = soliditySha3(elements[0]);

      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verify(proof, root, leaf)).should.equal(true);
    });

    it('should return false for an invalid Merkle proof', async function () {
      const correctElements = ['a', 'b', 'c'];
      const correctMerkleTree = new MerkleTree(correctElements);

      const correctRoot = correctMerkleTree.getHexRoot();

      const correctLeaf = soliditySha3(correctElements[0]);

      const badElements = ['d', 'e', 'f'];
      const badMerkleTree = new MerkleTree(badElements);

      const badProof = badMerkleTree.getHexProof(badElements[0]);
      let merkleProof = await MerkleProofWrapper.new(correctRoot);
      (await merkleProof.verify(badProof, correctRoot, correctLeaf)).should.equal(false);
    });

    it('should return false for a Merkle proof of invalid length', async function () {
      const elements = ['a', 'b', 'c'];
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);
      const badProof = proof.slice(0, proof.length - 5);

      const leaf = soliditySha3(elements[0]);
      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verify(badProof, root, leaf)).should.equal(false);
    });

    it.only('check with addresses and balances', async () => {
      const address = accounts[0];
      const balance = web3.utils.toWei('0.1');
      const encodedParams = web3.eth.abi.encodeParameters(['address', 'uint256'], [address, balance])
      const hash = soliditySha3(encodedParams)
      const elements = [hash];
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);

      const leaf = soliditySha3(elements[0]);
      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verify(proof, root, leaf)).should.equal(true);

      const leafS = await merkleProof.drop(proof, address, balance);
      // console.log(leafS, leaf);
    })

  });
});
