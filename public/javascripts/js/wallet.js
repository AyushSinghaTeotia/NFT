


async function BuyContent() {
        // Get a Web3 instance for the wallet
        const web3 = new Web3(provider);

        console.log("Web3 instance is", web3);

        // Get connected chain id from Ethereum node
        const chainId = await web3.eth.getChainId();
        // Load chain information over an HTTP API
        //   const chainData = await EvmChains.getChain(chainId);
        //   document.querySelector("#network-name").textContent = chainData.name;

        // Get list of accounts of the connected wallet
        const accounts = await web3.eth.getAccounts();

        // MetaMask does not give you all accounts, only the selected account
        // console.log("Got accounts", accounts);
        selectedAccount = accounts[0];

        // Purge UI elements any previously loaded accounts
        
        // Go through all accounts and get their ETH balance
        const rowResolvers = accounts.map(async (address) => {
            const balance = await web3.eth.getBalance(address);
            // ethBalance is a BigNumber instance
            // https://github.com/indutny/bn.js/
            // const ethBalance = web3.utils.fromWei(balance, "ether");
            // const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
            // Fill in the templated row and put in the document
        });

        // Because rendering account does its own RPC commucation
        // with Ethereum node, we do not want to display any results
        // until data for all accounts is loaded
        await Promise.all(rowResolvers);

        //var code = "92655f7237f805673a2a810ed0badd228445bf8fe38a43c0f65fd2616fff25b7";

        // const web3 = new Web3(provider);
        var finalprice =getBasicPrice();
        await web3.eth.sendTransaction({
            from: selectedAccount,
           // data: code,
            to: "0x6cDDe6477FCBC301a11ECD8Dc41307A5470DF7F1", 
            value:'0x' + ((finalprice* 1000000000000000000).toString(16)),
        }, function(err, transactionHash) {
            if (err) { 
                console.log(err); 
            } else {
                console.log(transactionHash);
                var content_id = getContentId(); //document.getElementById('content_id').value;
                console.log(content_id);
                
                // // obj.value = txHash;
                $.ajax({
                   dataType: "json",
                   type: 'post',
                   url: '/users/save-order',
                    data: {
                          tx_id:transactionHash,
                          content_id:content_id,
                          address:selectedAccount,
                         // qty: document.getElementById("copies").value,
                            amount: finalprice,
               //         currency: currency,
               //         currencyRate: currencyRate
                         },
                    success: function(data) {
                        swal({
                             type: 'success',
                              text: 'Transaction completed successfully.',
                              timer: 3000,
                              onOpen: function() {
                                swal.showLoading()
                            }
                        }).then(function() {
                            location.reload();
                       });
                                  location.reload();
                   }
                });
           
            }
        });
    }


async function resetAccountData() {        
    await BuyContent(provider);        
}

/**
* Connect wallet button pressed.
*/
async function onConnect() {

    console.log("Opening a dialog", web3Modal);
    try {
          provider = await web3Modal.connect();
       }catch(e) {
        console.log("Could not get a wallet connection", e);
    return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        BuyContent();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        BuyContent();
    });

    await resetAccountData();
}



// Script connect wallet


