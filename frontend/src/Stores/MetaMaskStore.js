import { computed, flow, observable } from "mobx"
import { getWeb3 } from "../Services/Web3"
import { sleep } from "../utils"
import ERC20 from "./ABI/ERC20"
import Web3 from "web3"

export default class MetaMaskStore {
    static STATE_PENDING = "pending"
    static STATE_LOADED = "loaded"
    static STATE_FAILED = "failed"

    @observable
    state = MetaMaskStore.STATE_PENDING
    @observable
    defaultAccount = null
    @observable
    network = null

    constructor(rootStore) {
        this.rootStore = rootStore
    }

    @computed
    get isLoaded() {
        return this.state == MetaMaskStore.STATE_LOADED
    }

    @computed
    get isFailed() {
        return this.state == MetaMaskStore.STATE_FAILED
    }

    load = flow(function* load() {
        try {
            const { netIdName, defaultAccount, web3Instance } = yield getWeb3()
            this.network = netIdName
            this.web3 = new Web3(web3Instance.currentProvider)
            this.defaultAccount = defaultAccount.toLowerCase()
            this.state = MetaMaskStore.STATE_LOADED
        } catch (e) {
            this.state = MetaMaskStore.STATE_FAILED
        }
    })

    sendTransaction = async transaction => {
        const transactionData = { from: this.defaultAccount, gasPrice: 1000000000 }
        transactionData.gasEstimate = (await transaction.estimateGas(transactionData)) + 200000
        const transactionHash = await new Promise((res, rej) =>
            transaction.send(transactionData, (err, hash) => (err ? rej(err) : res(hash))),
        )

        let blockNumber
        while (true) {
            const res = await new Promise((resolve, reject) => {
                this.web3.eth.getTransactionReceipt(transactionHash, (err, data) => (err ? reject(err) : resolve(data)))
            })
            if (res && res.blockNumber) {
                blockNumber = res.blockNumber
                break
            }
            await sleep(3000)
        }
        while ((await this.web3.eth.getBlockNumber()) < blockNumber + 1) {
            await sleep(3000)
        }
    }

    buildTokenContract(tokenAddress) {
        return new this.web3.eth.Contract(ERC20, tokenAddress)
    }
}
