App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
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
	$.getJSON('JewelTokenBuy.json', function(data) {
	  // Get the necessary contract artifact file and instantiate it with truffle-contract
	  var JewelTokenBuyArtifact = data;
	  App.contracts.JewelTokenBuy = TruffleContract(JewelTokenBuyArtifact);

	  // Set the provider for our contract
	  App.contracts.JewelTokenBuy.setProvider(App.web3Provider);

	  App.contracts.JewelTokenBuy.deployed().then(function(JewelTokenBuy) {
        console.log("JewelTokenBuy Address:", JewelTokenBuy.address);
      });
    }).done(function() {
      $.getJSON("JewelToken.json", function(jewelToken) {
        App.contracts.JewelToken = TruffleContract(jewelToken);
        App.contracts.JewelToken.setProvider(App.web3Provider);
        App.contracts.JewelToken.deployed().then(function(jewelToken) {
          console.log("Jewel Token Address:", jewelToken.address);
        });
	  });
	})
	// Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })
    return App.bindEvents();
  },
  
  bindEvents: function() {
	$(document).on('click', '.btn-JewelToken', App.handleJewelToken);	
  },
  
   handleJewelToken: function() {
    var numberOfTokens = $('#tokenValue').val();
    App.contracts.JewelTokenBuy.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
};
/*
  handleJewelToken: function(event) {
    event.preventDefault();

	var tokenValue = document.getElementById('tokenValue').value;
    var tokenInstance;
	
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }
	console.log(accounts);
	var account = accounts[0];
	var txhash;
	var sellerAddress;
	console.log(account);
	App.contracts.JewelToken.deployed().then(function(instance) {
		tokenInstance = instance;
		return tokenInstance.allowance("0xE59d152100b751a3aBB148b3c3Fc9f7ae63B86fc","0x435bB598bae2403925B3c7796c1d15c1092603E2");
		
	}).then(function(result) {
		//sellerAddress = result;
		console.log("result "+result);
		console.log(document.getElementById('tokenValue').value);
		tokenInstance.buyTokens.sendTransaction( document.getElementById('tokenValue').value, 
												{from:account
												}).then(function(hash) {
												txhash = hash;
												return tokenInstance.balanceOf(sellerAddress);
		}).then(function(result) {
			console.log("Jewel Token result",txhash);
			console.log("balance",result.toNumber());
			web3.eth.getTransaction(txhash, function(err, tx) {
				var t = "";
				var d = new Date();	
				var tr = "<tr>";
				tr += "<td>"+App.account+"</td>";
				tr += "<td>"+d.toString()+"</td>";
				tr += "<td>"+document.getElementById('tokenValue')+"</td>";
				tr += "<td>"+result.toNumber()+"</td>";
				tr += "<td>"+txhash+"</td>";
				tr += "<td>"+(result.toNumber())+"tokens remaining"+"</td>";
				tr += "</tr>";
				t += tr;
				document.getElementById("posts").innerHTML += t;
			});
	    });
	}).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  }
};
*/
$(function() {
  $(window).load(function() {
    App.init();
  });
});
