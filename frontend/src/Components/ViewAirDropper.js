import { Message, Button, Icon } from "semantic-ui-react"
import { inject, observer } from "mobx-react"
import React from "react"

@inject(({ rootStore }) => ({
    fetch: rootStore.airDrop.fetch,
    defaultAccount: rootStore.metaMask.defaultAccount,
}))
@observer
export default class ViewAirDropper extends React.Component {
    state = {
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
        this.setState({ isSubmitting: true })
        await this.state.airDropper.drop(this.props.defaultAccount)
        this.setState({ isSubmitting: false })
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <Message icon>
                    <Icon name="circle notched" loading />
                    <Message.Content>
                        <Message.Header>Just one second</Message.Header>
                        We are fetching that content for you.
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
                <Message success header={`You have ${this.state.airDropper.balanceOf(this.props.defaultAccount)} tokens!`} />
                <Button type="button" primary loading={this.state.isSubmitting} onClick={this.onClaim}>
                    Claim
                </Button>
            </div>
        )
    }
}
