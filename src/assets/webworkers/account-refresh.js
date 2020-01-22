importScripts('casinocoin-lib.js');
importScripts('crypto-js.js');
importScripts('big.js');

self.cscAPI;
self.pbkdf2KeyLength = 32;
self.pbkdf2Digest = 'sha512';
self.pbkdf2Rounds = 10000;
self.maxActNotFound = 5;

self.onmessage = function(event) {
    console.log('### account-refresh: ', JSON.stringify(event.data));
    if(event.data.cmd = 'refresh-wallet') {
        self.cscAPI = new casinocoin.CasinocoinAPI({server: event.data.serverURL});
        self.startRefresh(event.data);
    } else {
        console.log('Invalid Command');
    }
};

self.startRefresh = function(data) {
    // const walletAccounts = data.accounts;
    const decryptedMnemonicHash = data.decryptedMnemonicHash;
    // connect to the server
    self.cscAPI.connect().then( async () => {
        console.log('### account-refresh -> START ###');
        // set the inital account sequence to -1 so it will start at 0
        let newAccountSequence = -1;
        let actNotFoundCount = 0;
        let emptyAccountSequences = [];
        let firstAccountRefresh = true;
        let newAccountFound = false;
        let accountResults = [];
        let defaultAccount = {
              pk: '',
              accountID: '',
              balance: '0',
              accountSequence: 0,
              currency: 'CSC',
              lastSequence: 0,
              label: 'Default CSC Account',
              tokenBalance: '0',
              activated: false,
              ownerCount: 0,
              lastTxID: '',
              lastTxLedger: 0
            };
        while (newAccountFound || firstAccountRefresh) {
            firstAccountRefresh = false;
            // increase the account sequence
            newAccountSequence = newAccountSequence + 1;
            console.log('### account-refresh -> newAccountSequence: ' + newAccountSequence);
            const newKeyPair = self.generateKeyPair(newAccountSequence, decryptedMnemonicHash, data.email);
            // create account object
            const foundAccount = {keypair: newKeyPair, sequence: newAccountSequence, accounts: [], transactions: []};
            // check if new key pair AccountID exists on the ledger
            try {
                const accountResult = await self.cscAPI.getAccountInfo(newKeyPair.accountID);
                // get account balances to see if we need to add token accounts
                const accountBalances = await self.cscAPI.getBalances(newKeyPair.accountID);
                accountBalances.forEach(balance => {
                    // create new account
                    const walletAccount = {
                        pk: (balance.currency + newKeyPair.accountID),
                        accountID: newKeyPair.accountID,
                        balance: self.cscToDrops(accountResult.cscBalance),
                        accountSequence: newAccountSequence,
                        currency: balance.currency,
                        tokenBalance: (balance.currency === 'CSC') ? '0' : self.cscToDrops(balance.value),
                        lastSequence: accountResult.sequence,
                        label: balance.currency + ' Account',
                        activated: true,
                        ownerCount: accountResult.ownerCount,
                        lastTxID: accountResult.previousAffectingTransactionID,
                        lastTxLedger: accountResult.previousAffectingTransactionLedgerVersion
                    };
                    // save account to array
                    foundAccount.accounts.push(walletAccount);
                });
                // get and add all account transactions
                const accountTxArray = await self.cscAPI.getTransactions(newKeyPair.accountID, {earliestFirst: true});
                accountTxArray.forEach( tx => {
                    if (tx.type === 'payment' && tx.outcome.result === 'tesSUCCESS') {
                        let txDirection;
                        let txAccountID;
                        if (tx.specification.destination.address === newKeyPair.accountID) {
                            txDirection = 'incommingTX';
                            txAccountID = tx.specification['destination'].address;
                        } else if (tx.specification['source'].address === newKeyPair.accountID) {
                            txDirection = 'outgoingTX';
                            txAccountID = tx.specification['source'].address;
                        }
                        // create new transaction object
                        const dbTX = {
                            accountID: tx.address,
                            amount: self.cscToDrops(tx.outcome['deliveredAmount'].value),
                            currency: tx.outcome['deliveredAmount'].currency,
                            destination: tx.specification['destination'].address,
                            fee: self.cscToDrops(tx.outcome.fee),
                            flags: 0,
                            lastLedgerSequence: tx.outcome.ledgerVersion,
                            sequence: tx.sequence,
                            signingPubKey: '',
                            timestamp: self.iso8601ToCasinocoinTime(tx.outcome.timestamp),
                            transactionType: tx.type,
                            txID: tx.id,
                            txnSignature: '',
                            direction: txDirection,
                            validated: (tx.outcome.indexInLedger >= 0),
                            status: 'txVALIDATED',
                            inLedger: tx.outcome.ledgerVersion
                        };
                        // add Memos if defined
                        if (tx.specification['memos']) {
                            dbTX.memos = [];
                            tx.specification['memos'].forEach( memo => {
                                const newMemo = { memo:
                                    self.removeUndefined({
                                        memoType: memo.type,
                                        memoFormat: memo.format,
                                        memoData: memo.data
                                    })
                                };
                                dbTX.memos.push(newMemo);
                            });
                        }
                        // add Destination Tag if defined
                        if (tx.specification['destination'].tag) {
                            dbTX.destinationTag = tx.specification['destination'].tag;
                        }
                        // add Invoice ID if defined
                        if (tx.specification['invoiceID'] && tx.specification['invoiceID'].length > 0) {
                            dbTX.invoiceID = tx.specification['invoiceID'];
                        }
                        // insert into the acount object
                        foundAccount.transactions.push(dbTX);
                    }
                });
                newAccountFound = true;
                // accountResults.push(foundAccount);
                self.postMessage(foundAccount);
            } catch ( error ) {
                actNotFoundCount++;
                emptyAccountSequences.push(newAccountSequence);
                if(newAccountSequence === 0) {
                    // default account is not funded, save it as default account in case there is no account found
                    defaultAccount.pk = ('CSC' + newKeyPair.accountID);
                    defaultAccount.accountID = newKeyPair.accountID;
                    foundAccount.accounts.push(defaultAccount);
                    console.log('### account-refresh -> Refresh - Empty default account with Sequence 0 !! ###');
                    self.postMessage(foundAccount);
                    newAccountFound = true;
                }
                if (actNotFoundCount > this.maxActNotFound) {
                    console.log('### account-refresh -> Refresh - We found our last account sequence that exists on the ledger ###');
                    console.log('### account-refresh -> Refresh - emptyAccountSequences: ' + JSON.stringify(emptyAccountSequences));
                    newAccountFound = false;
                    self.postMessage({emptyAccountSequences: emptyAccountSequences});
                } else {
                    newAccountFound = true;
                }
            }
        }
    });
};

function generateKeyPair(sequence, passwordKey, email) {
    const saltHash = CryptoJS.algo.SHA512.create();
    saltHash.update(email);
    const passwordSalt = saltHash.finalize().toString(CryptoJS.enc.Base64);
    // concat path with mnemonic hash
    const pathWithHash = 'm/0/' + sequence + '/' + passwordKey;
    const reHashedHash =  CryptoJS.SHA512(pathWithHash);
    const reHashedHashString = reHashedHash.toString(CryptoJS.enc.Base64);
    // generate hex entropy
    const entropyHex = CryptoJS.PBKDF2(reHashedHashString, passwordSalt, {keySize: self.pbkdf2KeyLength, iterations: self.pbkdf2Rounds, hasher: CryptoJS.algo.SHA512 }).toString(CryptoJS.enc.Hex);
        // convert hex string to array buffer
    const entropyArray = new Uint8Array(entropyHex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    }));
    const entropy = {entropy: entropyArray};
    const seed	= self.cscAPI.generateSeed(entropy);
    // derive keypair
    const keypair = self.cscAPI.deriveKeypair(seed);
    const newKeyPair = { secret: seed, publicKey: keypair.publicKey, privateKey: keypair.privateKey, accountID: cscAPI.deriveAddress(keypair.publicKey), encrypted: false};
    return newKeyPair;
  }

function removeUndefined(obj) {
    // return _.omit(obj, _.isUndefined)
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
}

function cscToDrops(csc) {
    const csc_drops = (new Big(csc)).times(100000000.0);
    return csc_drops.toString();
}

function unixToCasinocoinTimestamp(timestamp) {
    return Math.round(timestamp / 1000) - 0x386D4380;
}

function iso8601ToCasinocoinTime(iso8601) {
    return this.unixToCasinocoinTimestamp(Date.parse(iso8601));
}