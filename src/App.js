import Web3 from 'web3';
import { useState } from 'react';
import { useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';


function App() {

  const [web3Api, setWeb3Api] = useState({
    provider:null,
    web3:null,
    contract:null
  })

  useEffect(()=>{
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      if(provider){
        setWeb3Api(
          {
            provider:provider,
            web3: new Web3(provider),
            contract:null
          }
        )
      }
      else {
        console.log("Pleas install MetaMask")
      }
    }
    loadProvider()
  },[])



  return (
    <div className="App">
      <button onClick={async () =>{
        const accounts = await window.ethereum.request({method:"eth_requestAccounts"})
        console.log(accounts)
      }}>Connect to MetaMask</button>
    </div>
  );
}

export default App;
