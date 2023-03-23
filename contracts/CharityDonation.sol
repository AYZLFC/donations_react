// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityDonation {
    address payable public contractOwner;
    mapping(address => uint) public donations;
    mapping(address => bool) public charities;
    mapping(uint => address) private lutCharities;
    mapping(address => bool) public Donors;
    mapping(uint => address) private lutDonors;
    mapping(address => uint) public totalDonationsByDonor;
    mapping(address => uint) public totalDonationsByCharity;
    mapping(address => uint) public charitiesMatchedAmount;
    mapping(address => string) public charitiesNames;
    mapping(uint => string) private lutCharitiesNames;

    uint public numberOfDonors;
    uint public numberOfCharities;

    constructor() {
        contractOwner = payable(msg.sender); 
    }

    modifier onlyOwner(){
        require(msg.sender == contractOwner, "Only the owner can do that");
        _;
    }



    function transferOwnership(address newOwner) external onlyOwner {
        //require(msg.sender == contractOwner, "Only the contract owner can change the contract owner.");
        contractOwner = payable(newOwner);
    }

    // View of the contract owner adrress
    function contractOwnerAddress() public view returns(address ) {
        
        return (contractOwner );
    }

    //Add new charity to the contract
    function addCharity( address _charity , string memory _charityName ) public onlyOwner {
        require(!charities[_charity], "This charity already exist!");
        
            charities[_charity] = true;
            charitiesNames[_charity] = _charityName;
            uint charitiesIndex = numberOfCharities++;
            lutCharities[charitiesIndex] = _charity;
            lutCharitiesNames[charitiesIndex] = _charityName;
            charitiesMatchedAmount[_charity] = 0;
            donations[_charity] = 0;
            totalDonationsByCharity[_charity] = 0;
            
    }

    // The donation function
    function donate(address _charity) public payable {
        require(charities[_charity], "Invalid charity address.");
        require(msg.value > 0, "Donation amount must be greater than 0." );
        uint matchedAmount = msg.value;
        charitiesMatchedAmount[_charity] += matchedAmount;
        if (!Donors[msg.sender]){
            uint DonorsIndex = numberOfDonors++;
            Donors[msg.sender]=true;
            lutDonors[DonorsIndex]=msg.sender;
             totalDonationsByDonor[msg.sender] = 0;
        }
        donations[_charity] += msg.value;
        totalDonationsByDonor[msg.sender] += msg.value;
        totalDonationsByCharity[_charity] += msg.value;
    }

    //Show all the amounts the contract's owner need to match 
    function getAllCharitiesAndMatchedAmount() public view returns(address[] memory,uint[] memory ,uint  ) {
        address[] memory _Charities = new address[](numberOfCharities);
        uint[] memory _MatchedAmounts = new uint[](numberOfCharities);
        uint  _SumMatchedAmounts = 0;
        for(uint i=0; i<numberOfCharities; i++){
            _Charities[i]=lutCharities[i];
            _MatchedAmounts[i]=charitiesMatchedAmount[lutCharities[i]];
            _SumMatchedAmounts += charitiesMatchedAmount[lutCharities[i]];
        }
        return (_Charities,_MatchedAmounts , _SumMatchedAmounts );
    }

    //Function for the contract's owner to pay all matched amounts
    function matchTheDonations() public payable onlyOwner {
        for(uint i=0; i<numberOfCharities; i++){
            donations[lutCharities[i]] += charitiesMatchedAmount[lutCharities[i]];
            totalDonationsByCharity[lutCharities[i]] += charitiesMatchedAmount[lutCharities[i]];
            charitiesMatchedAmount[lutCharities[i]] = 0;
        }
    }

    //Show all charities
    function getAllCharities() public view returns(address[] memory , string[] memory ) {
        address[] memory _Charities = new address[](numberOfCharities);
        string[] memory  _CharitiesNames = new string[](numberOfCharities);
        for(uint i=0; i<numberOfCharities; i++){
            _Charities[i]=lutCharities[i];
             _CharitiesNames[i] = lutCharitiesNames[i];
        }
        return (_Charities, _CharitiesNames );    
    }
    
    //Shows all donors
    function getAllDonors() public view returns(address[] memory) {
        address[] memory _Donors = new address[](numberOfDonors);
        for(uint i=0; i<numberOfDonors; i++){
            _Donors[i]=lutDonors[i];
        }
        return _Donors;
    }

    //Shows all donors and their donations
    function getAllDonorsAndDonations() public view returns(address[] memory,uint[] memory) {
        address[] memory _Donors = new address[](numberOfDonors);
        uint[] memory _Donations = new uint[](numberOfDonors);
        for(uint i=0; i<numberOfDonors; i++){
            _Donors[i]=lutDonors[i];
            _Donations[i]=totalDonationsByDonor[lutDonors[i]];
        }
        return (_Donors,_Donations );
    }

    //Shows all charities and their current donation balance
    function getAllCharitiesAndDonations() public view returns(address[] memory,uint[] memory) {
        address[] memory _Charities = new address[](numberOfCharities);
        uint[] memory _Donations = new uint[](numberOfCharities);
        for(uint i=0; i<numberOfCharities; i++){
            _Charities[i]=lutCharities[i];
            _Donations[i]=donations[lutCharities[i]];
        }
        return (_Charities,_Donations);
    }

    //Shows all charities and their total donation balance ever
     function getAllCharitiesAndTotalDonationsByCharity() public view returns(address[] memory,uint[] memory) {
        address[] memory _Charities = new address[](numberOfCharities);
        uint[] memory _TotalDonationsByCharity = new uint[](numberOfCharities);
        for(uint i=0; i<numberOfCharities; i++){
            _Charities[i]=lutCharities[i];
            _TotalDonationsByCharity[i]=totalDonationsByCharity[lutCharities[i]];
        }
        return (_Charities,_TotalDonationsByCharity);
    }

    //Withdraw function for the charities to withdraw all their current donations
    function withdraw() public {
        require(charities[msg.sender] = true, "You are not one of the charities.");
        uint amount = donations[msg.sender];
        require(amount > 0, "No funds available for withdrawal.");
        donations[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }


}


// const instance = await CharityDonation.deployed()
// instance.addCharity("0x197455e3eEf7dA7302ac524a97e3Ca041cEd154D","Moses's Charity") 
// instance.getAllCharities()