import Web3 from 'web3';
import { useState } from 'react';
import { useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';
import './App10.css';




function App() {

  const [balance, setBalance] = useState(null)
  const [account, setAccount] = useState(null)
  const [newCharityAddress,setNewCharityAddress] = useState('')
  const [newCharityName,setNewCharityName] = useState('')
  const [charitiesAddressList, setCharitiesAddressList] = useState([])
  const [charitiesNamesList, setCharitiesNamesList] = useState([])
  const [charitiesMatchedAmountList, setCharitiesMatchedAmountList] = useState([])
  const [errorMessage, setErrorMessage] = useState('');
  const [newContractOwner, setNewContractOwner] = useState('')
  const [selectedCharity, setSelectedCharity] = useState('');
  const [donationAmount, setDonationAmount] = useState('0')
  const [donorsAddressList, setDonorsAddressList] = useState([])
  const [donorsDonationsList, setDonorsDonationsList] = useState([])
  const [charitiesDonationsList, setCharitiesDonationsList] = useState([])
  const [charitiesTotalDonationsList, setCharitiesTotalDonationsList] = useState([])
  const [contractOwnerAddress, setContractOwnerAddress] = useState('')
  
  
  
  
  
// Load provider (MetaMask) and the contract
//__________________________________________
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


// Load lists and other states from contract
//__________________________________________
  useEffect(()=>{
    
    web3Api.contract && getAccount() &&
     loadBalance() &&
       loadCharitiesList() &&
        getAllCharitiesMatchedAmount() &&
          loadDonorsAndDonations() &&
            loadAllCharitiesAndDonations() &&
              loadCharitiesAndTotalDonationsByCharity() &&
                loadContractOwnerAddress()    


  },[web3Api])
  
  

// 'handle' functions - handle the inputs values
//______________________________________________
  function handleNewContractOwner(event){
    setNewContractOwner(event.target.value)
  }

  
  function handleNewCharityName(event){
    setNewCharityName(event.target.value)
  }
  

  function handleNewCharityAddress(event){
    setNewCharityAddress(event.target.value)
  }

  const handleSelectedCharity = (event) => {
    setSelectedCharity(event.target.value);
    setErrorMessage('')//Clear Eror Meassage
  }

  
  function handleDonationAmount(event) {
    setDonationAmount(event.target.value)
  }

  

// Implementation of contract's core functions 
//____________________________________________
  const transferOwnership = async () => {
    const { contract } = web3Api
    setErrorMessage('')//Clear Eror Meassage
    if (newContractOwner.length===0){
      setErrorMessage("The contract owner address's field is empty!")
    }
    else{
      try {
        await contract.transferOwnership(newContractOwner, { from: account })
        loadContractOwnerAddress()
        
      } catch (error) {
        if (error.message !== "MetaMask Tx Signature: User denied transaction signature."){
            //customize error message:
            const errorStr = error.message.slice(24)
            const errorObj = JSON.parse(errorStr)
            setErrorMessage(errorObj.message)
          }
          else{
            setErrorMessage(error.message)

          }
        }
    }
  }



  const addCharity = async () => {
    const { contract} = web3Api
    setErrorMessage('')//Clear Eror Meassage

    if (newCharityAddress.length===0 || newCharityName.length===0){
      setErrorMessage("The name's field or the address's field are empty!")
    }
    else{
      try {
        await contract.addCharity(newCharityAddress, newCharityName, { from: account })
        const getAllCharities =  await contract.getAllCharities()
        setCharitiesAddressList(getAllCharities[0])
        setCharitiesNamesList(getAllCharities[1])

        //Updating states:
        getAllCharitiesMatchedAmount()
        loadDonorsAndDonations()
        loadAllCharitiesAndDonations()
        loadCharitiesAndTotalDonationsByCharity()
        loadBalance()

      } catch (error) {
        if (error.message !== "MetaMask Tx Signature: User denied transaction signature."){
            //customize error message:
            const errorStr = error.message.slice(24)
            const errorObj = JSON.parse(errorStr)
            setErrorMessage(errorObj.message)
          }
          else{
            setErrorMessage(error.message)

          }
        }

        setNewCharityName('') //Clear fields
        setNewCharityAddress('') //Clear fields
    }
  }

 
  const addDonation = async () => {
    const {contract,web3} = web3Api
    setErrorMessage('')//Clear Eror Meassage
    if(selectedCharity.length>0){
      try {
        const charityAddressIndex = charitiesNamesList.indexOf(selectedCharity)
        const charityAddress = charitiesAddressList[charityAddressIndex]
        await contract.donate(charityAddress,{ 
          from:account,
          value:web3.utils.toWei(donationAmount,"ether")} )
        setDonationAmount('0') // Clear field

        //Update states:
        getAllCharitiesMatchedAmount()
        loadDonorsAndDonations()
        loadAllCharitiesAndDonations()
        loadCharitiesAndTotalDonationsByCharity()
        loadBalance()
    
      }catch (error) {
        
        if (error.message !== "MetaMask Tx Signature: User denied transaction signature."){
          
          //customize error message:
          const errorStr = error.message.slice(24)
          const errorObj = JSON.parse(errorStr)
          setErrorMessage(errorObj.message)
        }
        else{
          setErrorMessage(error.message)
        }
      }
    }
    else{
      setErrorMessage("Select a Charity")
    }
  }


  const withdraw = async () => {
    setErrorMessage('')//Clear Eror Meassage
    const {contract} = web3Api
    try {
      await contract.withdraw({ 
        from:account})
      
       //Update states:
       getAllCharitiesMatchedAmount()
       loadDonorsAndDonations()
       loadAllCharitiesAndDonations()
       loadCharitiesAndTotalDonationsByCharity()
       loadBalance()

    }catch (error) {
      if (error.message !== "MetaMask Tx Signature: User denied transaction signature."){
          //customize error message:
          const errorStr = error.message.slice(24)
          const errorObj = JSON.parse(errorStr)
          setErrorMessage(errorObj.message)
        }
        else{
          setErrorMessage(error.message)
        }
      }  
  }


  const sendMatchedAmount = async () => {
    setErrorMessage('')//Clear Eror Meassage
    const {contract,web3} = web3Api
    const sumMatchedAmount = (await getAllCharitiesMatchedAmount()).toString()
    try {
    await contract.matchTheDonations({ 
      from:account,
      value:web3.utils.toWei(sumMatchedAmount,"ether")})
      
    //Update states:
    getAllCharitiesMatchedAmount()
    loadAllCharitiesAndDonations()
    loadCharitiesAndTotalDonationsByCharity()
    loadBalance()

    }catch (error) {
      if (error.message.lenght > 56){
        //customize error message:
        const errorStr = error.message.slice(24)
        const errorObj = JSON.parse(errorStr)
        setErrorMessage(errorObj.message)
      }
      else{
        setErrorMessage(error.message)
      }
    }
      
  }
  


// 'get data' functions - extract data from contract (like 'view' functions)
//__________________________________________________________________________
  const getAccount = async () => {
    const accounts = await web3Api.web3.eth.getAccounts()
    setAccount(accounts[0])
  }


  const loadBalance = async () => {
    const {contract,web3} = web3Api
    const balance = await web3.eth.getBalance(contract.address)
    setBalance(web3.utils.fromWei(balance, "ether"))
  }  


  const loadCharitiesList = async () => {
    const {contract} = web3Api
    const getAllCharities =  await contract.getAllCharities()
    setCharitiesAddressList(getAllCharities[0])
    setCharitiesNamesList(getAllCharities[1])
  } 


  const getAllCharitiesMatchedAmount = async () => {
    const {contract,web3} = web3Api
    
    const getAllCharitiesMatchedAmount =  await contract.getAllCharitiesAndMatchedAmount()
    const matchedAmounts = getAllCharitiesMatchedAmount[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString()))
    setCharitiesMatchedAmountList(matchedAmounts)
    
    const sumMatchedAmount = Number(web3.utils.fromWei(getAllCharitiesMatchedAmount[2],"ether").toString())
    return(sumMatchedAmount)
  } 


  const loadDonorsAndDonations = async () => {
    const {contract, web3} = web3Api
    const getAllDonorsAndDonations =  await contract.getAllDonorsAndDonations()
    setDonorsAddressList(getAllDonorsAndDonations[0])
    setDonorsDonationsList(getAllDonorsAndDonations[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString())))
  }


  const loadAllCharitiesAndDonations = async () => {
    const {contract, web3} = web3Api
    const getAllCharitiesAndDonations =  await contract.getAllCharitiesAndDonations()
    setCharitiesDonationsList(getAllCharitiesAndDonations[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString())))
  }


  const loadCharitiesAndTotalDonationsByCharity = async () => {
    const {contract, web3} = web3Api
    const getAllCharitiesAndTotalDonationsByCharity =  await contract.getAllCharitiesAndTotalDonationsByCharity()
    setCharitiesTotalDonationsList(getAllCharitiesAndTotalDonationsByCharity[1].map(bn => Number(web3.utils.fromWei(bn,"ether").toString())))
  }

  const loadContractOwnerAddress = async () => {
    const {contract} = web3Api
    const getContractOwnerAddress =  await contract.contractOwnerAddress()
    setContractOwnerAddress(getContractOwnerAddress)
  }


 // Retrun of the component ('jsx' code below), subject seperated by divs:
 //_______________________________________________________________________

  return(
    <div className="App">
    
      <div class="charity-select" >
        <label>Select a charity: </label>
        <select  value={selectedCharity} onChange={handleSelectedCharity}>
          <option value="" disabled selected hidden>
            Select a charity...
          </option>
          {/* Map over options and create <option> elements */}
          {charitiesNamesList.map(
            option => (
              <option key={option} value={option}>
                {option}
              </option>
            )
          )}
        </select>
        <p>You selected: {selectedCharity}</p>
      

        <div class="donation-amount">
          Donation Amount: 
          <input value={donationAmount} type='number' min='0' onChange={handleDonationAmount}></input>
          <button id='donate' onClick={addDonation}>Donate {donationAmount} Ether</button>
        </div>
        
        
         
        {((charitiesAddressList.includes(account)) || (contractOwnerAddress===account)) && (
          <div class="withdraw-donations">  
            Do you the charity? <br></br>
            Withdraw your donations! 
            <button onClick={withdraw}>Withdraw Donations!</button>
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <p style={{ color: 'red' }}>Error message,<br/> {errorMessage}</p>
          </div>
        )}

      </div>



      <div className='tables'>
        <div className='tables' id='total-donations'>
          <table>
            <thead>
              <tr>
                <th>Charity Name</th>
                <th>Total Donations Balance</th>
              </tr>
            </thead>
            <tbody>
              {charitiesNamesList.map((charity, index) => (
                <tr key={index}>
                  <td>{charity}</td>
                  <td>{charitiesTotalDonationsList[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        

        <div className='tables' id='donor-donations'>
            <table>
              <thead>
                <tr>
                  <th>Donor Address</th>
                  <th>Donor Donations</th>
                </tr>
              </thead>
              <tbody>
                {donorsAddressList.map((address, index) => (
                  <tr key={index}>
                    <td>{address}</td>
                    <td>{donorsDonationsList[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        

        <div className='tables' id='matched-amounts'>
          <table>
            <thead>
              <tr>
                <th>Charity Name</th>
                <th>Matched Amount</th>
              </tr>
            </thead>
            <tbody>
              {charitiesNamesList.map((charity, index) => (
                <tr key={index}>
                  <td>{charity}</td>
                  <td>{charitiesMatchedAmountList[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='tables' id='current-balance'>
          {((charitiesAddressList.includes(account)) || (contractOwnerAddress===account)) && (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Charity Name</th>
                <    th>Current Donations Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {charitiesNamesList.map((charity, index) => (
                    <tr key={index}>
                      <td>{charity}</td>
                      <td>{charitiesDonationsList[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {account === contractOwnerAddress && (
        <div className='contract-owner-actions'>
          <div className='new-charity'>
            <div className="new-charity-form">
              <h2>New Charity's Name:</h2> 
              <input id="newCharityName" value={newCharityName} onChange={handleNewCharityName}></input>
              <h2>,New Charit's Address:</h2>
              <input id="newCharityAddress" value={newCharityAddress} onChange={handleNewCharityAddress}></input>
              <button id='add-new-charity' onClick={addCharity}>Add new charity</button>
            </div>
          </div> 
      
          <div className='new-contract-owner'>
            <div className="new-contract-owner-form">  
              <h2>Insert new contract owner:</h2>
              <input id="newContractOwner" value={newContractOwner} onChange={handleNewContractOwner}></input>
              <button id='add-new-contract-owner' onClick={transferOwnership}>Change Contract Owner</button>
            </div>
          </div>

          <div className="matched-amount-button">
            <div>
              <h2>Contract Owner?</h2>
              <button id='match-all-amounts' onClick={sendMatchedAmount}>Match All Amounts!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default App;


