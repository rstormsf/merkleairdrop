import { computed } from "mobx"
import MetaMaskStore from "./MetaMaskStore"
import AirDropStore from "./AirDropStore"

export default class RootStore {
    constructor() {
        this.metaMask = new MetaMaskStore(this)
        this.airDrop = new AirDropStore(this)
    }

    load = async () => {
        await this.metaMask.load()
        await this.airDrop.load()
    }

    @computed
    get isLoaded() {
        return this.metaMask.isLoaded && this.airDrop.isLoaded
    }
}
