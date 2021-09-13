
// Script connect wallet

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const EvmChains = window.EvmChains;
const Fortmatic = window.Fortmatic;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


/**
 * Setup the orchestra
 */
function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    // console.log("Fortmatic is", Fortmatic);

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
        package: WalletConnectProvider,
        options: {
                rpc: {
                    56: 'https://bsc-dataseed.binance.org/',
                },
                network: 'binance',
                chainId: 56,
                // infuraId: "bnb1a5cae5d9hp0we9cx9v02n9hvmt94nnuguv0fav",
            },
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
    });
}
async function fetchAccountData() {
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

        // const web3 = new Web3(provider);

        await web3.eth.sendTransaction({
            from: selectedAccount,
            to: "0x6cDDe6477FCBC301a11ECD8Dc41307A5470DF7F1", 
            value:'0x' + ((0.000001 * 1000000000000000000).toString(16)),
        }, function(err, transactionHash) {
            if (err) { 
                console.log(err); 
            } else {
                console.log(transactionHash);
            }
        });
    }


async function refreshAccountData() {        
    await fetchAccountData(provider);        
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
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}
init();

// Script connect wallet
