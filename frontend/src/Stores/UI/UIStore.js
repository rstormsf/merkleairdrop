import CreateAirDropperForm from "./CreateAirDropperForm"

export default class UIStore {
    constructor(rootStore) {
        this.rootStore = rootStore
        this.createAirDropperForm = new CreateAirDropperForm(rootStore)
    }
}
