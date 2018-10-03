import { Header, Message, Button, Icon } from "semantic-ui-react"
import { inject, observer } from "mobx-react"
import React from "react"

@inject(({ rootStore }) => ({
    fetch: rootStore.airDrop.fetch,
    defaultAccount: rootStore.metaMask.defaultAccount,
}))
@observer
export default class ViewAirDropper extends React.Component {
    state = {
        error: false,
        airDropper: null,
        isLoaded: false,
        isSubmitting: false,
    }

    async componentDidMount() {
        this.setState({
            airDropper: await this.props.fetch(this.props.match.params.ipfsHash),
            isLoaded: true,
        })
    }

    onClaim = async () => {
        this.setState({ error: false, isSubmitting: true })
        try {
            await this.state.airDropper.drop(this.props.defaultAccount)
        } catch (e) {
            this.setState({ error: true })
        }
        this.setState({ isSubmitting: false })
    }

    get isOwned() {
        return this.state.airDropper.owner == this.props.defaultAccount
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <Message icon>
                    <Icon name="circle notched" loading />
                    <Message.Content>
                        <Message.Header>Just one second</Message.Header>
                        Loading...
                    </Message.Content>
                </Message>
            )
        }

        if (!this.state.airDropper) {
            return (
                <Message negative>
                    <Message.Content>
                        <Message.Header>Not Found!</Message.Header>
                    </Message.Content>
                </Message>
            )
        }

        return (
            <div>
                {this.state.error && <Message negative header="Something went wrong, please, try again." />}
                {this.isOwned && (
                    <React.Fragment>
                        <Header as="h2">You are the owner of this air drop.</Header>
                        <strong>Share this link:</strong> <a href={window.location.href}>{window.location.href}</a>
                    </React.Fragment>
                )}
                {this.state.airDropper.availableTokens > 0 ? (
                    <React.Fragment>
                        <Message success header={`You have ${this.state.airDropper.balanceOf(this.props.defaultAccount)} tokens!`} />
                        <Button type="button" primary loading={this.state.isSubmitting} onClick={this.onClaim}>
                            Claim
                        </Button>
                    </React.Fragment>
                ) : (
                    <Message warning header="There are no tokens for you :(" />
                )}
            </div>
        )
    }
}
