App = {
	web3Provider: null,
	contracts: {},
	
	init: async function() {
		return await App.initWeb3();
	},

	initWeb3: async function() {

		// Modern dapp browsers...
		if (window.ethereum) {
		  App.web3Provider = window.ethereum;
		  try {
			// Request account access
			await window.ethereum.enable();
		  } catch (error) {
			// User denied account access...
			console.error("User denied account access")
		  }
		}
		// Legacy dapp browsers...
		else if (window.web3) {
		  App.web3Provider = window.web3.currentProvider;
		}
		// If no injected web3 instance is detected, fall back to Ganache
		else {
		  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		}
		web3 = new Web3(App.web3Provider);

		return App.initContract();
	},

	initContract: function() {
		$.getJSON("JewelTokenICO.json", function(jewelTokenICO) {
				App.contracts.JewelTokenICO = TruffleContract(jewelTokenICO);
				App.contracts.JewelTokenICO.setProvider(App.web3Provider);
				App.contracts.JewelTokenICO.deployed().then(function(jewelTokenICO) {
				console.log("JewelTokenICO Address:", jewelTokenICO.address);
				});
			}).done(function() {
				$.getJSON("JewelToken.json", function(jewelToken) {
					App.contracts.JewelToken = TruffleContract(jewelToken);
					App.contracts.JewelToken.setProvider(App.web3Provider);
					App.contracts.JewelToken.deployed().then(function(jewelToken) {
					console.log("JewelToken Address:", jewelToken.address);
					});
				})
			});
		
		$('#accountAddress').html("1 Jewel token = 0.001 ether");
		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', '.btn-JewelToken', App.handleJewelToken);
		$(document).on('click', '.btn-ApproveJewelToken', App.handleApproveJewelToken);	
	},
	handleApproveJewelToken: function(event) {
		var sellerAddress;
		var contractInstance;
		allowedTokenValue = document.getElementById('allowedTokenValue').value;
		App.contracts.JewelToken.deployed().then(function(JewelTokenSale) {
		contractInstance = JewelTokenSale;
			return JewelTokenSale.getSellerAddress.call();		
		}).then(function(result) {
			sellerAddress = result;
			console.log("Jewel Token Address:", sellerAddress);
			contractInstance.approve.sendTransaction( "0x435bB598bae2403925B3c7796c1d15c1092603E2", allowedTokenValue, 
													{from:sellerAddress
													}).then(function(hash) {
													txhash = hash;
													return contractInstance.allowance(sellerAddress,"0x435bB598bae2403925B3c7796c1d15c1092603E2");
			}).then(function(result) {
				console.log("allowance "+result);
			});
			
		  });
	},
	handleJewelToken: function(event) {
		event.preventDefault();

		var tokenValue = document.getElementById('tokenValue').value;
		var tokenInstance;
		var tokenInstanceICO;

		web3.eth.getAccounts(function(error, accounts) {
		  if (error) {
			console.log(error);
		  }
		console.log(accounts);
		var account = accounts[0];
		var txhash;
		var sellerAddress;
		var balance;
		var tokenSold;
		//1 Jewel token = 0.001 ether
		var tokenPrice = 1000000000000000;
		console.log(account);
		App.contracts.JewelToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.getSellerAddress.call();
		}).then(function(result) {
			sellerAddress = result;
			return tokenInstance.allowance.call(sellerAddress,account);
		}).then(function(result) {
			App.contracts.JewelTokenICO.deployed().then(function(instance) {
				tokenInstanceICO = instance;
				console.log("tokenPrice is  "+tokenPrice);
				console.log(document.getElementById('tokenValue').value);
				tokenVal = document.getElementById('tokenValue').value;
				tokenInstanceICO.buyTokens.sendTransaction( sellerAddress, account, tokenVal, 
														{from:account,
														 value:tokenPrice * tokenVal
														}).then(function(hash) {
					txhash = hash;
					return tokenInstance.getSellerAddress.call();
				}).then(function(result) {
					return tokenInstance.allowance.call(sellerAddress,account);
				}).then(function(result) {
					tokenSold = result;
					console.log("allowed ",result.toNumber());
					return tokenInstance.balanceOf.call(sellerAddress);
				}).then(function(result) {
					balance = result;
					console.log("balance ",balance.toNumber());
					web3.eth.getTransaction(txhash, function(err, tx) {
						var t = "";
						var d = new Date();	
						var tr = "<tr>";
						tr += "<td>"+account+"</td>";
						tr += "<td>"+d.toString()+"</td>";
						tr += "<td>"+(tokenSold)+"</td>";
						tr += "<td>"+balance.toNumber()+"</td>";
						tr += "<td>"+txhash+"</td>";
						tr += "<td>"+"Buyer purchased "+document.getElementById('tokenValue').value+" tokens "+"</td>";
						tr += "</tr>";
						t += tr;
						document.getElementById("posts").innerHTML += t;
					});
				});
			}).catch(function(err) {
				console.log(err.message);
			  });
		  });
		});
	}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
