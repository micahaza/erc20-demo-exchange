var fst = artifacts.require("./FixedSupplyToken.sol");

contract('FixedSupplyToken', function(accounts){
    
    it('first account should own all the tokens', function(){
        var totalSupply;
        var tokenInstance;
        var firstAccount = accounts[0];
    
        return fst.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply.call();
        }).then(function(_totalSupply){
            totalSupply = _totalSupply;
            return tokenInstance.balanceOf(firstAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), totalSupply.toNumber(), "First account does not owns all the tokens")
        })
    })

    it('second account has no initial funds', function(){
        var secondAccount = accounts[1];
        var tokenInstance;
        return fst.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.balanceOf(secondAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 0, "Second account has accidental funds!");
        })
    })

    it('sends tokens between accounts correctly', function(){
        var firstAccount = accounts[0];
        var secondAccount = accounts[1];
        var thirdAccount = accounts[2];
        
        var totalSupply;
        var firstAccountBalance;
        var secondAccountBalance;
        var thirdAccountBalance;
        
        var tokenInstance;
        return fst.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply.call();
        }).then(function(_totalSupply){
            totalSupply = _totalSupply;
            return tokenInstance.transfer(secondAccount, 10, {from: firstAccount})
        }).then(function(success){
            assert.equal(success.logs.length, 1);
            return tokenInstance.balanceOf(secondAccount);
        }).then(function(balance){
            assert.equal(10, balance.toNumber());
            return tokenInstance.transfer(thirdAccount, 10, {from: firstAccount});
        }).then(function(){
            return tokenInstance.balanceOf(firstAccount);
        }).then(function(balance){
            firstAccountBalance = balance;
            return tokenInstance.balanceOf(secondAccount);
        }).then(function(balance){
            secondAccountBalance = balance;
            return tokenInstance.balanceOf(thirdAccount);
        }).then(function(balance){
            thirdAccountBalance = balance;
            assert.equal(firstAccountBalance.toNumber(), totalSupply - 20, "First account balance is not as expected");
            assert.equal(secondAccountBalance.toNumber(), 10, "Second account balance is not as expected");
            assert.equal(thirdAccountBalance.toNumber(), 10, "Third account balance is not as expected");
        })
    })
})