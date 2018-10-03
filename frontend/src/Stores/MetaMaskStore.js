import { computed, flow, observable } from "mobx"
import { getWeb3 } from "../Services/Web3"
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

    buildTokenContract(tokenAddress) {
        return new this.web3.eth.Contract(ERC20, tokenAddress)
    }
}
