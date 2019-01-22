import React, { Component } from 'react'

class Tickets extends Component {
  
  constructor(args) {
    super(args)
    this.state = {
      account: {},
      loading: true,
      assignedTickets: []
    }

    this.loadAssignedTicketsInfo = this.loadAssignedTicketsInfo.bind(this)

    this.props.contractOperations.readAccount(account => {
      this.setState({ account: account })
      this.loadAssignedTicketsInfo()
    })
  }

  loadAssignedTicketsInfo() {
    if (!this.state.account.address) {
      return
    }
    this.props.contractOperations.getAssignedTickets(this.state.account.address).then(tickets => {
      this.setState({assignedTickets: tickets, loading: false})
    })
  }

  render() {
    return (
      <div className='row text-left'>
        <h1 className='col-xs-12'>My tickets</h1>
        {
          this.state.account.accountRegistered
          ? this.state.loading
            ? <div className='col-xs-12'>Loading...</div>
            : this.state.assignedTickets.map(ticket =>
                <div className='col-xs-12'>
                  <h3><a href={'/ticket/' + ticket.id}>{ticket.title}</a> ({ticket.statusText})</h3>
                  <p className='ticket-description'>{ticket.description}</p>
                </div>
              )
          : <div className='col-xs-12'>Please register</div>          
        }
      </div>
    )
  }
}

export default Tickets
