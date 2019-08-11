// Allison's verbal responses

const introduction = `Hi and welcome to the Gilded Rose. Welcome to our small inn within our prominent city.
   I am Allison. We buy and sell only the finest goods.`;

// 15 gossip drama sayings 
const drama = [ "Beware of Leeroy Jenkins.  He isn't a team player",
   "Orcs seem to buy the most potions.",
   "I heard that a dragon stole a dwarvens king gold and kingdom.  And sits on top of a huge pile of dwarvens gold, valuables and relics.",
   "Did you know that the king came by my shop last month and said I was sweet?  I sure hope he comes by again soon.",
   "I heard the king pulled his sword from a stone",
   "The best healing potion to buy is Gothrog's flesh rejuvenation, you will see the hole in you regenerate by placing it around the wound",
   "The bad thing about Gothrog's flesh rejuvenation potion where to you get these ingredients: Phoenix fire, elder vampire blood, Jelly from Gothrog's Ooze Monster, Ender Apple Cider vinegar", 
   "Serious Gothrog where and how do you get a Phoenix, elder vampires are over 1000 years old, and you literally created your own ooze monster",
   "I heard to create Gothrog's ooze monster he pulls the essence of life from a gaint acidic toad tadpole and puts it in an oozing soul stone",
   "I heard that Gothrog's ooze monsters are spell summoned into battles",
   "I heard the dark shogans and ether demegorgons are hunting Gothrog for his inifinty kane spear, the spear is a jeweled relic from the civilation before the demon wars",
   "The only reason Gothrog's healing potions are even around is because he left 100s chests full of them on the during the last battle of the Rose War",
   "The different kingdoms, guilds, mercs and heros took Gothrog's health potion chests during the last battle of the Rose War",
   "No one has seen Gothrog since the last Rose battle.  Probably better that way as he is cheered by many, but hated by just as much.",
   "I'm only a 1377 years old elf, a little flightly and I care to gossip about what I want",
   "Sulfuras was assassinated by the dark shogans through a trap planned out by the demegorgons"   ]

const instructions = `Type the number of the following option`;

const menu = [ "0. Tell me some local gossip",
   "1. Ask for the entire list of inventory",
	"2. Ask for the details of a single item by name",
	"3. Progress to the next day",
	"4. List of trash we should throw away (Quality = 0)",
	"5. Patron Buys",
	"6. Patron Sells",
    "7. Restart inventory (From orginal)",
    "8. Stop going to the store(end program)" ]

const seeYouTomorrow = `I'll see you tomorrow'\n''\n'`; 

function randomIntFromInterval(min,max) { // min and max included
    return Math.floor(Math.random()*(max-min+1)+min);
}

exports.getIntroduction = function()  {
   return (introduction);
}

exports.getRandomGossip = function()  {
   const randomSelection = randomIntFromInterval(0,drama.length-1);
   return (drama[randomSelection]);
}

exports.displayMenuOptions = function()  {
   let retVal = instructions + '\n';
   for ( let index = 0; index < menu.length; index++ ) {
      retVal =  retVal + menu[index] + '\n';
   }
   retVal =  retVal + '\n';
   return (retVal);
}

exports.displayShowInfo = function()  {
   const retVal = `Enter in the exact item name to see:  `;
   return (retVal);
}

exports.displayStoreBuysInfo = function()  {
   const retVal = `In csv form enter the item name, category, selling time (integer), quality(integer)
      (example: Roast Rat Burgers,Food,7,14):  `;
   return (retVal);
}

exports.displayStoreSellsInfo = function()  {
   const retVal = `Enter in the exact item name to purchase:  `;
   return (retVal);
}

exports.patronBoughtDisplayMenuOptions = function(line)  {
   let retVal = `Patron, you bought the item:  ${line}'\n''\n'instructions'\n'`;
   for ( let index = 0; index < menu.length; index++ ) {
      retVal =  `${retVal}${menu[index]}'\n'`;
   }
   retVal = retVal + seeYouTomorrow;
   return (retVal);
}

exports.patronSoldDisplayMenuOptions = function(line)  {
   let retVal = `Patron, you sold the item:  ${line}'\n''\n'${instructions}'\n'`;
   for ( let index = 0; index < menu.length; index++ ) {
      retVal =  `${retVal}${menu[index]}'\n'`;
   }
   retVal = retVal + seeYouTomorrow;
   return (retVal);
}


exports.warningDisplayMenuOptions = function()  {
   let retVal = `You didn't select a menu item.'\n''\n'${instructions}'\n'`;
   for ( let index = 0; index < menu.length; index++ ) {
      retVal =  `${retVal}${menu[index]}'\n'`;
   }
   return (retVal);
}

exports.errorDisplayMenuOptions = function()  {
   let retVal = `That didn't work try again.'\n''\n'${instructions}'\n'`;
   for ( let index = 0; index < menu.length; index++ ) {
      retVal =  `${retVal}${menu[index]}'\n'`;
   }
   return (retVal);
}
