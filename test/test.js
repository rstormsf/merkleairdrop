const { MerkleTree } = require('./merkleTree.js');
const { sha3, bufferToHex } = require('ethereumjs-util');
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
      const leaf = bufferToHex(sha3(elements[0]));
      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verify(proof, root, leaf)).should.equal(true);
    });

    it('should return false for an invalid Merkle proof', async function () {
      const correctElements = ['a', 'b', 'c'];
      const correctMerkleTree = new MerkleTree(correctElements);

      const correctRoot = correctMerkleTree.getHexRoot();

      const correctLeaf = bufferToHex(sha3(correctElements[0]));

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

      const leaf = bufferToHex(sha3(elements[0]));

      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verify(badProof, root, leaf)).should.equal(false);
    });


    it.only('check with addresses and balances', async () => {
      const elements = [
        await encodeParams(accounts[0], '0.1'),
        await encodeParams(accounts[1], '0.2'),
        await encodeParams(accounts[2], '0.3'),
        await encodeParams(accounts[3], '0.1'),
        await encodeParams(accounts[4], '0.2'),
        await encodeParams(accounts[5], '0.3'),
        await encodeParams(accounts[6], '0.1'),
        await encodeParams(accounts[7], '0.2'),
        await encodeParams(accounts[8], '0.3'),
        await encodeParams(accounts[9], '0.1')
      ]
      const merkleTree = new MerkleTree(elements);
      const root = merkleTree.getHexRoot();

      const proof1 = merkleTree.getHexProof(elements[1]);
      const leaf1 = bufferToHex(sha3(elements[1]));

      const proof2 = merkleTree.getHexProof(elements[2]);
      const leaf2 = bufferToHex(sha3(elements[2]));

      const proof3 = merkleTree.getHexProof(elements[3]);
      const leaf3 = bufferToHex(sha3(elements[3]));

      const proofs = proof1.concat(proof2);
      const lengths = [proof1.length, proof2.length];
      const starts = [0, proof1.length];

      let merkleProof = await MerkleProofWrapper.new(root);
      (await merkleProof.verifyProofs([0], [4], proof1, root, [leaf1])).should.equal(true);
      (await merkleProof.verifyProofs(starts, lengths, proofs, root, [leaf1, leaf2])).should.equal(true);

      let proofs_w3 = proof1.concat(proof2).concat(proof3);
      let lengths_w3 = [proof1.length, proof2.length, proof3.length];
      const starts_w3 = [0, proof1.length, proof1.length + proof2.length];

      (await merkleProof.verifyProofs(starts_w3, lengths_w3, proofs_w3, root, [leaf1, leaf2, leaf3])).should.equal(true);

      (await merkleProof.verify(proof2, root, leaf2)).should.equal(true);
      (await merkleProof.verify(proof1, root, leaf1)).should.equal(true);
      await merkleProof.drop(proof1, accounts[1], web3.utils.toWei('0.2'));
      await merkleProof.drop(proof2, accounts[2], web3.utils.toWei('0.3'));



    })

  });
});

async function encodeParams(address, balance) {
  balance = web3.utils.toWei(balance);
  const encodedParams = await web3.eth.abi.encodeParameters(['address', 'uint256'], [address, balance])
  return soliditySha3(encodedParams)
}
