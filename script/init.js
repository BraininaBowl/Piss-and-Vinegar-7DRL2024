let actors = new Array();
let events = new Array();
let base_firstnames = [],
	base_lastnames = [],
	base_drink_1 = [],
	base_drink_2 = [],
	base_drink_3 = [],
	base_port_1 = [],
	base_port_2 = [],
	base_port_3 = [],
	base_port_4 = [],
	base_port_5 = [],
	firstnames = [],
	lastnames = [],
	drink_1 = [],
	drink_2 = [],
	drink_3 = [],
	port_1 = [],
	port_2 = [],
	port_3 = [],
	port_4 = [],
	port_5 = [];
fillBuckets();
let level = 0;
let interactionMenu;
let targeting = false;
let club = false;
let violence = false;
let skill_1 = false,
	skill_2 = false,
	skill_3 = false,
	skill_4 = false,
	skill_5 = false;
let skills = [
	{ id: 1, name: "Bloodborne", desc: "When you hit an enemy, you recover the last damage you received last turn." },
	{ id: 2, name: "Stonewall", desc: "Reduce incomming damage." },
	{ id: 3, name: "Heavy swings", desc: "Regular attacks may knock the target back." },
	{ id: 4, name: "Connection", desc: "Regular attacks may stun the target." },
	{ id: 5, name: "On vapors", desc: "You only die when out of Piss and Vinegar." },
];

// 1 _ Bloodborne: Restore last health lost last turn
// 2 _ Stonewall: Reduce incomming damage
// 3 _ Heavy swings: Regular attacks have a chance to knock back
// 4 _ Deep connection: Regular attacks have a chance to stun
// 5 _ Enduring rage: You only die when out of piss and Vinegar

// OPTIONS
let options = {};
options.crt = false;
options.cellsize = 18;

document.body.style.fontSize = options.cellsize - 4;
document.body.style.lineHeight = options.cellsize + "px";

createScreen();

//generate map
let map = makeMap(56, 56),
	mapdisplay,
	screenContent,
	playerturn,
	mode,
	player,
	target;

drawTitleScreen();
