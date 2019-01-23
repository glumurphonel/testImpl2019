import React, { Component } from 'react';
import './App.css';
// Child Components
import Header from './components/Header'
import Footer from './components/Footer'
import Tickets from './components/Tickets'
import Ticket from './components/Ticket'
import CreateTicket from './components/CreateTicket'

import ContractOperations from './ContractOperations'
import { Switch, Route } from 'react-router-dom'

class App extends Component {

  constructor(args) {
    super(args)
    this.state = {
      loading: true,
      account: {}
    }

    this.registerAccount = this.registerAccount.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.contractOperations = new ContractOperations(window.web3);
    this.contractOperations.readAccount(account => {
      this.setState({ account: account })
    })

    this.contractOperations.ticketContract.deployed().then((instance) => {
      instance.allEvents(function(error, log){
      if (!error)
        console.log(log)
      })
      this.contractOperations.web3.currentProvider.publicConfigStore.on('update', (data)=>{
        if(data.selectedAddress !== this.state.account.address) {
          window.location.reload(false)
        }
      })
    })
  }
  

  registerAccount(e) {
    if (e) e.preventDefault()
    this.contractOperations.registerAccount(this.state.account.address).then(() => {
      var account = this.state.account
      account.accountRegistered = true
      this.setState({account:account})
    });
  }

  render() {
    return (
      <div className='App'>
        <Header
        contractOperations={this.contractOperations}
        account={this.state.account}
        registerAccount={this.registerAccount.bind(this)} />
        <div className='container'>
          {
            this.state.account.accountRegistered
            ? <Switch>
                <Route exact path='/' render={(props) => <Tickets contractOperations={this.contractOperations} {...props} />} />
                <Route path='/create' render={(props) => <CreateTicket contractOperations={this.contractOperations} {...props} account={this.state.account} />} />
                <Route path='/ticket/:number' render={(props) => <Ticket contractOperations={this.contractOperations} {...props} />} />
              </Switch>
            : <div>Please register your account</div>
          }
        </div>
        <Footer />
      </div>
    )
  }
}

export default App;
