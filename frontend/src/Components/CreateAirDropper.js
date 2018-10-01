import { Button, Header, Form } from "semantic-ui-react"
import { inject, observer } from "mobx-react"
import React from "react"

@inject(({ rootStore }) => ({
    createAirDropper: (tokenAddress, data) => rootStore.airDrop.create(tokenAddress, data),
}))
@observer
export default class CreateAirDropper extends React.Component {
    state = {
        tokenAddress: "",
        data: "",
        isSubmitting: false,
    }

    handleChange = (_, { name, value }) => {
        this.setState({ [name]: value })
    }

    onSubmit = async () => {
        let parsedData

        try {
            parsedData = this.parseData(this.state.data)
        } catch (e) {
            alert("Data format is wrong!")
            return
        }

        this.setState({ isSubmitting: true })
        const ipfsHash = await this.props.createAirDropper(this.state.tokenAddress, parsedData)
        this.setState({ isSubmitting: false })
        this.props.history.push(`/${ipfsHash}`)
    }

    parseData = data => {
        try {
            return JSON.parse(data)
        } catch (e) {}

        // not json, trying CSV

        return data.split("\n").reduce((acc, line) => {
            line = line.replace(/ /g, ",") // if data format is like smartz.io
            const [address, value] = line.split(",")

            acc[address] = value

            return acc
        }, {})
    }

    render() {
        return (
            <div>
                <Header as="h1">Create Merkle AirDropper</Header>
                <Form onSubmit={this.onSubmit}>
                    <Form.Input label="Token Address" name="tokenAddress" onChange={this.handleChange} value={this.state.tokenAddress} />
                    <Form.TextArea label="Data" name="data" onChange={this.handleChange} value={this.state.data} />
                    <p>
                        <a target="_blank" href="https://ipfs.io/ipfs/QmY2u8UuNJJFuBNd2WD1edbvWU1okR5ZvbV1tJUhxa3BsJ">
                            View example
                        </a>
                    </p>
                    <Button loading={this.state.isSubmitting} primary type="submit">
                        Create
                    </Button>
                </Form>
            </div>
        )
    }
}
