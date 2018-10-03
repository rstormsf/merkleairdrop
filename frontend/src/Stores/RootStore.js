import { computed } from "mobx"
import MetaMaskStore from "./MetaMaskStore"
import AirDropStore from "./AirDropStore"
import UiStore from "./UI/UIStore"

export default class RootStore {
    constructor() {
        this.metaMask = new MetaMaskStore(this)
        this.airDrop = new AirDropStore(this)
        this.ui = new UiStore(this)
    }

    load = async () => {
        await this.metaMask.load()
        if (this.metaMask.isLoaded) {
            await this.airDrop.load()
        }
    }

    @computed
    get isLoaded() {
        return this.metaMask.isLoaded && this.airDrop.isLoaded
    }
}
