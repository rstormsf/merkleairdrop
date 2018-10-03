import { reaction, autorun, observable, action, computed, flow } from "mobx"
import BN from "bn.js"

export default class CreateAirDropperForm {
    static STATE_NEW = "new"
    static STATE_VALID = "valid"
    static STATE_INVALID = "invalid"
    static STATE_APPROVING = "approving"
    static STATE_APPROVED = "approved"
    static STATE_CREATING = "creating"
    static STATE_CREATED = "created"

    @observable
    tokenAddress = ""
    @observable
    rawData = ""
    @observable
    state = "new"
    @observable
    errors = []

    constructor(rootStore) {
        this.rootStore = rootStore
        // autorun(() => this.validate())
        reaction(() => this.tokenAddress, () => this.validate())
        reaction(() => this.rawData, () => this.validate())
    }

    @action.bound
    setTokenAddress(tokenAddress) {
        this.tokenAddress = tokenAddress
    }

    @action.bound
    setRawData(rawData) {
        this.rawData = rawData
    }

    @computed
    get parsedData() {
        if (!this.rawData) {
            return null
        }

        try {
            return JSON.parse(this.rawData)
        } catch (e) {}

        // not json, trying CSV

        try {
            return this.rawData.split("\n").reduce((acc, line) => {
                const tokens = line.replace(/ /g, ",").split(",")
                if (tokens.length != 2) {
                    throw new Error("Invalid format")
                }

                const [address, value] = tokens
                if (!address || !value) {
                    throw new Error("Invalid format")
                }

                acc[address] = value

                return acc
            }, {})
        } catch (e) {}

        // unknown format, possibly invalid

        return null
    }

    @computed
    get total() {
        if (!this.parsedData) {
            return null
        }

        return Object.values(this.parsedData)
            .reduce((acc, cur) => acc.add(new BN(cur)), new BN())
            .toString()
    }

    @computed
    get isFilled() {
        return this.tokenAddress && this.parsedData
    }

    @computed
    get isNew() {
        return this.state == CreateAirDropperForm.STATE_NEW
    }

    @computed
    get isValid() {
        return this.state == CreateAirDropperForm.STATE_VALID
    }

    @computed
    get canBeApproved() {
        return this.isFilled && this.isValid
    }

    @computed
    get isApproving() {
        return this.state == CreateAirDropperForm.STATE_APPROVING
    }

    @computed
    get isApproved() {
        return this.state == CreateAirDropperForm.STATE_APPROVED
    }

    @computed
    get isCreating() {
        return this.state == CreateAirDropperForm.STATE_CREATING
    }

    validate = flow(function* validate() {
        this.state = CreateAirDropperForm.STATE_NEW
        this.errors = []

        if (!this.rootStore.metaMask.web3.utils.isAddress(this.tokenAddress)) {
            this.errors.push("Please, provide correct token address.")
        }

        if (this.rawData && !this.parsedData) {
            this.errors.push("Data format is invalid.")
        }

        if (this.parsedData) {
            if (this.parsedData === null || typeof this.parsedData !== "object") {
                this.errors.push("Data format is invalid.")
            } else if (!Object.keys(this.parsedData).every(this.rootStore.metaMask.web3.utils.isAddress)) {
                this.errors.push("Some addresses in the data object are invalid. Please, check your data.")
            } else if (!Object.values(this.parsedData).every(value => value > 0)) {
                this.errors.push("All values in the data object must be > 0. Please, check your data.")
            }
        }

        this.state = this.errors.length > 0 ? CreateAirDropperForm.STATE_INVALID : CreateAirDropperForm.STATE_VALID
    })

    approve = flow(function* approve() {
        this.errors = []
        this.state = CreateAirDropperForm.STATE_APPROVING
        const token = this.rootStore.metaMask.buildTokenContract(this.tokenAddress)
        try {
            const allowed = yield token.methods
                .approve(this.rootStore.airDrop.proxyAddress, this.total)
                .send({ from: this.rootStore.metaMask.defaultAccount, gasPrice: 100000 })
            this.state = CreateAirDropperForm.STATE_APPROVED
        } catch (e) {
            this.state = CreateAirDropperForm.STATE_VALID
            this.errors.push("Something went wrong while approving. Please, check your data and try again.")
            console.error(e)
        }
    }).bind(this)

    create = flow(function* create() {
        this.errors = []
        this.state = CreateAirDropperForm.STATE_CREATING
        try {
            const ipfsHash = yield this.rootStore.airDrop.create(this.tokenAddress, this.parsedData)
            this.state = CreateAirDropperForm.STATE_CREATED

            return ipfsHash
        } catch (e) {
            this.state = CreateAirDropperForm.STATE_VALID
            this.errors.push("Something went wrong while creating air dropper. Please, check your data and try again.")
            console.error(e)
        }
    }).bind(this)
}
