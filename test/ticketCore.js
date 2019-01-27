var TicketCore = artifacts.require("TicketCore");

contract('TicketCore', function(accounts) {
  var admin = accounts[0];
  var ethAmount = 5200000000000000;
  var smallEthAmount = 1;
  let tCore;
  let accNoFunds = web3.eth.accounts.create('test123');
  //  web3.eth.personal.unlockAccount(accNoFunds.address, 'test123');

  beforeEach('Setup contract for each test', async () => {
    tCore = await TicketCore.new();
  });

  it('Has an owner', async () => {
    assert.equal(await tCore.admin(), admin);
  });

  it('Account can be created only once', async () => {
    await tCore.createAccount();
    try{
      await tCore.createAccount();
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  });

  it('Ticket can be created and assigned', async () => {
    await tCore.createAccount({from: accounts[0]});
    await tCore.createAccount({from: accounts[1]});
    let ans = await tCore.createTicket(accounts[1],
                                       "Website renders slow", 
                                       "We need to do something about it.", {from: accounts[0]});
    assert.equal(ans.receipt.status, true);
  });

  it('Ticket can only be created by account', async () => {
    await tCore.createAccount({from: accounts[1]})
    try{
      let ans = await tCore.createTicket(accounts[1],
                                         "Website renders slow", 
                                         "We need to do something about it.", {from: accounts[0]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  })

  it('Ticket can only be assigned to account', async () => {
    await tCore.createAccount({from: accounts[0]})
    try{
      let ans = await tCore.createTicket(accounts[1],
                                         "Website renders slow", 
                                         "We need to do something about it.", {from: accounts[0]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  })

  it('Ticket assignee and owner are correct', async () => {
    await tCore.createAccount({from: accounts[2]})
    await tCore.createAccount({from: accounts[3]})
    let ans = await tCore.createTicket(accounts[2],
                                       "Website renders slow", 
                                       "We need to do something about it.", {from: accounts[3]})
    assert.equal(ans.logs[0].args._assignee, accounts[2])
    assert.equal(ans.logs[0].args._owner, accounts[3])
  })

  it('Returns all assigned and owned ticket numbers', async () => {
    await tCore.createAccount({from: accounts[2]})
    await tCore.createAccount({from: accounts[3]})
    await tCore.createTicket(accounts[2],
                             "Website renders slow", 
                             "We need to do something about it.", {from: accounts[3]})
    await tCore.createTicket(accounts[3],
                             "Test1", 
                             "Test description.", {from: accounts[2]})
    
    let ans1 = await tCore.getAssignedTicketsNumber(accounts[2]);
    let ans2 = await tCore.getOwnedTicketsNumber(accounts[2]);
    let ans3 = await tCore.getAssignedTicketsNumber(accounts[3]);
    let ans4 = await tCore.getOwnedTicketsNumber(accounts[3]);

    assert.equal(ans1, 1)
    assert.equal(ans2, 1)
    assert.equal(ans3, 1)
    assert.equal(ans4, 1)
  })

  it('Returns ticket ids by assignee', async () => {
    await tCore.createAccount({from: accounts[2]})
    await tCore.createAccount({from: accounts[3]})
    await tCore.createTicket(accounts[2],
                             "Website renders slow", 
                             "We need to do something about it.", {from: accounts[3]})
    await tCore.createTicket(accounts[2],
                             "Test1", 
                             "Test description.", {from: accounts[3]})

    let ans = await tCore.getAssignedTicketIds(accounts[2]);
    assert.equal(ans.length, 2);
    assert.equal(ans[0], 1);
    assert.equal(ans[1], 2);
  })

  it('Returns ticket info as expected', async () => {
    let tTitle = "Another fucking problem"
    let tDesc = "Sample problem description."

    await tCore.createAccount({from: accounts[2]})
    await tCore.createAccount({from: accounts[3]})
    let tAns = await tCore.createTicket(accounts[2], tTitle, tDesc, {from: accounts[3]})
    let tInfo = await tCore.getTicketInfoById(tAns.logs[0].args._id);

    assert.equal(tInfo[0], tTitle)
    assert.equal(tInfo[1], tDesc)
    assert.equal(tInfo[2], accounts[2])
    assert.equal(tInfo[3], accounts[3])
    assert.equal(tInfo[4], 0)
    assert.equal(tInfo[5], 'TODO')
  })

  it('Returns assigned tickets by specific status', async () => {
    let tTitle = "Another fucking problem"
    let tDesc = "Sample problem description."

    await tCore.createAccount({from: accounts[2]})

    await tCore.createTicket(accounts[2], tTitle, tDesc, {from: accounts[2]})
    await tCore.createTicket(accounts[2], tTitle, tDesc, {from: accounts[2]})
    await tCore.createTicket(accounts[2], tTitle, tDesc, {from: accounts[2]})
    await tCore.createTicket(accounts[2], tTitle, tDesc, {from: accounts[2]})

    await tCore.setTicketStatusClose(1,{from: accounts[2]})
    await tCore.setTicketStatusDone(2,{from: accounts[2]})

    let tInfo0 = await tCore.getAssignedTicketsByStatus(accounts[2], 0)
    let tInfo1 = await tCore.getAssignedTicketsByStatus(accounts[2], 1)
    let tInfo2 = await tCore.getAssignedTicketsByStatus(accounts[2], 2)
    let tInfo3 = await tCore.getAssignedTicketsByStatus(accounts[2], 3)

    let i = 0
    tInfo0.forEach(e => {
      if(parseInt(e) !== 0)
        i++;
    });
    assert.equal(i, 2)

    i = 0
    tInfo1.forEach(e => {
      if(parseInt(e) !== 0)
        i++;
    });
    assert.equal(i, 0)

    i = 0
    tInfo2.forEach(e => {
      if(parseInt(e) !== 0)
        i++;
    });
    assert.equal(i, 1)

    i = 0
    tInfo3.forEach(e => {
      if(parseInt(e) !== 0)
        i++;
    });
    assert.equal(i, 1)

  })

  it('Returns registered account addresses', async () => {
    await tCore.createAccount({from: accounts[2]})
    await tCore.createAccount({from: accounts[3]})
    let ans = await tCore.getAllAccounts();
    assert.equal(ans.length, 2);
    assert.equal(ans[0], accounts[2]);
    assert.equal(ans[1], accounts[3]);
  })

});
