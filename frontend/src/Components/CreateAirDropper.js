import { Message, Icon, Button, Header, Form } from "semantic-ui-react"
import { inject, observer } from "mobx-react"
import React from "react"

@inject(({ rootStore }) => ({
    form: rootStore.ui.createAirDropperForm,
}))
@observer
export default class CreateAirDropper extends React.Component {
    setTokenAddress = (_, { value }) => this.props.form.setTokenAddress(value)

    setRawData = (_, { value }) => this.props.form.setRawData(value)

    setTokenDecimals = (_, { value }) => this.props.form.setTokenDecimals(value)

    create = async () => {
        const ipfsHash = await this.props.form.create()
        if (ipfsHash) {
            this.props.history.push(`/${ipfsHash}`)
        }
    }

    render() {
        return (
            <div>
                <Header as="h1">Merkle AirDropper</Header>
                <Form onSubmit={this.props.form.onSubmit}>
                    <Form.Group>
                        <Form.Input
                            width={15}
                            label="Token Address"
                            name="tokenAddress"
                            onChange={this.setTokenAddress}
                            value={this.props.form.tokenAddress}
                        />
                        <Form.Input
                            width={1}
                            label="Decimals"
                            readOnly
                            name="tokenDecimals"
                            onChange={this.setTokenDecimals}
                            value={this.props.form.tokenDecimals}
                        />
                    </Form.Group>
                    <Form.TextArea label="Data" name="data" onChange={this.setRawData} value={this.props.form.rawData} />
                    <p>
                        <a target="_blank" href="https://ipfs.io/ipfs/QmY2u8UuNJJFuBNd2WD1edbvWU1okR5ZvbV1tJUhxa3BsJ">
                            View example
                        </a>
                    </p>
                    {(!this.props.form.tokenAddress || !this.props.form.rawData) && <Message info content="Please, fill out all fields." />}
                    {this.props.form.isValidating && (
                        <Message icon>
                            <Icon name="circle notched" loading />
                            <Message.Content>
                                <Message.Header>Just one second</Message.Header>
                                We are validating your data
                            </Message.Content>
                        </Message>
                    )}
                    {this.props.form.errors.length > 0 && <Message negative header="Error" list={this.props.form.errors} />}
                    {(this.props.form.canBeApproved || this.props.form.isApproving) && (
                        <React.Fragment>
                            {this.props.form.errors.length == 0 &&
                                this.props.form.canBeApproved && (
                                    <Message positive header="Ok" content="Now you should allow mutlisender to spend tokens." />
                                )}
                            <Button loading={this.props.form.isApproving} primary type="button" onClick={this.props.form.approve}>
                                Allow
                            </Button>
                        </React.Fragment>
                    )}
                    {(this.props.form.isApproved || this.props.form.isCreating) && (
                        <React.Fragment>
                            {this.props.form.errors.length == 0 &&
                                this.props.form.isApproved && <Message positive header="Nice" content="Now you can create air dropper." />}
                            <Button loading={this.props.form.isCreating} primary type="button" onClick={this.create}>
                                Create
                            </Button>
                        </React.Fragment>
                    )}
                </Form>
            </div>
        )
    }
}
