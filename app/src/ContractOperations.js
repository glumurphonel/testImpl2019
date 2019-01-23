//Contract/truffle components
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import ticket_artifacts from './contracts/TicketCore.json'

class ContractOperations {
    constructor() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask')
        // Use Mist/MetaMask's provider
        this.provider = window.web3.currentProvider
        this.web3 = new Web3(this.provider)
        this.ticketContract = contract(ticket_artifacts)
        this.ticketContract.setProvider(this.provider)  
      } else {
        throw 'No web3 detected. please use MetaMask.'
      }
    }

  readAccount(callback) {
    var self = this;
    this.web3.eth.getCoinbase(function (err, account) {
      if (err != null) {
        alert('There was an error fetching your account.')
        console.log(err)
        return
      }

      if (account == null) {
        alert('Couldn\'t load account! Make sure your Ethereum client is configured correctly.')
        return
      }

      self.ticketContract.deployed().then(async (instance) => {
        let receipt = await instance.accountRegistered({ from: account })
        if (callback)
          callback({address: account, accountRegistered: receipt})
      })
    })
  }

  async createTicket(title, description, assignee, from) {
    var ticketId
    await this.ticketContract.deployed().then(async (instance) => {
      ticketId = (await instance.createTicket(assignee, title, description, { from: from })).logs[0].args._id
    })
    return ticketId
  }

  async registerAccount(account) {
    await this.ticketContract.deployed().then(async (instance) => {
      await instance.createAccount({ from: account })
    })
  }
  
  async getAssignedTickets(account) {
    var self = this
    var tickets = []
    await self.ticketContract.deployed().then(async (instance) => {
      let ticketIds = await instance.getAssignedTicketIds(account)
      for (var i = 0; i < ticketIds.length; i ++) {
        tickets.push(await self.getTicketInfo(ticketIds[i]))
      }
    })
    return tickets
  }

  async getTicketInfo(id) {
    var ticketObj;
    await this.ticketContract.deployed().then(async (instance) => {
      const ticket = await instance.getTicketInfoById(id)
      ticketObj = {
          id: id,
          title: ticket[0],
          description: ticket[1],
          assignee: ticket[2],
          owner: ticket[3],
          statusEnum: ticket[4],
          statusText: ticket[5]
      }
    })
    return ticketObj;
  }

  async getRegisteredAccounts() {
    var accounts
    await this.ticketContract.deployed().then(async (instance) => {
      accounts = await instance.getAllAccounts()
    })
    return accounts
  }

  async setTicketStatusInProgress(id, from) {
    await this.ticketContract.deployed().then(async (instance) => {
      await instance.setTicketStatusInProgress(id, { from: from })
    })
  }

  async setTicketStatusClose(id, from) {
    await this.ticketContract.deployed().then(async (instance) => {
      await instance.setTicketStatusClose(id, { from: from })
    })
  }

  async setTicketStatusDone(id, from) {
    await this.ticketContract.deployed().then(async (instance) => {
      await instance.setTicketStatusDone(id, { from: from })
    })
  }

}

export default ContractOperations;
