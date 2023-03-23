import Web3 from 'web3';
import { useState } from 'react';
import { useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';


function App() {

  const [balance, setBalance] = useState(null)
  const [account, setAccount] = useState(null)
  const [newCharityAddress,setNewCharityAddress] = useState('')
  const [newCharityName,setNewCharityName] = useState('')
  const [charitiesAddressListSolidity, setCharitiesAddressListSolidity] = useState([])
  const [charitiesNamesListSolidity, setCharitiesNamesListSolidity] = useState([])
  const [charitiesMatchedAmountListSolidity, setCharitiesMatchedAmountListSolidity] = useState([])
  const [errorMessage, setErrorMessage] = useState('');
  const [newContractOwner, setNewContractOwner] = useState('')
  const [selectedCharity, setSelectedCharity] = useState('');
  const [donationAmount, setDonationAmount] = useState('')
  const [donorsAddressList, setDonorsAddressList] = useState([])
  const [donorsDonationsList, setDonorsDonationsList] = useState([])
  

  const [web3Api, setWeb3Api] = useState({
    provider:null,
    web3:null,
    contract:null
  })


  useEffect(()=>{
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      const contract = await loadContract("CharityDonation", provider)
      if(provider){
        setWeb3Api(
          {
            provider:provider,
            web3: new Web3(provider),
            contract:contract
          }
        )
      }
      else {
        console.log("Pleas install MetaMask")
      }
    }
    loadProvider()
  },[])

  useEffect(()=>{
    const loadBalance = async () => {
      const {contract,web3} = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, "ether"))
    }    
    web3Api.contract && loadBalance()

  },[web3Api])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
      
      
    }
    web3Api.web3 && getAccount()

  },[web3Api.web3])

  useEffect(()=>{
    const loadCharitiesList = async () => {
      const {contract} = web3Api
      const getAllCharities =  await contract.getAllCharities()
      setCharitiesAddressListSolidity(getAllCharities[0])
      setCharitiesNamesListSolidity(getAllCharities[1])
    }    
    web3Api.contract && loadCharitiesList()

  },[web3Api])

  useEffect(()=>{
    const loadMatchedAmountList = async () => {
      getAllCharitiesMatchedAmount()
    }    
    
    web3Api.contract && loadMatchedAmountList() && loadDonorsAndDonations()

  },[web3Api])
  
  

  function handleNewContractOwner(event){
    setNewContractOwner(event.target.value)
  }

  const transferOwnership = async () => {
    const { contract } = web3Api
    try {
      await contract.transferOwnership(newContractOwner, { from: account })
      
    } catch (error) {
       const errorStr = error.message.slice(24)
       const errorObj = JSON.parse(errorStr)
       setErrorMessage(errorObj.message)    
      }
  };

  function handleNewCharityName(event){
    setNewCharityName(event.target.value)
  }
  

  function handleNewCharityAddress(event){
    setNewCharityAddress(event.target.value)
  }

  const addCharity = async () => {
    const { contract, web3 } = web3Api
    try {
      await contract.addCharity(newCharityAddress, newCharityName, { from: account })
      const getAllCharities =  await contract.getAllCharities()
      setCharitiesAddressListSolidity(getAllCharities[0])
      setCharitiesNamesListSolidity(getAllCharities[1])

      getAllCharitiesMatchedAmount()
    

    } catch (error) {
       const errorStr = error.message.slice(24)
       const errorObj = JSON.parse(errorStr)
       setErrorMessage(errorObj.message)    
      }
      setNewCharityName('') //Clear fields
      setNewCharityAddress('') //Clear fields
  }

 


  const addDonation = async () => {
    const {contract,web3} = web3Api
    try {
      const charityAddressIndex = charitiesNamesListSolidity.indexOf(selectedCharity)
      const charityAddress = charitiesAddressListSolidity[charityAddressIndex]
      await contract.donate(charityAddress,{ 
        from:account,
        value:web3.utils.toWei(donationAmount,"ether")} )
      setDonationAmount('')

      getAllCharitiesMatchedAmount()
      
    
    }catch (error) {
      const errorStr = error.message.slice(24)
      const errorObj = JSON.parse(errorStr)
      setErrorMessage(errorObj.message)    
    }
    
  }


  const handleSelectedCharity = (event) => {
    setSelectedCharity(event.target.value);
  }

  
  function handleDonationAmount(event) {
    setDonationAmount(event.target.value)
  }

  const sendMatchedAmount = async () => {
    const {contract,web3} = web3Api
    const sumMatchedAmount = (await getAllCharitiesMatchedAmount()).toString()
    

    await contract.matchTheDonations({ 
      from:account,
      value:web3.utils.toWei(sumMatchedAmount,"ether")})
      
    getAllCharitiesMatchedAmount()
  }
  
  const getAllCharitiesMatchedAmount = async () => {
    const {contract,web3} = web3Api
    
    const getAllCharitiesMatchedAmount =  await contract.getAllCharitiesAndMatchedAmount()
    const matchedAmounts = getAllCharitiesMatchedAmount[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString()))
    setCharitiesMatchedAmountListSolidity(matchedAmounts)
    
    const sumMatchedAmount = Number(web3.utils.fromWei(getAllCharitiesMatchedAmount[2],"ether").toString())
    return(sumMatchedAmount)
  } 

  const loadDonorsAndDonations = async () => {
    const {contract, web3} = web3Api
    const getAllDonorsAndDonations =  await contract.getAllDonorsAndDonations()
    setDonorsAddressList(getAllDonorsAndDonations[0])
    setDonorsDonationsList(getAllDonorsAndDonations[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString())))
  }



  

  return (
    <div className="App">
      <div> Current Balance is {balance} Ether </div>  
      <div> Check that your account is {account} </div>  

      <div>
        Donation Amount: 
      <input  value={donationAmount} type='number' min='0' onChange={handleDonationAmount}></input>
        <button onClick={addDonation}>Donate {donationAmount} Ether</button>
      </div>
      
      <div>
        New Charity's Name: 
        <input value={newCharityName} onChange={handleNewCharityName}></input>
        New Charit's Address:
        <input value={newCharityAddress} onChange={handleNewCharityAddress}></input>
        <button onClick={addCharity}>Add new charity</button>
      </div>
      

      <div>
        Charities address list:
        <ul>
          {charitiesAddressListSolidity.map(
            charity => (
              <li>{charity}</li>
            )
          )
          }
        </ul>
      </div>    

      <div>
        Charities matched amounts:
        <ul>
          {charitiesMatchedAmountListSolidity.map(
            amount => (
              <li>{amount}</li>
            )
          )
          }
        </ul>
      </div> 
      
      <div>
        Donors Adress and their Donations:
        <ul>
          {donorsAddressList.map(
            address => (
              <li>{address}</li>
            )
          )
          }
        </ul>
        <ul>
          {donorsDonationsList.map(
            donations => (
              <li>{donations}</li>
            )
          )
          }
        </ul> 
      </div> 


      <div>
      {errorMessage && (
        <p style={{ color: 'red' }}>{errorMessage}</p>
      )}
      </div>
  
    <div>
        <input value={newContractOwner} onChange={handleNewContractOwner}></input>
        <button onClick={transferOwnership}>Change Contract Owner</button>
      </div>
        

      <div>
      <label htmlFor="dropdown">Select a charity: </label>
      <select  id="dropdown" value={selectedCharity} onChange={handleSelectedCharity} >
        <option value="" disabled selected hidden>
        Select a charity...
        </option>
        {/* Map over options and create <option> elements */}
        {charitiesNamesListSolidity.map(
          option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p>You selected: {selectedCharity}</p>
    </div>

    <button onClick={sendMatchedAmount}>Match All Amounts!</button>
  
    </div>
  );
}

export default App;


