import MerkleProofAirdropABI from "./ABI/MerkleProofAirdrop"
import * as IPFS from "../Services/IPFS"
import { flow, observable } from "mobx"
import BN from "bn.js"
import MerkleTree from "../Services/MerkleTree"

const sleep = time => new Promise(res => setTimeout(res, time))

class AirDropper {
    @observable
    availableTokens

    constructor(airDropStore, availableTokens, owner, ipfsHash, ipfsData) {
        this.airDropStore = airDropStore
        this.ipfsHash = ipfsHash
        this.owner = owner
        this.ipfsData = ipfsData
        this.availableTokens = availableTokens
    }

    balanceOf(address) {
        return this.ipfsData[address]
    }

    drop = flow(function* drow(address) {
        const amount = this.balanceOf(address)

        const merkleTree = yield this.airDropStore.buildMerkleTree(this.ipfsData)
        const proof = merkleTree.getHexProof(yield this.airDropStore.encodeParams(address, this.balanceOf(address)))

        yield this.airDropStore.contract.methods.drop(proof, address, amount, this.ipfsHash).send({ from: address, gasPrice: 100000 })

        this.availableTokens = 0
    }).bind(this)
}

export default class AirDropStore {
    @observable
    isLoaded = false

    constructor(rootStore) {
        this.rootStore = rootStore
        this.proxyAddress = process.env.REACT_APP_AIRDROPPER_ADDRESS
    }

    load = flow(function* load() {
        this.contract = new this.metaMask.web3.eth.Contract(MerkleProofAirdropABI, this.proxyAddress)
        this.isLoaded = true
    })

    get metaMask() {
        return this.rootStore.metaMask
    }

    create = flow(function* create(tokenAddress, data) {
        const total = Object.values(data)
            .reduce((acc, cur) => acc.add(new BN(cur)), new BN())
            .toString()

        const ipfsResponse = yield IPFS.upload(JSON.stringify({ ...data, timestamp: Date.now() }))
        const ipfsHash = ipfsResponse[0].hash

        const merkleTree = yield this.buildMerkleTree(data)
        const root = merkleTree.getHexRoot()

        const tmp = yield this.contract.methods
            .createNewAirdrop(root, tokenAddress, total, ipfsHash)
            .send({ from: this.metaMask.defaultAccount, gasPrice: 100000 })

        return ipfsHash
    })

    fetch = async ipfsHash => {
        const hash = this.metaMask.web3.utils.sha3(this.metaMask.web3.utils.toHex(ipfsHash))
        const airdropper = await this.contract.methods.airdrops(hash).call()
        if (airdropper.tokenAddress == "0x0000000000000000000000000000000000000000") {
            return null
        }

        const data = await IPFS.cat(ipfsHash)
        const parsedData = JSON.parse(data)
        delete parsedData["timestamp"]

        const droppedEventsForDefaultAccount = await this.contract.getPastEvents("Drop", {
            filter: { rec: this.metaMask.defaultAccount },
            fromBlock: "0",
            toBlock: "latest",
        })
        const eventsForThisIpfs = droppedEventsForDefaultAccount.filter(e => e.returnValues.ipfs == ipfsHash)

        const availableTokens = eventsForThisIpfs.length > 0 ? 0 : parsedData[this.metaMask.defaultAccount]

        return new AirDropper(this, availableTokens, airdropper.owner.toLowerCase(), ipfsHash, parsedData)
    }

    async encodeParams(address, balance) {
        const encodedParams = await this.metaMask.web3.eth.abi.encodeParameters(["address", "uint256"], [address, balance])
        return this.metaMask.web3.utils.soliditySha3(encodedParams)
    }

    async buildMerkleTree(data) {
        const hashesForMerkleTree = await Promise.all(
            Object.keys(data).map(tokenAddress => this.encodeParams(tokenAddress, data[tokenAddress])),
        )

        return new MerkleTree(hashesForMerkleTree)
    }
}
