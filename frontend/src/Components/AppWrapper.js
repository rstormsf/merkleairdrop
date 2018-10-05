import React from "react"
import { Provider } from "mobx-react"
import RootStore from "../Stores/RootStore"
import App from "./App"

export default class AppWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.rootStore = new RootStore()
    }

    render() {
        return (
            <Provider rootStore={this.rootStore}>
                <App />
            </Provider>
        )
    }
}
