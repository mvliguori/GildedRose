const csvjson = require('csvjson');
const fs = require('fs');

const inventoryfileorg = "inventory-org.csv";
const inventoryfile = "inventory.csv";
const csvoptions = {
	headers : "ItemName,ItemCategory,Sellin,Quality",
    delimiter : ',' , // optional
    quote     : '"' // optional
};

/*
1. Item Name
2. Item Category
3. Sell In
4. Quality
*/
const templateItemObject = { "ItemName" : "", "ItemCategory" : "", "Sellin" : 0, "Quality" : 0 };


// Array of objects
let inventory = [];


// Loads the inventory at startup
exports.uploadInventory = function()  {
   // Convert CSV to JSON object
   const inventory_file_data = fs.readFileSync(inventoryfile, { encoding : 'utf8'});
   inventory = csvjson.toObject(inventory_file_data, csvoptions);
   //console.log("inventory=", inventory);
}

// Shows the inventory
exports.showInventory = function()  {
   let strInventory = JSON.stringify(inventory, null, 2);
   //console.log("strInventory=", strInventory);
   strInventory = strInventory + '\n';
   return (strInventory);
}

// Shows the inventory
exports.showItem = function(line)  {
	let retVal = "I couldn't find the item:  " + line;
	let stopFlag = false;
	for ( let inc = 0; inc < inventory.length && !stopFlag; inc++ ) {
		//console.log("inventory[inc].ItemName=", inventory[inc].ItemName);
		if ( inventory[inc].ItemName === line ) {
			retVal = JSON.stringify(inventory[inc], null, 2) + '\n';
			stopFlag = true;
		}
	}
   return (retVal);
}

// Increment day and affect inventory
//1. All items have a SellIn value which denotes the number of days we have to sell the item
//2. All items have a Quality value which denotes how valuable the item is
//3. At the end of each day our system lowers both values for every item
// ADDITIONAL
//1. Once the sell by date has passed, Quality degrades twice as fast
//2. The Quality of an item is never negative
//3. "Aged Brie" actually increases in Quality the older it gets
//4. The Quality of an item is never more than 50
//5. "Sulfuras", being a legendary item, never has to be sold or decreases in Quality
//6. "Backstage passes", increases in Quality as it's SellIn value approaches; 
//  Quality increases by 2 when there are 10 days or less and by 3 when there are 5 days or less but Quality drops to 0 after the concert
//7. "Conjured" items degrade in Quality twice as fast as normal items
//8. An item can never have its Quality increase above 50, however "Sulfuras" is a legendary item and as such its Quality is 80 and it never alters.
exports.incrementDay = function()  {
   for ( let index = 0; index < inventory.length; index++ ) {
      if ( "Aged Brie" === inventory[index].ItemName && inventory[index].Quality < 50 && inventory[index].Sellin > 0 ) {
         inventory[index].Quality++;
      }
      else if ( "Sulfuras" === inventory[index].ItemCategory || "Gothrog" === inventory[index].ItemCategory ) {
         inventory[index].Quality = 80;
      }
      else if ( "Backstage Passes" === inventory[index].ItemCategory ) {

         if ( inventory[index].Sellin === 0 ) {
            inventory[index].Quality = 0;
         }
         else if ( inventory[index].Quality < 50 ) {
            if ( inventory[index].Sellin <= 5 && 
               inventory[index].Quality < 48 ) {
               inventory[index].Quality++;
               inventory[index].Quality++;
            }
            else if ( inventory[index].Sellin <= 10 && 
               inventory[index].Quality < 49 ) {
               inventory[index].Quality++;
            }
            inventory[index].Quality++;
         }
      }
      else if ( "Conjured" === inventory[index].ItemCategory ) {
         inventory[index].Quality = inventory[index].Quality  - 2;
      }
      else {
         if (inventory[index].Quality > 0 && inventory[index].Sellin === 0 ) {
            inventory[index].Quality = inventory[index].Quality - 2;
         }
         else if (inventory[index].Quality > 0 ) {
            inventory[index].Quality--;
         }
		 
      }
   
      if (inventory[index].Sellin > 0 && 
	     !( "Sulfuras" === inventory[index].ItemCategory || "Gothrog" === inventory[index].ItemCategory)) {
         inventory[index].Sellin--;
      }

   }
   const strInventory = JSON.stringify(inventory, null, 2);
   //console.log("strInventory=", strInventory);
   return (strInventory);
}

// Add Item to the inventory
exports.addItem = function(line)  {
   let retVal = false;
   try {
      const purchasedItem = csvjson.toObject(line, csvoptions); 
	  //console.log("purchasedItem=", purchasedItem);

      // Enable a deep copy
      const strTemplateInventory = JSON.stringify(templateItemObject, null, 2);
      let templateInventory = JSON.parse(strTemplateInventory);
      templateInventory.ItemName = purchasedItem[0].ItemName;
      templateInventory.ItemCategory = purchasedItem[0].ItemCategory;
      templateInventory.Sellin = parseInt(purchasedItem[0].Sellin);
      templateInventory.Quality = parseInt(purchasedItem[0].Quality);
      //console.log("templateInventory=", templateInventory);

      inventory[inventory.length] = templateInventory;
      retVal = true;
   }
   catch (err) {
      console.log("Item most likely not added - Error:", err);   
      console.log("Error: line input not a CSV format=", line);   
   }
   return (retVal);
}

// Add Item to the inventory when parameter is an object
exports.addItemAsObject = function(itemObj)  {
   let retVal = false;
   try {
      // Enable a deep copy
      const strTemplateInventory = JSON.stringify(itemObj, null, 2);
      let templateInventory = JSON.parse(strTemplateInventory);
      inventory[inventory.length] = templateInventory;
      retVal = true;
   }
   catch (err) {
      console.error("Item most likely not added - Error:", err);   
      console.error("Error: itemObj is not in the right format=", itemObj);   
   }
   return (retVal);
}

// Remove Item from the inventory by name
exports.removeItem = function(line)  {
   let retVal = false;
   for ( let index = 0; index < inventory.length && !retVal; index++ ) {
      if ( line === inventory[index].ItemName ) {
         inventory.splice(index, 1);
         retVal = true;
      }
   }
   return (retVal);
}

// Remove Item from the inventory by itemIndex
exports.removeItemAsIndex = function(itemIndex)  {
   let retVal = false;
   if ( -1 < itemIndex && itemIndex < inventory.length ) {
      inventory.splice(itemIndex, 1);
      retVal = true;
   }
   return (retVal);
}

// Shows the bad items in inventory
exports.showTrashInventory = function()  {
   // Compute a bad list.
   let trashItems = [];
   let incTrack = 0;
   for ( let inc = 0; inc < inventory.length; inc++ ) {
      if ( inventory[inc].Quality === 0 ) {
         trashItems[incTrack] = inventory[inc];
         incTrack++;
      }
   }
   const strInventory = JSON.stringify(trashItems, null, 2);
   //console.log("strInventory=", strInventory);
   return (strInventory);
}

// Restart the inventory at startup
exports.restartInventory = function()  {
   // Convert CSV to JSON object
   const inventory_file_data = fs.readFileSync(inventoryfileorg, { encoding : 'utf8'});
   inventory = inventory.splice(0,inventory.length); // Remove all elements in the array
   inventory = csvjson.toObject(inventory_file_data, csvoptions);
   //console.log("inventory restarted=", inventory);
}

// Loads the inventory at startup
exports.packUpInventory = function()  {
   // Convert JSON to CSV string
   //"ItemName" : "", "ItemCategory" : "", "Sellin" : 0, "Quality" : 0
   let inventory_file_data = "";
   for (let index = 0; index < inventory.length; index++ ) {
	   inventory_file_data = inventory_file_data + inventory[index].ItemName + "," + 
	      inventory[index].ItemCategory + "," + inventory[index].Sellin + "," +  inventory[index].Quality + '\n'; 
   }
   console.log("inventory_file_data=", inventory_file_data);

   fs.writeFileSync(inventoryfile, inventory_file_data, 'utf8', function(err) {
       if(err) {
           return console.error("packUpInventory failed to write, error:  " ,err);
       }
       console.log("The " + inventoryfile + "file was saved!");
   }); 
}


