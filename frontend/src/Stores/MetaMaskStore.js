import { flow, observable } from "mobx"
import { getWeb3 } from "../Services/Web3"
import Web3 from "web3"

export default class MetaMaskStore {
    @observable
    isLoaded = false
    @observable
    defaultAccount = null
    @observable
    network = null

    constructor(rootStore) {
        this.rootStore = rootStore
    }

    load = flow(function* load() {
        const { netIdName, defaultAccount, web3Instance } = yield getWeb3()
        this.network = netIdName
        this.web3 = new Web3(web3Instance.currentProvider)
        this.defaultAccount = defaultAccount.toLowerCase()
        this.isLoaded = true
    })
}
