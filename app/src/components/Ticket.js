import React, { Component } from 'react';
import { Button, ButtonToolbar, DropdownButton, MenuItem, Panel } from "react-bootstrap";

class Ticket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: {},
      ticketId: this.props.match.params.number,
      ticket: {},
      loading: true
    };

    this.setTicket = this.setTicket.bind(this)
    this.handleWipClick = this.handleWipClick.bind(this)
    this.handleDoneClick = this.handleDoneClick.bind(this)
    this.handleCloseClick = this.handleCloseClick.bind(this)

    this.props.contractOperations.readAccount(account => {
      this.setState({ account: account })
      this.setTicket()
    })
  }

  async setTicket() {
    this.props.contractOperations.getTicketInfo(this.state.ticketId).then(ticket => {
      this.setState({ticket: ticket, loading: false})
    })
  }

  handleWipClick() {
    this.props.contractOperations.setTicketStatusInProgress(this.state.ticketId, this.state.account.address).then(this.setTicket)
  }

  handleDoneClick() {
    this.props.contractOperations.setTicketStatusDone(this.state.ticketId, this.state.account.address).then(this.setTicket)
  }

  handleCloseClick() {
    this.props.contractOperations.setTicketStatusClose(this.state.ticketId, this.state.account.address).then(this.setTicket)
  }

  render() {
    return (
      <div className="Ticket">
        { this.state.loading ?
          <div>Loading...</div>
        :
          <Panel>
            <Panel.Heading>
              {
              this.state.ticket.statusEnum.toNumber() === 0
              ? <ButtonToolbar>
                  <Button onClick={this.handleWipClick}>Start work</Button>
                  <Button onClick={this.handleDoneClick}>Done</Button>
                  <Button onClick={this.handleCloseClick}>Close</Button>
                </ButtonToolbar>
              : this.state.ticket.statusEnum.toNumber() === 1
              ? <ButtonToolbar>
                  <Button onClick={this.handleDoneClick}>Done</Button>
                  <Button onClick={this.handleCloseClick}>Close</Button>
                </ButtonToolbar>
              : this.state.ticket.statusEnum.toNumber() === 2
              ? <ButtonToolbar>
                  <Button onClick={this.handleCloseClick}>Close</Button>
                </ButtonToolbar>
              : null
              }
            </Panel.Heading>
            <Panel.Body>
              <div className='text-left'>
                <h1><b>{this.state.ticket.title}</b> <small>({this.state.ticket.statusText})</small></h1>
                <h3>Assignee:</h3>
                <p>{this.state.ticket.assignee}</p>
                <h3>Details</h3>
                <p className='ticket-description'>{this.state.ticket.description}</p>
              </div>
            </Panel.Body>
          </Panel>
        }
      </div>
    );
  }
}

export default Ticket;
