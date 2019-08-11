
"use strict";

let localInventoryManager = {};
let localChatResponse = {};

// Forward data linkage pointer into local assignment for routes to manipulate
// Only a shallow copy 
const linkInventoryData = function (InventoryManager){ 
    localInventoryManager = InventoryManager; 
    console.log('TEST localInventoryManager Output:', localInventoryManager.showInventory());
};

// Forward function linkage pointer into local assignment for routes to utilize
// Only a shallow copy 
const linkCharResponder = function (ChatResponse){ 
    localChatResponse = ChatResponse; 
    console.log('TEST localChatResponse Output:', localChatResponse.getRandomGossip());
};

const apiHeaders = {'Content-Type':'application/json', "Access-Control-Allow-Origin": "*"};

const errorHandling = (err, res)=>{
    console.log("errorHandling res.headers:  ", res.headers);
        console.log("errorHandling res.body:  ", res.body);
    if (err.responseCode){
        res.status('errorHandling:  ',err.responseCode);
    } else {
        console.log('errorHandling:  ', err);
        res.status(500);
    }
    res.set(apiHeaders).send({message: err.message});
};


const router = function(app){

    // GET  request - Show all the items.
    app.get('/api/v1/inventory/list', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        res.status(200).set(apiHeaders).send(localInventoryManager.showInventory());
    });

    // POST request - Increment the days of use.
    app.post('/api/v1/inventory/increment', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        localInventoryManager.incrementDay();
        res.status(200).set(apiHeaders).send();
    });

    // POST request -  Purchase an item.
    app.post('/api/v1/inventory/purchase', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        try {
            localInventoryManager.addItemAsObject(req.body);
            res.status(200).set(apiHeaders).send();
        }
        catch (err) {
            errorHandling(err, res);
        }
    });

    // DELETE request - Sell an item.
    app.delete('/api/v1/inventory/:itemIndex/sell', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        try {
            console.log('req.params=', req.params);
            const itemIndex = parseInt(req.params.itemIndex);
            console.log('itemIndex=', itemIndex);
            localInventoryManager.removeItemAsIndex(itemIndex);
            res.status(200).set(apiHeaders).send();
        }
        catch (err) {
            errorHandling(err, res);
        }

    });

    // POST request - Reset the item list.
    app.post('/api/v1/inventory/reset', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        localInventoryManager.restartInventory();
        res.status(200).set(apiHeaders).send();
    });   

    // GET request - Get Gossip
    app.get('/api/v1/inventory/gossip', (req, res, next)=>{
        // Data is not a promise as it is already stored locally.
        // No .then((data)=> {}) is necessary
        const gossip = localChatResponse.getRandomGossip();
        //console.log('getGossip - loading done gossip=', gossip);
        res.status(200).set(apiHeaders).send({gossip});
    });
};

// Provide public access to the desired functions
module.exports = {
    linkInventoryData : linkInventoryData,
    linkCharResponder : linkCharResponder,
    router: router
};
