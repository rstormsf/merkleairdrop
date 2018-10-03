import { Message, Container, Menu } from "semantic-ui-react"
import { inject, observer } from "mobx-react"
import React, { Component } from "react"
import { HashRouter, Route } from "react-router-dom"
import CreateAirDropper from "./CreateAirDropper"
import ViewAirDropper from "./ViewAirDropper"

@inject(({ rootStore }) => ({
    load: () => rootStore.load(),
    isLoaded: rootStore.isLoaded,
    isMetaMaskFailed: rootStore.metaMask.isFailed,
    network: rootStore.metaMask.network,
    defaultAccount: rootStore.metaMask.defaultAccount,
    createAirDropper: (tokenAddress, data) => rootStore.airDrop.create(tokenAddress, data),
}))
@observer
export default class App extends Component {
    componentDidMount() {
        this.props.load()
    }

    render() {
        if (this.props.isMetaMaskFailed) {
            return (
                <Container>
                    <Message negative header="Oops!" content="MetaMask is locked! Please, unlock it and refresh the page." />
                </Container>
            )
        }

        if (!this.props.isLoaded) {
            return null
        }

        return (
            <HashRouter>
                <div>
                    <Menu fixed="top" inverted>
                        <Container>
                            <Menu.Item header>Merkle AirDrop</Menu.Item>
                            <Menu.Item position="right">
                                Current MetaMask Address: {this.props.defaultAccount}, {this.props.network}
                            </Menu.Item>
                        </Container>
                    </Menu>
                    <Container style={{ marginTop: "4em" }}>
                        <Route exact path="/" component={CreateAirDropper} />
                        <Route path="/:ipfsHash" component={ViewAirDropper} />
                    </Container>
                </div>
            </HashRouter>
        )
    }
}
