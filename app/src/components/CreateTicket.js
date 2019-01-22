import React, { Component } from 'react';
import history from '../history'

// Child Components
import TicketForm from './TicketForm'

class CreateTicket extends Component {

  constructor(args) {
    super(args)
    this.state = {
      loading: true,
      account: '0x0',
      registeredAccounts: []
    }

    this.newTicketValues = {
      description: '',
      assignee: '',
      title: ''
    }

    this.props.contractOperations.getRegisteredAccounts().then(accounts => {
      this.setState({registeredAccounts:accounts, loading: false})
    })

  }

  createTicket(e) {
    if (e) e.preventDefault()
    this.props.contractOperations.createTicket(
      this.newTicketValues.title.value,
      this.newTicketValues.description.value,
      this.newTicketValues.assignee.value,
      this.props.account.address)
      .then(result => {
        history.push('/ticket/' + result)
      })
  }

  handleTitleInput(e) {
    this.newTicketValues.title = e
  }

  handleDescriptionInput(e) {
    this.newTicketValues.description = e
  }

  handleAssigneeInput(e) {
    this.newTicketValues.assignee = e
  }

  render() {
    return (
      this.state.loading
        ? <div>Loading...</div>
        : <TicketForm
          registeredAccounts={this.state.registeredAccounts}
          onSubmit={this.createTicket.bind(this)}
          handleTitleInput={this.handleTitleInput.bind(this)}
          handleDescriptionInput={this.handleDescriptionInput.bind(this)}
          handleAssigneeInput={this.handleAssigneeInput.bind(this)}/>
    )
  }
}

export default CreateTicket;
