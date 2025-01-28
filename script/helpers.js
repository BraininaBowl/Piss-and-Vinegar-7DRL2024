function runEvents() {
	if (events.length > 0) {
		events[0]();
		events.shift();
		runEvents();
	}
}

function deleteItem(itemid) {
	document.querySelectorAll(".mapcell_actor_" + itemid).forEach((cell) => {
		cell.remove();
	});
	map.content(actors[itemid].pos.x, actors[itemid].pos.y, false);
	delete actors[itemid];
}

function throwMolo(x, y) {
	let range = 2;
	let damage = 5;
	let hitsomething = false;
	if (player.molotov > 0) {
		player.molotov -= 1;
		actors.forEach((item) => {
			let steps = Math.abs(item.pos.x - x) + Math.abs(item.pos.y - y);
			if (steps <= range) {
				item.gotHit(damage);
				hitsomething = true;
			}
		});
		let steps = Math.abs(player.pos.x - x) + Math.abs(player.pos.y - y);
		if (steps <= range) {
			player.addhp(-damage);
		}
		if (hitsomething) {
			player.attacks(false, damage);
		}
	}
	switchModes();
	updatePlayer(false);
}

function setUpInteractionMenu(itemid, parent = false, dir = false) {
	let actions = [];
	let cancel = false;
	let actor;
	if (itemid == false || itemid == "pass") {
		let cell = map.readMap(target.x, target.y);
		if (cell.type == "floor") {
			actor = {};
			actor.name = "Floor";
			actor.pos = {};
			actor.pos.x = target.x;
			actor.pos.y = target.y;
			actor.type = "floor";
			actor.status = ["Empty floor"];
		} else if (cell.type == "wall") {
			actor = {};
			actor.name = "Wall";
			actor.pos = {};
			actor.pos.x = target.x;
			actor.pos.y = target.y;
			actor.type = "wall";
			actor.status = ["solid stone"];
		} else {
			cancel = true;
		}
	} else if (itemid == "player") {
		actor = player;
	} else {
		actor = actors[itemid];
	}

	if (cancel == false) {
		let deltax, deltay, steps;
		if (actor.id != "player") {
			deltax = Math.abs(actor.pos.x - player.pos.x);
			deltay = Math.abs(actor.pos.y - player.pos.y);
			steps = deltax + deltay;
		}

		if (actor.id == "player") {
		} else if (actor.name == "Lemmy") {
			let skillid = getRandomInt(skills.length - 1);
			let availableskill = skills[skillid];

			if (steps <= 1) {
				// short range
				actions = [
					{
						label: availableskill.name,
						desc: availableskill.desc,
						action:
							"skill_" +
							availableskill.id +
							" = true; skills.splice(" +
							skillid +
							",1);deleteItem('" +
							actor.id +
							"'); interactionMenu.close();",
					},
					{
						label: "Restore Piss",
						action: "player.addmp(player.maxmp); deleteItem('lemmy'); interactionMenu.close();",
						disabled: player.mp == player.maxmp ? true : false,
					},
					{
						label: "Restore Vin'",
						action: "player.addhp(player.maxhp); deleteItem('lemmy'); interactionMenu.close();",
						disabled: player.hp == player.maxhp ? true : false,
					},
				];
			}
		} else if (actor.name == "Stairs") {
			if (steps <= 1) {
				// short range
				actions = [
					{
						label: "Rush up",
						action: "level++; newLevel(false); interactionMenu.close();",
					},
				];
			}
		} else if (actor.type == "celldoor") {
			if (steps <= 1) {
				// short range
				actions = [
					{
						label: "Kick",
						action:
							"actors[" +
							actor.id +
							"].kicked(2,Math.ceil(player.mp/4)); player.attacks(" +
							actor.id +
							", Math.ceil(player.mp/4));interactionMenu.close();",
						disabled: player.mp >= 1 ? false : true,
					},
				];
			}
		} else if (actor.type == "floor") {
			if (steps <= 1) {
				// short range
				actions = [
					{
						label: "Throw 'tov",
						action: "throwMolo(" + actor.pos.x + ", " + actor.pos.y + "); interactionMenu.close();",
						disabled: player.molotov > 0 && player.sees(actor.pos.x, actor.pos.y, true) ? false : true,
					},
				];
			} else {
				// long range
				actions = [
					{
						label: "rush",
						action:
							"map.content(player.pos.x, player.pos.y, false); map.content(" +
							actor.pos.x +
							", " +
							actor.pos.y +
							", 'player'); player.pos.x=" +
							actor.pos.x +
							";player.pos.y=" +
							actor.pos.y +
							";player.addmp(" +
							steps * -1 +
							");updatePlayer(false);interactionMenu.close();",
						disabled: player.mp >= steps && player.sees(actor.pos.x, actor.pos.y, true) ? false : true,
					},
					{
						label: "Throw 'tov",
						action: "throwMolo(" + actor.pos.x + ", " + actor.pos.y + "); interactionMenu.close();",
						disabled: player.molotov > 0 && player.sees(actor.pos.x, actor.pos.y, true) ? false : true,
					},
				];
			}
		} else if (actor.type == "wall") {
		} else if (actor.type == "bystander") {
			if (steps <= 1) {
				// short range
				actions = [
					{
						label: "Move",
						action: "player.move(" + dir + ",true);interactionMenu.close();",
					},
				];
			}
		} else if (actor.type == "item") {
			if (actor.subtype == "drink") {
				if (steps <= 1) {
					// short range
					actions = [
						{
							label: "Chug",
							action: "player.drink(" + actor.id + ");interactionMenu.close();",
						},
						{
							label: "Kick",
							action:
								"actors[" +
								actor.id +
								"].kicked(2,Math.ceil(player.mp/4)); player.attacks(" +
								actor.id +
								", Math.ceil(player.mp/4));interactionMenu.close();",
							disabled: player.mp >= 1 ? false : true,
						},
						{
							label: "Tackle",
							action:
								"actors[" +
								actor.id +
								"].tackled(3, 1); player.attacks(" +
								actor.id +
								",1);interactionMenu.close();",
							disabled: player.mp >= 2 ? false : true,
						},
						{
							label: "Move",
							action: "player.move(" + dir + ",true);interactionMenu.close();",
						},
						{
							label: "Molotov",
							action: "player.molotov += 1; deleteItem(" + actor.id + ");interactionMenu.close();",
							disabled: player.molotov < 2 ? false : true,
						},
					];
				}
			} else {
				if (steps <= 1) {
					// short range
					actions = [
						{
							label: "Take",
							action:
								"player.addItem(actors[" +
								actor.id +
								"], true);updatePlayer(false);interactionMenu.close();",
						},
						{
							label: "Kick",
							action:
								"actors[" +
								actor.id +
								"].kicked(2,Math.ceil(player.mp/4)); player.attacks(" +
								actor.id +
								", Math.ceil(player.mp/4));interactionMenu.close();",
							disabled: player.mp >= 1 ? false : true,
						},
						{
							label: "Tackle",
							action:
								"actors[" +
								actor.id +
								"].tackled(3, 1); player.attacks(" +
								actor.id +
								",1);interactionMenu.close();",
							disabled: player.mp >= 2 ? false : true,
						},
						{
							label: "Move",
							action: "player.move(" + dir + ",true);interactionMenu.close();",
						},
					];
				}
			}
		} else {
			if (steps <= 1) {
				// short range
				let action,
					label,
					skill_adds = "";
				if (skill_3) {
					if (getRandomInt(10) < 6) {
						skill_adds += "actors[" + actor.id + "].fling(" + dir + ", 1);";
					}
				}
				if (skill_4) {
					if (getRandomInt(10) < 6) {
						skill_adds += "actors[" + actor.id + "].skipturn(3);";
					}
				}
				if (player.inventory.length > 0) {
					label = player.inventory[0].verbs[getRandomInt(player.inventory[0].verbs.length - 1)];
					action =
						"actors[" +
						actor.id +
						"].gotHit(player.inventory[0].melee);" +
						skill_adds +
						"player.addmp(1); player.attacks(" +
						actor.id +
						",player.inventory[0].melee);interactionMenu.close();";
				} else {
					label = "punch";
					action =
						"actors[" +
						actor.id +
						"].gotHit(2);" +
						skill_adds +
						"player.addmp(1); player.attacks(" +
						actor.id +
						",2);interactionMenu.close();";
				}
				actions = [
					{
						label: label,
						action: action,
					},
					{
						label: "Kick",
						action:
							"actors[" +
							actor.id +
							"].kicked(2,Math.ceil(player.mp/4)); player.attacks(" +
							actor.id +
							", Math.ceil(player.mp/4));interactionMenu.close();",
						disabled: player.mp >= 1 ? false : true,
					},
					{
						label: "Tackle",
						action:
							"actors[" +
							actor.id +
							"].tackled(3, 1); player.attacks(" +
							actor.id +
							", 1);interactionMenu.close();",
						disabled: player.mp >= 2 ? false : true,
					},
				];
			} else {
				actions = [
					{
						label: "Throw",
						action:
							player.inventory.length > 0
								? "switchModes(); actors[" +
								  actor.id +
								  "].gotHit(" +
								  player.inventory[0].range +
								  ");player.inventory.shift(1); updatePlayer(false); actors[" +
								  actor.id +
								  "].skip += " +
								  player.inventory[0].stun +
								  "; player.attacks(" +
								  actor.id +
								  ", " +
								  player.inventory[0].range +
								  "); interactionMenu.close();"
								: false,
						disabled:
							player.sees(actor.pos.x, actor.pos.y, true) && player.inventory.length > 0 ? false : true,
					},
				];
			}
		}
		interactionMenu = drawInteractionMenu(actor, actions);
	}
}

function moveTarget(x, y) {
	target.x = x;
	target.y = y;
	let spin;
	if (map.content(x, y) && map.content(x, y) != "player" && map.content(x, y) != "pass") {
		spin = true;
	} else {
		spin = false;
	}
	document.querySelectorAll(".interfacelayer .target").forEach((item) => {
		item.style.left = options.cellsize * target.x + "px";
		item.style.top = options.cellsize * target.y + "px";
		if (spin) {
			item.innerHTML = "&otimes;";
		} else {
			item.innerHTML = "&oplus;";
		}
	});
}

function switchModes() {
	targeting = !targeting;
	if (targeting) {
		document.querySelectorAll(".helpbar .target").forEach((item) => {
			item.innerHTML = "<span>[T]</span><span>Move mode</span>";
		});
		document.querySelectorAll(".interfacelayer .target").forEach((item) => {
			item.style.display = "block";
		});
	} else {
		document.querySelectorAll(".helpbar .target").forEach((item) => {
			item.innerHTML = "<span>[T]</span><span>Target mode</span>";
		});
		document.querySelectorAll(".interfacelayer .target").forEach((item) => {
			item.style.display = "none";
		});
	}
}

function getRoomsForPoint(x, y, map, fuzzy = 0) {
	//'use strict';
	let rooms = [];
	map.rooms.forEach((room) => {
		if (
			x >= room.x - fuzzy &&
			x <= room.x + room.w + fuzzy &&
			y >= room.y - fuzzy &&
			y <= room.y + room.h + fuzzy
		) {
			rooms.push("room_" + room.id);
		}
	});

	map.hallways.forEach((hallway) => {
		if (
			x >= hallway.x - fuzzy &&
			x <= hallway.x + hallway.w + fuzzy &&
			y >= hallway.y - fuzzy &&
			y <= hallway.y + hallway.h + fuzzy
		) {
			rooms.push("hallway_" + hallway.id);
		}
	});
	return rooms;
}

function lineOfSight(x1, y1, x2, y2, usecover = false) {
	const points = bresenham(x1, y1, x2, y2);
	let result = true;
	points.forEach((item) => {
		let square = map.readMap(item.x, item.y);
		if (square == undefined || square.passable == false) {
			result = false;
		}
		if (
			usecover &&
			!(item.x == x1 && item.y == y1) &&
			!(item.x == x2 && item.y == y2) &&
			map.content(item.x, item.y) != false &&
			map.content(item.x, item.y) != "pass" &&
			map.content(item.x, item.y) != "player"
		) {
			result = false;
		}
	});
	return result;
}

function cloneTable(data) {
	"use strict";
	return JSON.parse(JSON.stringify(data));
}

function status(data) {
	let object = cloneTable(data);
	for (k of Object.keys(object)) {
		this[k] = object[k];
	}
	statuses[data.id] = this;
}

function getDir(x1, y1, x2, y2) {
	if (y1 > y2) {
		return 0;
	} else if (x1 < x2) {
		return 1;
	} else if (y1 < y2) {
		return 2;
	} else if (x1 > x2) {
		return 3;
	}
}
/*
function removeItem(data, amount = "all") {
	let item;
	if (data.id) {
		item = data;
	} else {
		item = items[data];
	}

	if (!this.inventory[item.id]) {
	} else if (!this.inventory[item.id].amount) {
		delete this.inventory[item.id];
	} else if (amount != "all") {
		this.inventory[item.id].amount -= amount;
	} else if (amount == "all") {
		delete this.inventory[item.id];
	}
}

function addItem(data, amount = 1, log = false) {
	let item;
	if (data.id) {
		item = data;
	} else {
		item = items[data];
	}
	let sentence = "";
	let newitem = false;
	if (!this.inventory[item.id]) {
		this.inventory[item.id] = new Array();
		newitem = true;
	} else if (this.inventory[item.id].amount < 1) {
		newitem = true;
	}

	if (!item.amount) {
		item.amount = 1;
	}
	if (amount == "all") {
		amount = item.amount;
	}
	for (i = 0; i < amount; i++) {
		if (this.inventory[item.id].amount) {
			this.inventory[item.id].amount++;
		} else {
			this.inventory[item.id] = cloneTable(item);
		}
	}
	if (item.inventory) {
		this.inventory[item.id].addItem = addItem;
		this.inventory[item.id].removeItem = removeItem;
	}

	if (log) {
		if (this == player) {
			sentence += "you";
		} else {
			sentence += describeActor(this);
		}
	}

	if (log) {
		if (this == player) {
			sentence += " grab ";
		} else {
			sentence += " grabs ";
		}
		sentence += drawItemName(data, "player").slice(0, -1) + ". ";
		addLog(capitalize(sentence));
	}
}

function addLog(text) {
	//remove past animations
	let animatedlogs = document.getElementsByClassName("log pulse");
	while (animatedlogs.length > 0) {
		animatedlogs[0].classList.remove("pulse");
	}

	//is the log scrolled all the way down?
	let el = document.getElementById("log");
	let scroll = el.scrollHeight - el.scrollTop - el.clientHeight < 1;

	//write to log
	document.getElementById("log").innerHTML += "<div class='list log pulse sentence'><span>" + text + "</span></div>";

	//scrool down if needed
	if (scroll) {
		el.scroll({
			top: el.scrollHeight,
			behavior: "smooth",
		});
	}
}
*/
function capitalize(sentence) {
	return sentence.substring(0, 1).toUpperCase() + sentence.substring(1);
}

function numtotext(num) {
	let numbers = [
		"zero",
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine",
		"ten",
		"eleven",
		"twelve",
		"thirteen",
		"fourteen",
		"fifteen",
		"sixteen",
		"seventeen",
		"eighteen",
		"nineteen",
		"twenty",
	];
	if (num <= 20) {
		return numbers[num];
	} else {
		return num;
	}
}

function suffix(number) {
	let tenths = number % 10,
		hundreds = number % 100;
	if (tenths == 1 && hundreds != 11) {
		return number + "st";
	}
	if (tenths == 2 && hundreds != 12) {
		return number + "nd";
	}
	if (tenths == 3 && hundreds != 13) {
		return number + "rd";
	}
	return number + "th";
}

function getRandomInt(max) {
	return Math.floor(Math.random() * (max + 1));
}

const removeDuplicates = (arr) => [...new Set(arr)];

function limit(val, min, max) {
	if (val < min) {
		return min;
	} else if (val > max) {
		return max;
	} else {
		return val;
	}
}

function execute(code) {
	setTimeout(code, 0);
}

function wrap(val, min, max) {
	while (val < min) {
		val += max;
	}
	while (val > max) {
		val -= max;
	}
	return val;
}

function dijkstra(source_x, source_y, dest_x, dest_y) {
	let queue = [];
	let dijkstramap = {};
	item = {
		x: dest_x,
		y: dest_y,
		val: 0,
	};
	queue.push(item);

	function testItem(x, y, val) {
		if (map.passable(x, y)) {
			if (dijkstramap[x]) {
				if (dijkstramap[x][y]) {
					if (dijkstramap[x][y] > val) {
						dijkstramap[x][y] = val;
						item = {
							x: x,
							y: y,
							val: val,
						};
						queue.push(item);
					}
				} else {
					dijkstramap[x][y] = val + 1;
					item = {
						x: x,
						y: y,
						val: val,
					};
					queue.push(item);
				}
			} else {
				dijkstramap[x] = {};
				dijkstramap[x][y] = val + 1;
				item = {
					x: x,
					y: y,
					val: val,
				};
				queue.push(item);
			}
		}
	}
	function readDijkstra(x, y) {
		if (dijkstramap[x]) {
			if (dijkstramap[x][y]) {
				return dijkstramap[x][y];
			} else {
				return 999999999;
			}
		} else {
			return 999999999;
		}
	}
	function compareByVal(a, b) {
		return a.val - b.val;
	}

	while (queue.length > 0) {
		let current = queue.shift();
		if (source_x == current.x && source_y == current.y) {
			// target reached
		} else {
			testItem(current.x - 1, current.y, current.val + 1);
			testItem(current.x + 1, current.y, current.val + 1);
			testItem(current.x, current.y - 1, current.val + 1);
			testItem(current.x, current.y + 1, current.val + 1);
		}
	}

	// sort results
	let results = [
		{
			dir: 0,
			val: readDijkstra(source_x, source_y - 1),
		},
		{
			dir: 1,
			val: readDijkstra(source_x + 1, source_y),
		},
		{
			dir: 2,
			val: readDijkstra(source_x, source_y + 1),
		},
		{
			dir: 3,
			val: readDijkstra(source_x - 1, source_y),
		},
	];

	results.sort(compareByVal);
	return results[0].dir;
}

function closestEmpty(actor) {
	//const index = x + y * map.width;
	// x + y * map.width

	let source_x = actor.pos.x;
	let source_y = actor.pos.y;
	let queue = [];
	let dijkstramap = {};
	item = {
		x: source_x,
		y: source_y,
		val: 0,
	};
	queue.push(item);

	function testItem(x, y, val) {
		if (map.readMap(x, y) && map.readMap(x, y).passable) {
			const index = x + y * map.width;
			if (dijkstramap[index]) {
				if (dijkstramap[index].val > val) {
					dijkstramap[index] = { x: x, y: y, val: val };
					item = {
						x: x,
						y: y,
						val: val + 1,
					};
					queue.push(item);
				}
			} else {
				dijkstramap[index] = { x: x, y: y, val: val + 1 };
				item = {
					x: x,
					y: y,
					val: val + 1,
				};
				queue.push(item);
			}
		}
	}
	function readDijkstra(x, y) {
		const index = x + y * map.width;
		if (dijkstramap[index]) {
			return dijkstramap[index];
		} else {
			return 999999999;
		}
	}

	let results = [];
	while (queue.length > 0) {
		let current = queue.shift();
		if (map.content(current.x, current.y) == false || map.content(current.x, current.y) == "pass") {
			// target reached
			results.push(readDijkstra(current.x, current.y));
		} else {
			testItem(current.x - 1, current.y, current.val + 1);
			testItem(current.x + 1, current.y, current.val + 1);
			testItem(current.x, current.y - 1, current.val + 1);
			testItem(current.x, current.y + 1, current.val + 1);
		}
	}

	// sort results

	function compareByVal(a, b) {
		return a.val - b.val;
	}

	if (results.length > 0) {
		results.sort(compareByVal);
		return results[0];
	}
}

function bresenham(x0, y0, x1, y1) {
	let points = [];
	let deltax = x1 - x0;
	let deltay = y1 - y0;
	let stepx = Math.sign(deltax);
	let stepy = Math.sign(deltay);
	deltax = Math.abs(deltax);
	deltay = Math.abs(deltay);

	let diff = deltax - deltay;

	while (true) {
		if (x0 === x1 && y0 === y1) {
			break;
		}

		points.push({ x: x0, y: y0 });

		let nextstep = 2 * diff;

		if (nextstep > -deltay) {
			diff -= deltay;
			x0 += stepx;
		}

		if (nextstep < deltax) {
			diff += deltax;
			y0 += stepy;
		}
	}

	return points;
}

function makeName() {
	if (firstnames.length < 1) {
		firstnames = cloneTable(base_firstnames);
	}
	if (lastnames.length < 1) {
		lastnames = cloneTable(base_lastnames);
	}
	let firstname = firstnames.splice(getRandomInt(firstnames.length - 1), 1);
	let lastname = lastnames.splice(getRandomInt(lastnames.length - 1), 1);
	return firstname + " " + lastname;
}

function makeDrink() {
	if (drink_1.length < 1) {
		drink_1 = cloneTable(base_drink_1);
	}
	if (drink_2.length < 1) {
		drink_2 = cloneTable(base_drink_2);
	}
	if (drink_3.length < 1) {
		drink_3 = cloneTable(base_drink_3);
	}
	let part1 = drink_1.splice(getRandomInt(drink_1.length - 1), 1);
	let part2 = drink_2.splice(getRandomInt(drink_2.length - 1), 1);
	let part3 = drink_3.splice(getRandomInt(drink_3.length - 1), 1);
	return part1 + part2 + part3;
}

function makeFace() {
	if (port_1.length < 1) {
		port_1 = cloneTable(base_port_1);
	}
	if (port_2.length < 1) {
		port_2 = cloneTable(base_port_2);
	}
	if (port_3.length < 1) {
		port_3 = cloneTable(base_port_3);
	}
	if (port_4.length < 1) {
		port_4 = cloneTable(base_port_4);
	}
	if (port_5.length < 1) {
		port_5 = cloneTable(base_port_5);
	}
	return [
		port_1.splice(getRandomInt(port_1.length - 1), 1),
		port_2.splice(getRandomInt(port_2.length - 1), 1),
		port_3.splice(getRandomInt(port_3.length - 1), 1),
		port_4.splice(getRandomInt(port_4.length - 1), 1),
		port_5.splice(getRandomInt(port_5.length - 1), 1),
	];
}

function fillBuckets() {
	base_firstnames = [
		"Jeff",
		"Bor",
		"Joan",
		"Lex",
		"Jimmy",
		"Lester",
		"Brock",
		"Lefty",
		"Rowan",
		"Paddy",
		"Lizzie",
		"Borden",
		"Bob",
		"Lars",
		"Flit",
		"Zoe",
		"Chloe",
		"Eddie",
		"Zit",
		"Ross",
		"Autumn",
		"Sprig",
		"Lob",
		"Fizz",
		"Shawn",
		"Unlucky",
		"Moss",
		"Sling",
		"Fox",
		"Doc",
		"Missy",
		"Rose",
		"Wurst",
		"Horst",
		"Gunter",
		"Razzie",
		"Cozy",
		"Igg",
		"Pops",
		"Randy",
		"Fingers",
		"Button",
		"Licks",
		"Steff",
		"Frog",
		"Rat",
		"Weasel",
		"Thirsty",
		"Hungry",
		"Bad",
		"Shifty",
		"So",
		"Other",
		"Rot",
		"Lead",
		"Salt",
		"Torn",
		"Swampy",
		"Cracked",
	];
	base_lastnames = [
		"Lowe",
		"Cross",
		"Donovan",
		"Goldbean",
		"Rift",
		"Irons",
		"Mist",
		"Rain",
		"Payne",
		"Post",
		"Williams",
		"Mess",
		"Broth",
		"Basher",
		"Smasher",
		"Frost",
		"Heat",
		"Longtom",
		"Stark",
		"Winter",
		"Fall",
		"Loss",
		"Bubbles",
		"Mid",
		"Burn",
		"Kobold",
		"Troll",
		"Stardust",
		"Mass",
		"Belly",
		"Jelly",
		"Crush",
		"Manbun",
		"Hogg",
		"Love",
		"Gourd",
		"Zachs",
		"Sock",
		"Goblin",
		"Pony",
		"Wurm",
		"Badger",
		"Boar",
		"Cat",
		"Deva",
		"Ettin",
		"Gnoll",
		"Carrot",
		"Lung",
		"Liver",
		"Sugar",
		"Nose",
		"Jo",
		"Smith",
		"Smith",
		"Savage",
		"Smith",
		"Smith",
		"Smith",
		"Munroe",
		"Thing",
	];
	base_drink_1 = ["Smar", "Grand", "Mac", "Glen", "Mort", "Storm", "A", "Shi", "Sir", "Ro", "Ack", "Rot", "Mon"];
	base_drink_2 = [
		"logg",
		"bar",
		"choi",
		"les",
		"niv",
		"reck",
		"locc",
		"fer",
		"ber",
		"sho",
		"koch",
		"ould",
		"das",
		"shin",
		"glan",
	];
	base_drink_3 = ["er", " Ice", " Gold", " Rock", "loch", "ic", "u", "ov", "os", "hai", "ut", "inth", "ia"];

	base_port_1 = [
		[" ", " ", " ", " ", " ", "^", ".", ".", "^", " "],
		[" ", " ", " ", " ", ".", "^", "~", "√", "\\", " "],
		[" ", " ", " ", " ", ".", "|", "\\", "|", "\\", "_"],
		[" ", " ", " ", " ", " ", " ", "\\", "|", "\\", "."],
	];
	base_port_2 = [
		[" ", " ", " ", " ", "/", "0", "0", "-", "]", "\\"],
		[" ", " ", " ", " ", "{", "*", "©", " ", "]", "\\"],
		[" ", " ", " ", " ", "|", "©", " ", "X", "|", " "],
		[" ", " ", " ", " ", "|", "ಠ", " ", "ಠ", " ", "╮"],
		[" ", " ", " ", " ", " ", "}", "ಠ", "ಠ", " ", "]"],
		[" ", " ", " ", " ", " ", "|", "ಠ", "0", " ", "╮"],
	];
	base_port_3 = [
		["{", "°", "°", "}", "}", ")", "^", " ", " ", "|"],
		["╭", ".", ".", "╮", "╮", "/", "╮", " ", " ", "|"],
		["[", "o", "o", "]", " ", ")", "\\", " ", " ", "|"],
		["[", "o", " ", "O", "\\", "|", "\\", " ", " ", "|"],
		["(", "∞", ")", ")", "'", " ", " ", " ", " ", "("],
	];
	base_port_4 = [
		[" ", "\\", ".", "_", " ", " ", "'", "-", " ", "/"],
		[" ", " ", "=", "=", "=", "=", "-", "-", "✓", "\\"],
		[" ", " ", "~", "-", "-", "-", "-", "]", " ", ")"],
		[" ", " ", "+", "+", "+", " ", "|", " ", "?", "|"],
	];
	base_port_5 = [
		[" ", " ", " ", "|", "[", "V", "]", "|", " ", "\\"],
		[" ", " ", " ", "|", "[", "+", "]", "]", " ", "\\"],
		[" ", " ", "/", " ", "-", "-", "-", "\\", "\\", "\\"],
		[" ", " ", " ", "╭", "/", " ", " ", "\\", " ", "╮"],
		[" ", " ", " ", "╭", "|", " ", " ", "\\", " ", "╮"],
	];
}
