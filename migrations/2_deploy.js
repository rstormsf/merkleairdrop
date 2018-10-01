var MerkleProofAirdrop = artifacts.require("./MerkleProofAirdrop.sol");
const fs = require('fs');
const path = require('path')

module.exports = async function(deployer, network) {
    const deployContracts = process.env.DEPLOY_MIGRATIONS;
    if (deployContracts) {
        await deployer.deploy(MerkleProofAirdrop)
        const airdropper = await MerkleProofAirdrop.deployed();
        console.log('Merkle Airdropper address: ', airdropper.address);
        fs.writeFileSync(path.join(__dirname, '../frontend/.env'), `REACT_APP_AIRDROPPER_ADDRESS=${airdropper.address}\n`);
    }
};
