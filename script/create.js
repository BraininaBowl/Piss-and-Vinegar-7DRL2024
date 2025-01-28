function newLevel(reset = false) {
	if (reset) {
		player = new actor("player", 10, 10, "player", "@", map);
		target = {
			x: player.pos.x,
			y: player.pos.y,
		};
		level = 0;
	}
	actors = [];
	map = [];
	document.querySelectorAll(".mainscreen").forEach((item) => {
		item.remove();
	});
	document.querySelectorAll(".titlebg").forEach((item) => {
		item.remove();
	});

	document.querySelector("#cylinder").classList.remove("turn-on");
	map = makeMap(56, 56);
	populateMap(map);
	// create div with rendered map
	mapdisplay = renderMap(map);
	//build interface
	screenContent = buildScreen();

	playerturn = true;
	mode = 0;

	draw();
	document.querySelector("#cylinder").classList.add("turn-on");
	updatePlayer(false);
	enemyTurn(false);
}

function makeMap(width, height) {
	this.width = width;
	this.height = height;
	this.map = {};
	this.rooms = [];
	this.hallways = [];
	this.status = function (x, y, value = "dontchange") {
		const index = x + y * this.width;
		// update on map array
		if (value != "dontchange") {
			if (!this.map[index]) {
				this.map[index] = {};
			}
			this.map[index].status = value;
		}
		if (this.map[index] && this.map[index].status) {
			return this.map[index].status;
		} else {
			return false;
		}
	};
	this.paintCell = function (x, y, color) {
		let val = this.readMap(x, y);
		val.paint = color;
		this.writeMap(x, y, val);
		document.querySelectorAll(".cell_" + x + "_" + y).forEach((item) => {
			item.classList.add("paint_" + color);
		});
	};
	this.passable = function (x, y, includeActors = false) {
		if (this.readMap(x, y) && this.readMap(x, y).passable && this.readMap(x, y).passable == true) {
			if (includeActors) {
				if (this.content(x, y) == false || this.content(x, y) == undefined || this.content(x, y) == "pass") {
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		} else {
			return false;
		}
	};
	this.hideCell = function (x, y) {
		// set item invisible
		const index = x + y * this.width;
		// update on map array
		if (this.map[index]) {
			this.map[index].visible = false;
		}
		// update in map div
		let cells = document.getElementsByClassName("cell_" + x + "_" + y);
		if (cells.length > 0) {
			for (i = 0; i < cells.length; i++) {
				cells[i].classList.remove("lit");
			}
		}
	};
	this.readMap = function (x, y) {
		return this.map[x + y * this.width];
	};
	this.writeMap = function (x, y, val) {
		const index = x + y * this.width;
		if (this.map[index] && this.map[index].id) {
			this.map[index].id.forEach((item) => val.id.add(item));
		}
		this.map[index] = val;
	};
	this.content = function (x, y, value = "dontchange") {
		// set item visible
		const index = x + y * this.width;
		// update on map array
		if (value != "dontchange") {
			if (!this.map[index]) {
				this.map[index] = {};
			}
			this.map[index].content = value;
		}
		if (this.map[index] && this.map[index].content) {
			return this.map[index].content;
		} else {
			return false;
		}
	};
	this.makeFloor = function (x, y, id, color = "dark", bgcolor = "aqua") {
		value = {};
		value.color = color;
		value.bgcolor = bgcolor;
		value.symbol = "";
		value.type = "floor";
		value.passable = true;
		value.grow = -1;
		value.seen = false;
		value.id = new Set([id]);
		value.content = false;
		this.writeMap(x, y, value);
	};
	this.makeWall = function (x, y, id, color = "yellow", bgcolor = "none") {
		if (this.readMap(x, y) == null || this.readMap(x, y) == undefined || this.readMap(x, y).type == "wall") {
			value = {};
			value.color = color;
			value.bgcolor = bgcolor;
			value.passable = false;
			value.seen = false;
			value.type = "wall";
			value.grow = 0;
			value.id = new Set([id]);

			let top,
				bottom,
				left,
				right,
				symbol = false;

			// check floors
			if (this.readMap(x, y - 1) && this.readMap(x, y - 1).type == "floor") {
				top = true;
			} else {
				top = false;
			}
			if (this.readMap(x, y + 1) && this.readMap(x, y + 1).type == "floor") {
				bottom = true;
			} else {
				bottom = false;
			}
			if (this.readMap(x - 1, y) && this.readMap(x - 1, y).type == "floor") {
				left = true;
			} else {
				left = false;
			}
			if (this.readMap(x + 1, y) && this.readMap(x + 1, y).type == "floor") {
				right = true;
			} else {
				right = false;
			}

			if (top && bottom && left && right) {
				value.symbol = "&curren;";
			} else if (left && right) {
				value.symbol = "&boxV;";
			} else if (top || bottom) {
				value.symbol = "&boxH;&boxH;";
			} else if (left || right) {
				value.symbol = "&boxV;";
			}

			this.writeMap(x, y, value);

			// Check walls
			if (this.readMap(x, y - 1) && this.readMap(x, y - 1).type == "wall") {
				top = true;
			} else {
				top = false;
			}
			if (this.readMap(x, y + 1) && this.readMap(x, y + 1).type == "wall") {
				bottom = true;
			} else {
				bottom = false;
			}
			if (this.readMap(x - 1, y) && this.readMap(x - 1, y).type == "wall") {
				left = true;
			} else {
				left = false;
			}
			if (this.readMap(x + 1, y) && this.readMap(x + 1, y).type == "wall") {
				right = true;
			} else {
				right = false;
			}

			if (top && bottom && left && right) {
				value.symbol = "&boxVH;";
			} else if (top && left && right) {
				value.symbol = "&boxHU;";
			} else if (bottom && left && right) {
				value.symbol = "&boxHD;";
			} else if (top && bottom && left) {
				value.symbol = "&boxVL;";
			} else if (top && bottom && right) {
				value.symbol = "&boxVR;";
			} else if (bottom && left) {
				value.symbol = "&boxDL;";
			} else if (bottom && right) {
				value.symbol = "&boxDR;";
			} else if (top && left) {
				value.symbol = "&boxUL;";
			} else if (top && right) {
				value.symbol = "&boxUR;";
			} else {
				//
			}

			this.writeMap(x, y, value);
		}
	};
	this.addRoom = function (x, y, w, h) {
		let room = {};
		room.w = w;
		room.h = h;
		room.x = limit(x, 1, this.width - room.w - 1);
		room.y = limit(y, 1, this.height - room.h - 1);
		room.id = this.rooms.length;

		this.rooms.push(room);

		for (ix = room.x; ix < room.x + room.w; ix++) {
			for (iy = room.y; iy < room.y + room.h; iy++) {
				this.makeFloor(ix, iy, "room_" + room.id);
			}
		}
		return room.id;
	};
	this.addHallway = function (x, y, w, h) {
		let hallway = {};
		hallway.w = w;
		hallway.h = h;
		hallway.x = limit(x, 1, this.width - hallway.w - 1);
		hallway.y = limit(y, 1, this.height - hallway.h - 1);
		hallway.id = this.hallways.length;

		this.hallways.push(hallway);

		for (ix = hallway.x; ix < hallway.x + hallway.w; ix++) {
			for (iy = hallway.y; iy < hallway.y + hallway.h; iy++) {
				this.makeFloor(ix, iy, "hallway_" + hallway.id);
				this.content(ix, iy, "pass");
			}
		}
	};
	this.connectRooms = function (r1, r2) {
		let r1_center_x = Math.round(this.rooms[r1].x + this.rooms[r1].w / 2);
		let r1_center_y = Math.round(this.rooms[r1].y + this.rooms[r1].h / 2);
		let r2_center_x = Math.round(this.rooms[r2].x + this.rooms[r2].w / 2);
		let r2_center_y = Math.round(this.rooms[r2].y + this.rooms[r2].h / 2);
		let delta_x = r2_center_x - r1_center_x;
		let delta_y = r2_center_y - r1_center_y;

		if (Math.random() < 0.5) {
			// MOVE SIDE

			let hallway = {};
			if (r1_center_x > r2_center_x) {
				hallway.x = r2_center_x;
			} else {
				hallway.x = r1_center_x;
			}
			hallway.w = Math.abs(delta_x) + 1;
			hallway.y = r1_center_y;
			hallway.h = 1;
			this.addHallway(hallway.x, hallway.y, hallway.w, hallway.h);

			// MOVE DOWN

			hallway = {};
			if (r1_center_y > r2_center_y) {
				hallway.y = r2_center_y;
			} else {
				hallway.y = r1_center_y;
			}
			hallway.h = Math.abs(delta_y) + 1;
			hallway.x = r2_center_x;
			hallway.w = 1;

			this.addHallway(hallway.x, hallway.y, hallway.w, hallway.h);
		} else {
			// MOVE DOWN

			let hallway = {};
			if (r1_center_y > r2_center_y) {
				hallway.y = r2_center_y;
			} else {
				hallway.y = r1_center_y;
			}
			hallway.h = Math.abs(delta_y) + 1;
			hallway.x = r1_center_x;
			hallway.w = 1;

			this.addHallway(hallway.x, hallway.y, hallway.w, hallway.h);

			// MOVE SIDE
			hallway = {};
			if (r1_center_x > r2_center_x) {
				hallway.x = r2_center_x;
			} else {
				hallway.x = r1_center_x;
			}
			hallway.w = Math.abs(delta_x) + 1;
			hallway.y = r2_center_y;
			hallway.h = 1;

			this.addHallway(hallway.x, hallway.y, hallway.w, hallway.h);
		}
	};

	if (level == 0) {
		let room_w = 5;
		let room_h = 6;
		let room_x = 11;
		let room_y = 10;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 1;
		room_h = 7;
		room_x = 13;
		room_y = 14;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 9;
		room_h = 5;
		room_x = 8;
		room_y = 18;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 8;
		room_h = 8;
		room_x = 20;
		room_y = 26;
		this.addRoom(room_x, room_y, room_w, room_h);
		this.connectRooms(2, 3);
		club = false;
	} else if (level == 7) {
		let room_w = 5;
		let room_h = 6;
		let room_x = 31;
		let room_y = 34;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 1;
		room_h = 7;
		room_x = 33;
		room_y = 30;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 11;
		room_h = 23;
		room_x = 28;
		room_y = 7;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 5;
		room_h = 3;
		room_x = 31;
		room_y = 1;
		this.addRoom(room_x, room_y, room_w, room_h);
		connectRooms(2, 3);
		club = true;
	} else if (level == 8) {
		let room_w = 5;
		let room_h = 6;
		let room_x = 11;
		let room_y = 10;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 1;
		room_h = 7;
		room_x = 13;
		room_y = 14;
		this.addRoom(room_x, room_y, room_w, room_h);
		room_w = 13;
		room_h = 13;
		room_x = 6;
		room_y = 18;
		this.addRoom(room_x, room_y, room_w, room_h);
		club = false;
	} else {
		let last_x = false,
			last_y = false;
		for (i = 0; i < 8; i++) {
			let room_w = getRandomInt(4) + 4;
			let room_h = getRandomInt(4) + 4;

			let room_x, room_y;
			let offset = 4 - getRandomInt(8);
			if (getRandomInt(10) == 1) {
				offset *= 2;
			}

			if (last_y == false) {
				room_x = getRandomInt(this.width / 6) + 2;
				last_x = room_x + room_w;
				room_y = getRandomInt(this.height / 6) + 2;
				last_y = room_y;
			} else {
				switch (Math.ceil(i / 2)) {
					case 1:
						// move to right
						room_x = last_x + getRandomInt(this.width / 6) + 1;
						last_x = room_x + room_w;
						room_y = last_y + offset;
						last_y = room_y;
						break;
					case 2:
						// move down
						room_x = last_x + offset;
						last_x = room_x;
						room_y = last_y + getRandomInt(this.height / 6) + 1;
						last_y = room_y + room_h;
						break;
					case 3:
						// move left
						room_x = last_x - room_w - getRandomInt(this.width / 6) - 1;
						last_x = room_x - room_w;
						room_y = last_y + offset;
						last_y = room_y;
						break;
					case 4:
						// move up
						room_x = last_x + offset;
						last_x = room_x;
						room_y = last_y - room_h - getRandomInt(this.height / 6) - 1;
						last_y = room_y - room_h;
						break;
				}
			}
			this.addRoom(room_x, room_y, room_w, room_h);
			if (i > 0) {
				this.connectRooms(i - 1, i);
			}
			if (i == 7) {
				this.connectRooms(i, 0);
			}
		}

		// Add side rooms
		for (i = 0; i < getRandomInt(2) + 1; i++) {
			let startroom = this.rooms[getRandomInt(this.rooms.length - 1)];
			let xoff = getRandomInt(4) + 4;
			let yoff = getRandomInt(6) - 3;
			let room_w = getRandomInt(4) + 4;
			let room_h = getRandomInt(4) + 4;
			if (startroom.x < this.width / 2 && startroom.x > 10) {
				xoff = -xoff - room_w;
			} else {
				xoff += startroom.w;
			}
			let room = this.addRoom(startroom.x + xoff, startroom.y + yoff, room_w, room_h);
			this.connectRooms(startroom.id, room);
		}
	}
	// walls
	for (repeat = 0; repeat < 2; repeat++) {
		// loop twice through all walls to properly fix corners

		// Rooms
		for (i = 0; i < this.rooms.length; i++) {
			let room = this.rooms[i];
			for (ix = room.x - 1; ix < room.x + room.w + 1; ix++) {
				this.makeWall(ix, room.y - 1, "room_" + room.id);
				this.makeWall(ix, room.y + room.h, "room_" + room.id);
			}
			for (iy = room.y - 1; iy < room.y + room.h + 1; iy++) {
				this.makeWall(room.x - 1, iy, "room_" + room.id);
				this.makeWall(room.x + room.w, iy, "room_" + room.id);
			}
		}

		// Hallways
		for (i = 0; i < this.hallways.length; i++) {
			if (this.hallways[i]) {
				let hallway = this.hallways[i];
				for (ix = hallway.x - 1; ix < hallway.x + hallway.w + 1; ix++) {
					this.makeWall(ix, hallway.y - 1, "hallway_" + hallway.id);
					this.makeWall(ix, hallway.y + hallway.h, "hallway_" + hallway.id);
				}
				for (iy = hallway.y - 1; iy < hallway.y + hallway.h + 1; iy++) {
					this.makeWall(hallway.x - 1, iy, "hallway_" + hallway.id);
					this.makeWall(hallway.x + hallway.w, iy, "hallway_" + hallway.id);
				}
			}
		}
	}

	return this;
}

function populateMap(map) {
	function addContainer(x, y) {
		if (map.content(x, y) == false) {
			let container = new actor("Case", x, y, "container", "X", map);
			map.content(x, y, container.id);
		}
	}

	if (level == 0) {
		player.pos.x = 15;
		player.pos.y = 11;
		player.hp = player.maxhp - 3;
		map.content(player.pos.x, player.pos.y, "player");
		map.paintCell(16, 9, "red");
		map.paintCell(15, 10, "red");
		map.paintCell(16, 10, "red");
		map.paintCell(14, 11, "red");
		map.paintCell(15, 11, "red");
		map.paintCell(16, 11, "red");
		map.paintCell(15, 12, "red");
		map.paintCell(16, 12, "red");

		let door = new actor("Cell door", 13, 17, "celldoor", "X", map);
		map.content(13, 17, door.id);
		let guard = new actor("Guard", 13, 19, "oblivious", "X", map);
		map.content(13, 19, guard.id);

		// add exit
		let itemx = map.rooms[3].x + 1 + getRandomInt(map.rooms[3].w - 2);
		let itemy = map.rooms[3].y + 1 + getRandomInt(map.rooms[3].h - 2);
		let exit = new actor("Stairs", itemx, itemy, "Stairs", "e", map);
		map.content(exit.pos.x, exit.pos.y, exit.id);

		// add foes
		let numEnemies = 3;
		for (i = 0; i < numEnemies; i++) {
			let enemyroom = 3,
				enemyx,
				enemyy;
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				enemyx = map.rooms[enemyroom].x + 1 + getRandomInt(map.rooms[enemyroom].w - 2);
				enemyy = map.rooms[enemyroom].y + 1 + getRandomInt(map.rooms[enemyroom].h - 2);
				if (map.content(enemyx, enemyy) == false || map.content(enemyx, enemyy) == "pass") {
					free = true;
				}
				if (attempts > 28) {
					failure = true;
				}
			}
			if (free) {
				let enemy = new actor("enemy", enemyx, enemyy, "small", "e", map);
				map.content(enemyx, enemyy, enemy.id);
			}
		}

		// add item
		free = false;
		failure = false;
		attempts = 0;
		while (free == false && failure == false) {
			attempts += 1;
			itemx = map.rooms[3].x + 1 + getRandomInt(map.rooms[3].w - 2);
			itemy = map.rooms[3].y + 1 + getRandomInt(map.rooms[3].h - 2);
			if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
				free = true;
			}
			if (attempts > 40) {
				failure = true;
			}
		}
		if (free) {
			let item = new actor("drink", itemx, itemy, "item", "e", map);
			map.content(itemx, itemy, item.id);
		}
	} else if (level == 7) {
		player.pos.x = 33;
		player.pos.y = 37;

		// add exit
		let itemx, itemy;
		let endroom = 3;
		free = false;
		failure = false;
		attempts = 0;
		while (free == false && failure == false) {
			attempts += 1;
			itemx = map.rooms[endroom].x + 1 + getRandomInt(map.rooms[endroom].w - 2);
			itemy = map.rooms[endroom].y + 1 + getRandomInt(map.rooms[endroom].h - 2);
			if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
				free = true;
			}
			if (attempts > 50) {
				failure = true;
			}
		}
		if (free) {
			// add exit
			let exit = new actor("Stairs", itemx, itemy, "Stairs", "e", map);
			map.content(exit.pos.x, exit.pos.y, exit.id);
		}

		if (failure) {
			// make new level
			newLevel(false);
		}

		// add lemmy
		if (level % 2 != 0) {
			free = false;
			failure = false;
			attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				itemx = map.rooms[endroom].x + 1 + getRandomInt(map.rooms[endroom].w - 2);
				itemy = map.rooms[endroom].y + 1 + getRandomInt(map.rooms[endroom].h - 2);
				if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
					free = true;
				}
				if (attempts > 50) {
					failure = true;
				}
			}
			if (free) {
				// add lemmy
				let lemmy = new actor("Lemmy", itemx, itemy, "Lemmy", "e", map);
				map.content(lemmy.pos.x, lemmy.pos.y, lemmy.id);
			}

			if (failure) {
				// make new level
				newLevel(false);
			}
		}

		//Containers
		for (iy = 7; iy < 30; iy++) {
			addContainer(28, iy);
			addContainer(38, iy);
		}

		// Add enemies
		let numEnemies = 6 + level * 2;
		let numlarge = 0;
		let enemy;
		for (i = 0; i < numEnemies; i++) {
			let enemyroom = 2,
				enemyx,
				enemyy;
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				enemyx = map.rooms[enemyroom].x + 1 + getRandomInt(map.rooms[enemyroom].w - 2);
				enemyy = map.rooms[enemyroom].y + 1 + getRandomInt(map.rooms[enemyroom].h - 2);
				if (map.content(enemyx, enemyy) == false || map.content(enemyx, enemyy) == "pass") {
					free = true;
				}
				if (attempts > 16) {
					failure = true;
				}
			}
			if (free) {
				if (getRandomInt(10) < level && numlarge < level) {
					enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
					numlarge++;
				} else {
					enemy = new actor("enemy", enemyx, enemyy, "small", "e", map);
				}
				map.content(enemyx, enemyy, enemy.id);
			}
		}

		// Add items
		let numItems = 10 + level * 2;
		for (i = 0; i < numItems; i++) {
			let itemroom = 2,
				itemx,
				itemy;
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				itemx = map.rooms[itemroom].x + 1 + getRandomInt(map.rooms[itemroom].w - 2);
				itemy = map.rooms[itemroom].y + 1 + getRandomInt(map.rooms[itemroom].h - 2);
				if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
					free = true;
				}
				if (attempts > 16) {
					failure = true;
				}
			}
			if (free) {
				let item;
				// add an item
				var chance = getRandomInt(32);
				if (chance < 15 + level) {
					// add booze
					item = new actor("drink", itemx, itemy, "item", "e", map);
				} else {
					// add bottle
					item = new actor("bottle", itemx, itemy, "item", "e", map);
				}
				map.content(itemx, itemy, item.id);
			}
		}

		// Add bystanders
		numEnemies = 34;
		numlarge = 0;
		enemy;
		for (i = 0; i < numEnemies; i++) {
			let enemyroom = 2,
				enemyx,
				enemyy;
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				enemyx = map.rooms[enemyroom].x + 1 + getRandomInt(map.rooms[enemyroom].w - 2);
				enemyy = map.rooms[enemyroom].y + 1 + getRandomInt(map.rooms[enemyroom].h - 2);
				if (map.content(enemyx, enemyy) == false || map.content(enemyx, enemyy) == "pass") {
					free = true;
				}
				if (attempts > 16) {
					failure = true;
				}
			}
			if (free) {
				enemy = new actor("bystander", enemyx, enemyy, "bystander", "e", map);
				map.content(enemyx, enemyy, enemy.id);
			}
		}
	} else if (level == 8) {
		player.pos.x = 13;
		player.pos.y = 13;
		let door = new actor("Ornate door", 13, 17, "celldoor", "X", map);
		map.content(13, 17, door.id);
		let guard = new actor("Guard", 13, 19, "oblivious", "X", map);
		map.content(13, 19, guard.id);

		// add foes
		let enemyx = 7;
		let enemyy = 19;
		let enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
		map.content(enemyx, enemyy, enemy.id);

		enemyx = 17;
		enemyy = 19;
		enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
		map.content(enemyx, enemyy, enemy.id);

		enemyx = 7;
		enemyy = 29;
		enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
		map.content(enemyx, enemyy, enemy.id);

		enemyx = 17;
		enemyy = 29;
		enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
		map.content(enemyx, enemyy, enemy.id);

		enemyx = 12;
		enemyy = 29;
		enemy = new actor("enemy", enemyx, enemyy, "boss", "e", map);
		map.content(enemyx, enemyy, enemy.id);

		for (ix = 6; ix < 19; ix++) {
			addContainer(ix, 30);
		}
	} else {
		//Move player to start room
		let startroom;
		while (!map.rooms[startroom]) {
			startroom = getRandomInt(map.rooms.length);
		}
		player.pos.x = Math.round(map.rooms[startroom].x + map.rooms[startroom].w / 2);
		player.pos.y = Math.round(map.rooms[startroom].y + map.rooms[startroom].h / 2);
		map.content(player.pos.x, player.pos.y, "player");

		// Add containers
		map.rooms.forEach((room) => {
			let pos = getRandomInt(3);
			let ix, iy;
			if (pos == 0 || pos == 2) {
				if (pos == 0) {
					iy = room.y;
				} else if (pos == 2) {
					iy = room.y + room.h - 1;
				}
				for (ix = room.x; ix < room.x + room.w; ix++) {
					addContainer(ix, iy);
				}
			} else {
				if (pos == 1) {
					ix = room.x + room.w - 1;
				} else if (pos == 3) {
					ix = room.x;
				}
				for (iy = room.y; iy < room.y + room.h; iy++) {
					addContainer(ix, iy);
				}
			}
		});

		// Add enemies
		let numEnemies = 8 + Math.round(level * 2.5);
		let numlarge = 0;
		let enemy;
		for (i = 0; i < numEnemies; i++) {
			let enemyroom, enemyx, enemyy;
			while (!map.rooms[enemyroom]) {
				enemyroom = getRandomInt(map.rooms.length);
			}
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				enemyx = map.rooms[enemyroom].x + 1 + getRandomInt(map.rooms[enemyroom].w - 2);
				enemyy = map.rooms[enemyroom].y + 1 + getRandomInt(map.rooms[enemyroom].h - 2);
				if (map.content(enemyx, enemyy) == false || map.content(enemyx, enemyy) == "pass") {
					free = true;
				}
				if (attempts > 16) {
					failure = true;
				}
			}
			if (free) {
				if (getRandomInt(10) < level && numlarge < level) {
					enemy = new actor("enemy", enemyx, enemyy, "large", "e", map);
					numlarge++;
				} else {
					enemy = new actor("enemy", enemyx, enemyy, "small", "e", map);
				}
				map.content(enemyx, enemyy, enemy.id);
			}
		}

		// Add items
		let numItems = 10 + level * 2;
		for (i = 0; i < numItems; i++) {
			let itemroom, itemx, itemy;
			while (!map.rooms[itemroom]) {
				itemroom = getRandomInt(map.rooms.length - 1);
			}
			let free = false,
				failure = false,
				attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				itemx = map.rooms[itemroom].x + 1 + getRandomInt(map.rooms[itemroom].w - 2);
				itemy = map.rooms[itemroom].y + 1 + getRandomInt(map.rooms[itemroom].h - 2);
				if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
					free = true;
				}
				if (attempts > 16) {
					failure = true;
				}
			}
			if (free) {
				let item;
				// add an item
				var chance = getRandomInt(32);
				if (chance < 4 + level) {
					// add booze
					item = new actor("drink", itemx, itemy, "item", "e", map);
				} else if (chance < 5 + level * 2) {
					// add knife
					item = new actor("knife", itemx, itemy, "item", "e", map);
				} else if (chance < 16 + level * 2) {
					// add bottle
					item = new actor("bottle", itemx, itemy, "item", "e", map);
				} else {
					// add rock
					item = new actor("rock", itemx, itemy, "item", "e", map);
				}
				map.content(itemx, itemy, item.id);
			}
		}

		// add exit
		let itemx, itemy;
		let endroom = startroom + Math.ceil(map.rooms.length / 2);
		if (endroom > map.rooms.length - 1) {
			while (endroom > map.rooms.length - 1) {
				endroom = endroom - (map.rooms.length - 1);
			}
		}
		free = false;
		failure = false;
		attempts = 0;
		while (free == false && failure == false) {
			attempts += 1;
			itemx = map.rooms[endroom].x + 1 + getRandomInt(map.rooms[endroom].w - 2);
			itemy = map.rooms[endroom].y + 1 + getRandomInt(map.rooms[endroom].h - 2);
			if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
				free = true;
			}
			if (attempts > 50) {
				failure = true;
			}
		}
		if (free) {
			// add exit
			let exit = new actor("Stairs", itemx, itemy, "Stairs", "e", map);
			map.content(exit.pos.x, exit.pos.y, exit.id);
		}

		if (failure) {
			// make new level
			newLevel(false);
		}

		// add lemmy
		if (level % 2 != 0) {
			free = false;
			failure = false;
			attempts = 0;
			while (free == false && failure == false) {
				attempts += 1;
				itemx = map.rooms[endroom].x + 1 + getRandomInt(map.rooms[endroom].w - 2);
				itemy = map.rooms[endroom].y + 1 + getRandomInt(map.rooms[endroom].h - 2);
				if (map.content(itemx, itemy) == false || map.content(itemx, itemy) == "pass") {
					free = true;
				}
				if (attempts > 50) {
					failure = true;
				}
			}
			if (free) {
				// add lemmy
				let lemmy = new actor("Lemmy", itemx, itemy, "Lemmy", "e", map);
				map.content(lemmy.pos.x, lemmy.pos.y, lemmy.id);
			}

			if (failure) {
				// make new level
				newLevel(false);
			}
		}
	}
}

function actor(name, x, y, type, symbol, map) {
	if (name == "player") {
		this.id = "player";
		this.name = "Rowdy Brixton";
	} else {
		this.id = actors.length + 1;
		this.name = makeName();
		this.fragile = false;
	}
	this.status = [];
	this.inventory = [];
	this.addItem = function (item, removeFromMap = false) {
		if (this.inventory.length < this.maxinventory) {
			this.inventory.push(item);
			if (removeFromMap) {
				deleteItem(item.id);
			}
		}
	};

	if (type == "small") {
		this.symbol = this.name.substring(0, 1).toLowerCase();
		this.maxhp = 6;
		this.damage = 2;
		this.ai = true;
		this.out = false;
		this.portrait = makeFace();
		this.maxinventory = 1;
		if (getRandomInt(3) < 1) {
			// add an item
			var chance = getRandomInt(16);
			if (chance < 2) {
				// add booze
				let item = new actor("drink", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			} else if (chance < 3) {
				// add knife
				let item = new actor("knife", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			} else {
				// add bottle
				let item = new actor("bottle", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			}
		}
	} else if (type == "bystander") {
		this.name = "Club Patron";
		this.symbol = this.name.substring(0, 1).toLowerCase();
		this.maxhp = 2;
		this.damage = 1;
		this.ai = true;
		this.out = false;
		this.scared = false;
		this.portrait = makeFace();
	} else if (type == "large") {
		this.symbol = this.name.substring(0, 1).toUpperCase();
		this.maxhp = 10;
		this.damage = 3;
		this.ai = true;
		this.maxinventory = 1;
		this.portrait = makeFace();
		if (getRandomInt(3) < 1) {
			// add an item
			var chance = getRandomInt(16);
			if (chance < 5) {
				// add booze
				let item = new actor("drink", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			} else if (chance < 10) {
				// add knife
				let item = new actor("knife", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			} else {
				// add bottle
				let item = new actor("bottle", 0, 0, "item", "e", map);
				delete actors[item.id];
				this.addItem(item);
			}
		}
	} else if (type == "boss") {
		this.name = "Big Boss Hog";
		this.symbol = this.name.substring(0, 1).toUpperCase();
		this.maxhp = 10;
		this.damage = 6;
		this.ai = true;
		this.maxinventory = 1;
		this.portrait = makeFace();
		let item = new actor("knife", 0, 0, "item", "e", map);
		delete actors[item.id];
		this.addItem(item);
	} else if (type == "player") {
		this.symbol = symbol;
		this.portrait = [
			[["╭", "~", "~", "_", "✓", "\\", "_", "_", "✓", "\\", "~", "~", "╮", " "]],
			[["|", " ", "/", "✓", "|", " ", " ", " ", "_", "_", "|", " ", "/", "_"]],
			[["\\", "_", "_", "/", ".", " ", "Ф", " ", "×", "/", "\\", "_", "_", "/"]],
			[[" ", " ", "/", "#", "{", " ", " ", " ", " ", "|", " ", " ", " ", " "]],
			[[" ", "√", " ", "✓", "\\", "_", "÷", "_", "÷", " ", " ", " ", " ", " "]],
			[[" ", " ", " ", " ", " ", " ", "\\", "}", " ", " ", " ", " ", " ", " "]],
		];
		this.lastdamage = 0;
		this.status = ["Awesome"];
		this.maxhp = 10;
		this.maxmp = 10;
		this.mp = 2;
		this.molotov = 0;
		this.maxinventory = 2;
		this.turnsSinceCombat = 0;
		this.attacks = function (actorid, damage) {
			this.turnsSinceCombat = 0;
			violence = true;
			if (skill_1) {
				if (lastdamage > 0) {
					if (lastdamage > damage) {
						player.addhp(damage);
					} else {
						player.addhp(lastdamage);
					}
					lastdamage = 0;
				}
			}
		};
		this.addhp = function (amount, overflow = false) {
			if (overflow && this.hp + amount > this.maxhp) {
				this.maxhp = this.hp + amount;
			}
			if (amount < 0) {
				if (skill_2) {
					amount = Math.ceil(amount / 2);
				}
				violence = true;
				this.turnsSinceCombat = 0;
				this.lastdamage = amount;
				this.addmp(0.5);
				document.querySelectorAll(".mapcell_actor_player").forEach((item) => {
					item.classList.add("pulse");
				});
				document.querySelectorAll(".hpbar_container .label").forEach((item) => {
					item.classList.add("pulse");
				});
				document.querySelector("body").classList.add("shake");
			}
			this.hp = limit(this.hp + amount, 0, this.maxhp);
			updatePlayer(false);
		};
		this.addmp = function (amount, overflow = false) {
			if (overflow && this.mp + amount > this.maxmp) {
				this.maxmp = this.mp + amount;
			}
			this.mp = limit(this.mp + amount, 0, this.maxmp);
			if (amount < 0) {
				document.querySelectorAll(".mpbar_container .label").forEach((item) => {
					item.classList.add("pulse");
				});
			}
			updatePlayer(false);
		};
		this.drink = function (itemid) {
			let drink = actors[itemid];
			this.addmp(drink.mpeffect, true);
			this.addhp(drink.hpeffect, true);
			deleteItem(itemid);
			let bottle = new actor("bottle", 0, 0, "item", "e", map);
			this.addItem(bottle);
			delete actors[bottle.id];
			updatePlayer(false);
		};
	} else if (type == "Lemmy") {
		//this.id = "lemmy";
		this.symbol = "&#165;";
		this.maxhp = 99999;
		this.ai = false;
		this.name = name;
		this.fragile = false;
		this.maxinventory = 0;
		this.portrait = [
			[[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "]],
			[[" ", " ", "(", "\\", "_", "/", ")", " ", " ", " "]],
			[[" ", " ", " ", "ಠ", "ಠ", "/", " ", " ", " ", " "]],
			[[" ", " ", " ", " Y", " ", " ", " ", " ", " ", " "]],
			[[" ", " ", " ", " ", "-", "'", " ", " ", " ", " "]],
			[[" ", " ", " ", " ", "|", "|", " ", " ", " ", " "]],
			[[" ", " ", " ", " ", "|", "|", " ", " ", " ", " "]],
		];
		this.status = ["'sup?"];
	} else if (type == "Stairs") {
		//this.id = "stairs";
		this.symbol = "&#9712;";
		this.maxhp = 99999;
		this.ai = false;
		this.name = name;
		this.fragile = false;
		this.maxinventory = 0;
		this.portrait = [
			[[" ", " ", " ", " ", " ", "|", " ", " ", "|", " "]],
			[[" ", " ", " ", ".", "_", "|", "_", "_", "|", " "]],
			[[" ", " ", " ", "|", " ", " ", "|", " ", " ", " "]],
			[[" ", ".", "_", "|", "_", "_", "|", " ", " ", " "]],
			[[" ", "|", " ", " ", "|", " ", " ", " ", " ", " "]],
			[[" ", "|", " ", " ", "|", " ", " ", " ", " ", " "]],
		];
	} else if (type == "celldoor") {
		this.symbol = "#";
		this.maxhp = 1;
		this.ai = false;
		this.name = "Locked door";
		this.fragile = true;
		this.maxinventory = 0;
		this.portrait = [
			[[" ", "|", "=", "|", "=", "|", "=", "|", " "]],
			[[" ", "|", " ", "|", " ", "|", " ", "|", " "]],
			[[" ", "|", " ", "|", " ", "|", " ", "|", " "]],
			[[" ", "|", " ", "|", " ", "|", " ", "|", " "]],
			[[" ", "|", " ", "|", " ", "|", " ", "|", " "]],
			[[" ", "|", "=", "|", "=", "|", "=", "|", " "]],
			[[" ", "|", " ", "|", " ", "|", " ", "|", " "]],
		];
	} else if (type == "oblivious") {
		this.symbol = this.name.substring(0, 1).toLowerCase();
		this.maxhp = 1;
		this.damage = 1;
		this.ai = false;
		this.out = false;
		this.portrait = makeFace();
		this.maxinventory = 1;
		let item = new actor("bottle", 0, 0, "item", "e", map);
		delete actors[item.id];
		this.addItem(item);
	} else if (type == "container") {
		this.symbol = "&#9636;";
		this.maxhp = 1;
		this.ai = false;
		this.name = name;
		this.fragile = true;
		this.maxinventory = 3;
		this.portrait = [
			[[" ", ".", "_", "_", "_", "_", "_", "_", " ", " "]],
			[[" ", "|", "\\", " ", " ", " ", " ", "|", "\\", " "]],
			[[" ", "|", " ", "\\", " ", " ", " ", "|", " ", "\\"]],
			[[" ", "|", "=", "=", "=", "=", "=", "|", " ", "|"]],
			[[" ", "|", "\\", " ", " ", " ", " ", "|", " ", "|"]],
		];
	} else if (type == "item") {
		this.ai = false;
		this.maxinventory = 0;
		this.drop = function (x, y) {
			let setx = x;
			let sety = y;
			if (!map.passable(x, y, true)) {
				let pos = closestEmpty({
					pos: {
						x: x,
						y: y,
					},
				});
				setx = pos.x;
				sety = pos.y;
			}
			let item = new actor(this.subtype, x, y, this.type, "e", map);
			item.name = this.name;
			map.content(setx, sety, item.id);
			drawActor(item);
			item.pos.x = setx;
			item.pos.y = sety;
			updatePlayer(false);
			enemyTurn(false);
		};
		if (name == "drink") {
			this.subtype = "drink";
			this.symbol = "&#9673;";
			this.maxhp = 1;
			this.name = makeDrink();
			this.portrait = [
				[[" ", " ", " ", "'", "=", "=", "'", " ", " ", " "]],
				[[" ", " ", " ", " ", "|", "|", " ", " ", " ", " "]],
				[[" ", " ", "╭", " ", " ", " ", " ", "╮", " ", " "]],
				[[" ", " ", "|", "~", "~", "~", "~", "|", " ", " "]],
				[[" ", " ", "|", "#", "#", "#", "#", "|", " ", " "]],
			];
			this.mpeffect = getRandomInt(4) - 1;
			this.hpeffect = getRandomInt(4) - 1;
			this.status = [];
			if (this.mpeffect > 0) {
				this.status.push("+" + this.mpeffect + " Piss");
			} else if (this.mpeffect < 0) {
				this.status.push(this.mpeffect + " Piss");
			}
			if (this.hpeffect > 0) {
				this.status.push("+" + this.hpeffect + " Vinegar");
			} else if (this.hpeffect < 0) {
				this.status.push(this.hpeffect + " Vinegar");
			}
		} else if (name == "bottle") {
			this.subtype = "bottle";
			this.symbol = "&#9678;";
			this.maxhp = 1;
			this.name = "Empty bottle";
			this.portrait = [
				[[" ", " ", " ", "'", "=", "=", "'", " ", " ", " "]],
				[[" ", " ", " ", " ", "|", "|", " ", " ", " ", " "]],
				[[" ", " ", "╭", " ", " ", " ", " ", "╮", " ", " "]],
				[[" ", " ", "|", " ", " ", " ", " ", "|", " ", " "]],
				[[" ", " ", "|", " ", " ", " ", " ", "|", " ", " "]],
			];
			this.status = ["Blunt instrument"];
			this.melee = "3";
			this.range = "1";
			this.stun = "4";
			this.verbs = ["Knock"];
		} else if (name == "knife") {
			this.subtype = "knife";
			this.symbol = "&#9658;";
			this.maxhp = 1;
			this.name = "Knife";
			this.portrait = [
				[[" ", " ", " ", "_", "_", "_", "_", "_", "_", "_"]],
				[["[", "=", "=", "]", "_", "_", "_", "_", "_", "/"]],
				[[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "]],
			];
			this.status = ["Pretty sharp"];
			this.melee = "4";
			this.range = "6";
			this.stun = "0";
			this.verbs = ["Stab", "Slash", "Skewer", "Puncture", "Slice"];
		} else if (name == "rock") {
			this.subtype = "rock";
			this.symbol = "*";
			this.maxhp = 1;
			this.name = "Small rock";
			this.portrait = [
				[[" ", " ", " ", " ", " ", " ", " ", " ", " ", " "]],
				[[" ", " ", ",", "_", "_", "_", "_", " ", " ", " "]],
				[[" ", "_", "/", "", "_", "/", " ", "\\", " ", " "]],
				[[" ", "\\", " ", "", " ", " ", " ", "|", " ", " "]],
				[[" ", " ", "\\", "_", "_", "\\", "_", "/", " ", " "]],
			];
			this.status = ["Very thrilling"];
			this.melee = "2";
			this.range = "1";
			this.stun = "4";
			this.verbs = ["Bash"];
		}
	} else {
		this.symbol = symbol;
		this.maxhp = 1;
		this.ai = true;
	}

	this.seen = false;
	this.visible = false;
	this.pos = {};
	this.pos.x = x;
	this.pos.y = y;
	this.aware = false;
	this.awareX = false;
	this.awareY = false;
	this.skip = 0;
	this.type = type;
	this.hp = this.maxhp;

	this.sees = function (x, y, usecover = false) {
		return lineOfSight(this.pos.x, this.pos.y, x, y, usecover);
	};
	this.navigate = function (x, y) {
		let direction = dijkstra(this.pos.x, this.pos.y, x, y);
		this.move(direction);
	};
	this.move = function (dir, playerswap = false) {
		let newX, newY;
		switch (dir) {
			case 0:
				//move up
				newX = this.pos.x;
				newY = this.pos.y - 1;
				break;
			case 1:
				//move right
				newX = this.pos.x + 1;
				newY = this.pos.y;
				break;
			case 2:
				//move down
				newX = this.pos.x;
				newY = this.pos.y + 1;
				break;
			case 3:
				//move left
				newX = this.pos.x - 1;
				newY = this.pos.y;
				break;
		}

		if (map.readMap(newX, newY) && map.readMap(newX, newY).passable && map.readMap(newX, newY).passable == true) {
			if (map.content(newX, newY) == false || map.content(newX, newY) == "pass") {
				map.content(this.pos.x, this.pos.y, false);
				map.content(newX, newY, this.id);
				this.pos.x = newX;
				this.pos.y = newY;
				if (this.id == "player") {
					updatePlayer(true);
				}
			} else if (
				actors[map.content(newX, newY)] &&
				((actors[map.content(newX, newY)].type && actors[map.content(newX, newY)].type == "item") ||
					map.content(newX, newY) == "bystander")
			) {
				if (this.id != "player" || playerswap) {
					let other = actors[map.content(newX, newY)];
					map.content(this.pos.x, this.pos.y, other.id);
					other.pos.x = this.pos.x;
					other.pos.y = this.pos.y;
					map.content(newX, newY, this.id);
					this.pos.x = newX;
					this.pos.y = newY;
					if (this.id == "player") {
						updatePlayer(true);
					}
				}
			}
		}

		return map.content(newX, newY);
	};
	this.gotHit = function (dam) {
		this.hp -= dam;
		document.querySelectorAll(".mapcell_actor_" + this.id).forEach((item) => {
			item.classList.add("pulse");
		});
	};
	this.skipturn = function (turns = 1) {
		this.skip = limit(this.skip + turns, 3, 5);
	};
	this.fling = function (dir, dist, toside = false, hitplayer = false, dealDamage = 0) {
		function checkSides(x, y, dir) {
			let queue = new Array();
			if (dir == 0) {
				queue = [1, 3, 0, 2];
			} else if (dir == 1) {
				queue = [2, 0, 1, 3];
			} else if (dir == 2) {
				queue = [3, 1, 2, 0];
			} else if (dir == 3) {
				queue = [0, 2, 3, 1];
			}

			while (queue.length > 0) {
				let checkdir = queue.shift();
				if ((checkdir = 0)) {
					if (map.passable(x, y - 1)) {
						return 0;
					}
				} else if ((checkdir = 1)) {
					if (map.passable(x + 1, y)) {
						return 1;
					}
				} else if ((checkdir = 2)) {
					if (map.passable(x, y + 1)) {
						return 2;
					}
				} else if ((checkdir = 3)) {
					if (map.passable(x - 1, y)) {
						return 3;
					}
				}
			}
		}
		function collision(id, newX, newY, dir, dealDamage) {
			let actor = actors[id];
			if (map.passable(newX, newY, true)) {
				// no wall, no actor
				actor.pos.x = newX;
				actor.pos.y = newY;
			} else if (map.passable(newX, newY, false)) {
				// no wall, yes actor
				actor.pos.x = newX;
				actor.pos.y = newY;
				if (
					map.content(newX, newY) &&
					map.content(newX, newY) != "pass" &&
					map.content(newX, newY) != "player" &&
					actors[map.content(newX, newY)] &&
					actors[map.content(newX, newY)].type != "item"
				) {
					// other actor here
					const hit = actors[map.content(newX, newY)];
					if (hit.id != "player") {
						hit.gotHit(dealDamage);
					}
					if (actor.fragile) {
						actor.hp = 0;
						hit.fling(dir, 1, true, false);
					} else if (hit.name != "Lemmy" && hit.name != "Stairs") {
						actor.pos.x = newX;
						actor.pos.y = newY;
						hit.fling(dir, 1, true, false);
					}
					return "stop";
				}
			} else {
				//wall
				setTimeout(function () {
					map.paintCell(newX, newY, "red");
				}, 400);

				if (toside) {
					//setTimeout(function(){actor.fling(checkSides(newX, newY, dir), 1, true);},150+getRandomInt(100));
					actor.fling(checkSides(newX, newY, dir), 1, true, false);
				}
				return "stop";
			}
		}

		this.skipturn();

		map.content(this.pos.x, this.pos.y, false);
		switch (dir) {
			case 0:
				for (i = 0; i < dist; i++) {
					newY = this.pos.y - 1;
					newX = this.pos.x;
					if (collision(this.id, newX, newY, dir, dealDamage) == "stop") {
						break;
					}
				}
				break;
			case 1:
				for (i = 0; i < dist; i++) {
					newY = this.pos.y;
					newX = this.pos.x + 1;
					if (collision(this.id, newX, newY, dir, dealDamage) == "stop") {
						break;
					}
				}
				break;
			case 2:
				for (i = 0; i < dist; i++) {
					newY = this.pos.y + 1;
					newX = this.pos.x;
					if (collision(this.id, newX, newY, dir, dealDamage) == "stop") {
						break;
					}
				}
				break;
			case 3:
				for (i = 0; i < dist; i++) {
					newY = this.pos.y;
					newX = this.pos.x - 1;
					if (collision(this.id, newX, newY, dir, dealDamage) == "stop") {
						break;
					}
				}
				break;
		}
		playerturn = false;
		interactionMenu.close();
		map.content(this.pos.x, this.pos.y, this.id);
		document.querySelectorAll(".mapcell_actor_" + actor.id).forEach((actorcell) => {
			actorcell.style.left = actor.pos.x * options.cellsize + 1 + "px";
			actorcell.style.top = actor.pos.y * options.cellsize + 1 + "px";
		});
		/*setTimeout(() => {
		enemyTurn();
	}, 200);*/
	};
	this.kicked = function (dist, dam, hitplayer = false) {
		const cost = 1;
		if (player.mp >= cost) {
			player.addmp(-cost);
			let dir;
			if (this.pos.y < player.pos.y) {
				dir = 0;
			} else if (this.pos.x > player.pos.x) {
				dir = 1;
			} else if (this.pos.y > player.pos.y) {
				dir = 2;
			} else if (this.pos.x < player.pos.x) {
				dir = 3;
			}
			if (this.fragile) {
				this.fling(dir, dist, false, false, 4);
			} else {
				this.fling(dir, dist, false, false, 1);
			}
			this.gotHit(dam);
		}
	};
	this.tackled = function (dist, dam = 0, hitplayer = false) {
		const cost = 2;
		if (player.mp >= cost) {
			player.addmp(-cost);

			let dir;
			if (this.pos.y < player.pos.y) {
				dir = 2;
			} else if (this.pos.x > player.pos.x) {
				dir = 3;
			} else if (this.pos.y > player.pos.y) {
				dir = 0;
			} else if (this.pos.x < player.pos.x) {
				dir = 1;
			}
			if (this.fragile) {
				this.fling(dir, dist, false, false, 4);
				this.gotHit(1);
			} else {
				this.fling(dir, dist, false, false, 2);
				this.gotHit(dam);
			}
		}
	};
	if (name != "player") {
		//actors.push(this);
		actors[this.id] = this;
	}
	return this;
}

function createScreen() {
	if (options.crt) {
		//30, 60, 120
		// 8 50 120
		const segments = 6;
		const size = 50;
		const curve = 120;
		const angle = curve / segments;
		const width = Math.ceil(size / segments);
		const offset = ((360 / curve) * size) / Math.PI;

		//const cylinder = document.getElementById("cylinder");
		const panes = document.createElement("div");
		panes.classList = "panes";

		for (var i = 1; i < segments; i++) {
			let offsetangle = i * angle - curve / 2 - 0.01;
			//let offsetangle = i * angle - curve / 2;
			let elem = document.createElement("div");
			elem.className = "main_segment";
			elem.style.transform = "rotateY(" + offsetangle + "deg) translateZ(" + offset + "vw) ";
			elem.style.width = width * 2.0 + "vw";

			let inner = document.createElement("div");
			inner.classList = "main_segment_container";
			//inner.style.transform = "translateX(-" + width * (i - 1) * 2 + "vw) translateY(-50%)";
			//inner.style.transform = "translateX(-" + width * (i - 0.5) * 2 + "vw) translateY(-50%)";
			//inner.style.transform = "translateX(-" + width * (i-1) * 2 + "%) translateY(-50%)";
			inner.style.transform = "translateX(-" + (100 / segments) * (i - 0.5) + "vw) translateY(-50%)";

			let scanlines = document.createElement("div");
			scanlines.className = "scanlines";

			let crt = document.createElement("div");
			crt.className = "crt";

			elem.appendChild(inner);
			inner.appendChild(scanlines);
			inner.appendChild(crt);
			panes.appendChild(elem);
		}
		document.getElementById("cylinder").appendChild(panes);
	}
}
