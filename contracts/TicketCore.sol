pragma solidity >=0.4.24;

contract TicketCore {
    enum TicketStatus { TODO, WIP, DONE, CLOSE } // 0,1,2,3
    struct Ticket{
        uint id;
        string title;
        string description;
        TicketStatus status;
        address tAssg;
        address tOwn;
    }

    struct AccountInfo {
        address addr;
        bool exists;
        uint[] assgTickets;
        uint[] ownedTickets;
    }

    address public admin;
    uint public allTicketsCount;
    mapping(uint => Ticket) public allTickets;

    uint public allAccountsCount;
    mapping(address => AccountInfo) public allAccounts;
    address[] public allAccountAddresses;
    
    constructor() public {
        admin = msg.sender;
    }

    modifier isAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    modifier isTicketOwner(uint _tId) {
        require(msg.sender == allTickets[_tId].tOwn, "Not a ticket owner. Action is not possible");  
        _;
    }

    modifier isTicketAssignee(uint _tId) {
        require(msg.sender == allTickets[_tId].tAssg, "Not a ticket assignee. Action is not possible");  
        _;
    }

    modifier ticketExists(uint _tId) {
        require(_tId >= 1 && _tId <= allTicketsCount, "Ticket doesn't exist");
        _;
    }

    modifier accountExists(address _addr) {
        require(allAccounts[_addr].exists == true, "Account doesn't exist");
        _;
    }

    modifier accountNotExists(address _addr) {
        require(allAccounts[_addr].exists == false, "Account already exists");
        _;
    }

    event TicketCreated(uint _id, address _owner, address _assignee);
    event AccountCreated(uint _id, address _addr);

    function createAccount() public accountNotExists(msg.sender) returns (uint _id) {
        allAccountsCount++;
        allAccountAddresses.push(msg.sender);
        allAccounts[msg.sender] = AccountInfo({
            addr: msg.sender,
            exists: true,
            assgTickets: new uint[](0),
            ownedTickets: new uint[](0)
        });

        emit AccountCreated(allAccountsCount, msg.sender);
        return allAccountsCount;
    }

    function createTicket(address _assignee, string memory _title, string memory _description)
        public accountExists(_assignee) accountExists(msg.sender) returns (uint _id) {
        allTicketsCount++;
        allTickets[allTicketsCount] = Ticket({
            id: allTicketsCount,
            title: _title,
            description: _description,
            status: TicketStatus.TODO,
            tAssg: _assignee,
            tOwn: msg.sender
        });

        allAccounts[_assignee].assgTickets.push(allTicketsCount);
        allAccounts[msg.sender].ownedTickets.push(allTicketsCount);

        emit TicketCreated(allTicketsCount, msg.sender, _assignee);
        return allTicketsCount;
    }

    function setTicketStatusClose(uint _tId) public isTicketOwner(_tId) {
        require(
            allTickets[_tId].status == TicketStatus.TODO || 
            allTickets[_tId].status == TicketStatus.WIP || 
            allTickets[_tId].status == TicketStatus.DONE, "Bad ticket status!");
        allTickets[_tId].status = TicketStatus.CLOSE;
    }

    function setTicketStatusDone(uint _tId) public isTicketAssignee(_tId) {
        require(
            allTickets[_tId].status == TicketStatus.TODO || 
            allTickets[_tId].status == TicketStatus.WIP, "Bad ticket status!");
        allTickets[_tId].status = TicketStatus.DONE;
    }

    function setTicketStatusInProgress(uint _tId) public isTicketAssignee(_tId) {
        require(allTickets[_tId].status == TicketStatus.TODO, "Bad ticket status!");
        allTickets[_tId].status = TicketStatus.WIP;
    }

    function getAllAccounts() public view returns (address[] memory)  {
        return allAccountAddresses;
    }

    function getTicketAssignee(uint _id) public view returns (address) {
        return allTickets[_id].tAssg;
    }

    function getTicketOwner(uint _id) public view returns (address) {
        return allTickets[_id].tOwn;
    }

    function getTicketStatus(TicketStatus _tstat) public pure returns (string memory) {
        if(_tstat == TicketStatus.TODO)
          return "TODO";
        if(_tstat == TicketStatus.WIP)
          return "In progress";
        if(_tstat == TicketStatus.DONE)
          return "Done";
        if(_tstat == TicketStatus.CLOSE)
          return "Closed";
        return "unknown";
    }

    function getAssignedTicketsNumber(address _addr) public view accountExists(_addr) returns(uint) {
        return allAccounts[_addr].assgTickets.length;
    }

    function getOwnedTicketsNumber(address _addr) public view accountExists(_addr) returns(uint) {
        return allAccounts[_addr].ownedTickets.length;
    }

    function getTicketInfoById(uint _tId) public view ticketExists(_tId) returns (string memory, string memory, address,
        address, TicketStatus, string memory) {
        return (allTickets[_tId].title, allTickets[_tId].description, allTickets[_tId].tAssg, allTickets[_tId].tOwn, allTickets[_tId].status,
            getTicketStatus(allTickets[_tId].status));
    }

    function getAssignedTicketIds(address _addr) public view accountExists(_addr) returns(uint[] memory) {
        uint numberAssgTickets = allAccounts[_addr].assgTickets.length;
        uint[] memory ids = new uint[](numberAssgTickets);

        for (uint i = 0; i < numberAssgTickets; i++) {
            ids[i] = allAccounts[_addr].assgTickets[i];
        }
        return ids;
    }

    function getOwnedTicketIds(address _addr) public view accountExists(_addr) returns(uint[] memory) {
        uint numberOwnedTickets = allAccounts[_addr].ownedTickets.length;
        uint[] memory ids = new uint[](numberOwnedTickets);

        for (uint i = 0; i < numberOwnedTickets; i++) {
            ids[i] = allAccounts[_addr].ownedTickets[i];
        }
        return ids;
    }

    function getAssignedTicketsByStatus(address _addr, TicketStatus _tStatus) public view accountExists(_addr) returns(uint[] memory) {
        uint numberAssgTickets = allAccounts[_addr].assgTickets.length;
        uint[] memory ids = new uint[](numberAssgTickets);

        for (uint i = 0; i < numberAssgTickets; i++) {
            Ticket memory curTicket = allTickets[allAccounts[_addr].assgTickets[i]];
            if (curTicket.status == _tStatus){
                ids[i] = curTicket.id;
            }
        }
        return ids;
    }

    function getOwnedTicketsByStatus(address _addr, TicketStatus _tStatus) public view accountExists(_addr) returns(uint[] memory) {
        uint numberOwnedTickets = allAccounts[_addr].ownedTickets.length;
        uint[] memory ids = new uint[](numberOwnedTickets);

        for (uint i = 0; i < numberOwnedTickets; i++) {
            Ticket memory curTicket = allTickets[allAccounts[_addr].ownedTickets[i]];
            if (curTicket.status == _tStatus){
                ids[i] = curTicket.id;
            }
        }
        return ids;
    }
    
    function accountRegistered() public view returns (bool) {
        return allAccounts[msg.sender].exists == true;
    }

}
