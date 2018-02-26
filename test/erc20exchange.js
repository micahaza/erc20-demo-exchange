var exchange = artifacts.require("./ERC20Exchange.sol");
var fsToken = artifacts.require("./FixedSupplyToken.sol");

contract('Exchange contract', function(accounts){
    
    it('we can deposit ether with depositEther method', function(){
        var exchangeInstance;
 
        var testAccount = accounts[0];
        var balanceBeforeDeposit = web3.eth.getBalance(testAccount);
        var balanceAfterDeposit;
        var balanceAfterWithdrawal;        

        exchange.deployed().then(function(instance){
            exchangeInstance = instance;
             return exchangeInstance.depositEther({from: testAccount, value: web3.toWei(1, "ether")});
        }).then(function(tx){
            return exchangeInstance.getEtherBalanceInWei.call({from: testAccount});
        }).then(function(balanceInWei){
            balanceAfterDeposit = balanceInWei;
            assert.equal(balanceAfterDeposit.toNumber(), web3.toWei(1, "ether"));
            assert.isAtLeast(balanceBeforeDeposit.toNumber() - balanceAfterDeposit.toNumber(), web3.toWei(1, "ether"));
        })
    })

    it('we can withdraw previously deposited ether', function(){
        var exchangeInstance;
 
        var testAccount = accounts[1];
        var balanceBeforeDeposit = web3.eth.getBalance(testAccount);
        var balanceAfterDeposit;
        var balanceAfterWithdrawal;        
        var gasUsed = 0;

        exchange.deployed().then(function(instance){
            exchangeInstance = instance;
             return exchangeInstance.depositEther({from: testAccount, value: web3.toWei(1, "ether")});
        }).then(function(tx){
            gasUsed += tx.receipt.cumulativeGasUsed * web3.eth.getTransaction(tx.receipt.transactionHash).gasPrice.toNumber();
            return exchangeInstance.getEtherBalanceInWei.call({from: testAccount});
        }).then(function(balanceInWei){
            balanceAfterDeposit = balanceInWei;
            assert.equal(balanceAfterDeposit.toNumber(), web3.toWei(1, "ether"));
            assert.isAtLeast(balanceBeforeDeposit.toNumber() - balanceAfterDeposit.toNumber(),web3.toWei(1, "ether"));
            return exchangeInstance.withdrawEther(web3.toWei(1, "ether"), {from: testAccount})
        }).then(function(txHash){
            balanceAfterWithdrawal = web3.eth.getBalance(testAccount);
            return exchangeInstance.getEtherBalanceInWei.call({from: testAccount});
        }).then(function(balanceInWei){
            assert.equal(balanceInWei.toNumber(), 0, "1 ether still available")
            assert.isAtLeast(balanceAfterWithdrawal.toNumber(), balanceBeforeDeposit.toNumber() - 2 * gasUsed, "We're almost okay")
        })
    })

    it('exchange owner can add new token', function(){
        var tokenInstance;
        var exchangeInstance;
        return fsToken.deployed().then(function(instance){
            tokenInstance = instance;  
            return exchange.deployed();
        }).then(function(instance){
            exchangeInstance = instance;
            return exchangeInstance.addToken(tokenInstance.address, "FIXED");
        }).then(function(){
            return exchangeInstance.hasToken.call("FIXED")
        }).then(function(hasToken){
            assert.equal(true, hasToken, "Token wasn't added");
            return exchangeInstance.hasToken.call("NONEXISTENT");
        }).then(function(hasToken){
            assert.equal(false, hasToken, "non existent token wasn found");
        })
    })

    it('we should be able to deposit token', function(){
        var exchangeInstance;
        var tokenInstance;
        return exchange.deployed().then(function(instance){
            exchangeInstance = instance;
        }).then(function(){
            return fsToken.deployed();
        }).then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve(exchangeInstance.address, 1500);
        }).then(function(tx){
            return exchangeInstance.depositToken('FIXED', 1500)
        }).then(function(txHash){
            return exchangeInstance.getTokenBalance('FIXED');
        }).then(function(tBalance){
            assert.equal(1500, tBalance);
        })
    })

    it('we should be able to withdraw token', function(){
        var exchangeInstance;
        var tokenInstance;
        return exchange.deployed().then(function(instance){
            exchangeInstance = instance;
        }).then(function(){
            return fsToken.deployed();
        }).then(function(instance){
            tokenInstance = instance;
        })
    })
})
