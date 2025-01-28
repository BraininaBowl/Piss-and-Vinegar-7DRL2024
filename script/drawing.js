function renderMap(mapdata) {
	const w = mapdata.width;
	const h = mapdata.height;
	const map = mapdata.map;

	let mapcontainer = document.createElement("div");
	mapcontainer.classList = "mapcontainer";

	let layers = document.createElement("div");
	layers.classList = "layers";

	let maplayer = document.createElement("div");
	maplayer.classList = "maplayer layer";

	let actorlayer = document.createElement("div");
	actorlayer.classList = "actorlayer layer";

	let interfacelayer = document.createElement("div");
	interfacelayer.classList = "interfacelayer layer";
	let targetcell = document.createElement("div");
	targetcell.classList = "target";
	targetcell.innerHTML = "&otimes;";
	interfacelayer.appendChild(targetcell);

	layers.style.width = options.cellsize * w + "px";
	layers.style.height = options.cellsize * h + "px";

	for (index = 0; index < w + h * w; index++) {
		let item = map[index];

		if (item != undefined) {
			let x = index % w;
			let y = (index - x) / w;

			let mapcell = document.createElement("div");
			mapcell.classList = "cell mapcell " + item.type + " cell_" + x + "_" + y + " ";
			item.id.forEach((item_id) => mapcell.classList.add(item_id));
			mapcell.setAttribute("data-pos-x", x);
			mapcell.setAttribute("data-pos-y", y);
			if (item.paint) {
				mapcell.classList.add("paint_" + item.paint);
			}
			if (item.seen) {
				mapcell.classList.add("seen");
			}
			if (club) {
				mapcell.classList.add("club");
			}

			mapcell.innerHTML = item.symbol;
			mapcell.style.left = x * options.cellsize + "px";
			mapcell.style.top = y * options.cellsize + "px";
			mapcell.style.fontSize = options.cellsize + "px";
			mapcell.style.lineHeight = options.cellsize + "px";
			mapcell.style.width = options.cellsize + item.grow + "px";
			mapcell.style.height = options.cellsize + item.grow + "px";
			maplayer.appendChild(mapcell);
		}
	}

	drawActor = function (data) {
		let mapcell = document.createElement("div");
		mapcell.classList = "cell mapcell_actor darker mapcell_actor_" + data.id;
		mapcell.innerHTML = data.symbol;
		mapcell.setAttribute("data-text", data.symbol);
		mapcell.style.left = data.pos.x * options.cellsize + 1 + "px";
		mapcell.style.top = data.pos.y * options.cellsize + 1 + "px";
		mapcell.style.fontSize = options.cellsize - 2 + "px";
		mapcell.style.lineHeight = options.cellsize - 2 + "px";
		mapcell.style.width = options.cellsize - 2 + "px";
		mapcell.style.height = options.cellsize - 2 + "px";
		actorlayer.appendChild(mapcell);
	};

	//draw player
	this.drawActor(player);

	actors.forEach((item) => {
		this.drawActor(item);
	});

	layers.appendChild(maplayer);
	layers.appendChild(actorlayer);
	layers.appendChild(interfacelayer);
	mapcontainer.appendChild(layers);

	return mapcontainer;
}

function drawActor(data) {
	let mapcell = document.createElement("div");
	mapcell.classList = "cell mapcell_actor darker mapcell_actor_" + data.id;
	mapcell.innerHTML = data.symbol;
	mapcell.setAttribute("data-text", data.symbol);
	mapcell.style.left = data.pos.x * options.cellsize + 1 + "px";
	mapcell.style.top = data.pos.y * options.cellsize + 1 + "px";
	mapcell.style.fontSize = options.cellsize - 2 + "px";
	mapcell.style.lineHeight = options.cellsize - 2 + "px";
	mapcell.style.width = options.cellsize - 2 + "px";
	mapcell.style.height = options.cellsize - 2 + "px";
	document.querySelectorAll(".actorlayer").forEach((item) => {
		item.appendChild(mapcell);
	});
}

function drawFov(map) {
	document.querySelectorAll(".lit").forEach((cell) => {
		cell.classList.remove("lit");
	});

	let rooms = getRoomsForPoint(player.pos.x, player.pos.y, map, 1);

	for (i = 0; i < rooms.length; i++) {
		document.querySelectorAll("." + rooms[i]).forEach((cell) => {
			cell.classList.add("seen");
			cell.classList.add("lit");
		});
	}
}

function drawTitleScreen() {
	let titlebg = document.createElement("div");
	titlebg.classList = "titlebg";
	let title_visual = document.createElement("div");
	title_visual.classList = "title_visual";
	title_visual.innerHTML =
		"&nbsp;______&nbsp;__&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__&nbsp;<br />|&nbsp;&nbsp;&nbsp;__&nbsp;\\__|.-----.-----.&nbsp;&nbsp;&nbsp;&nbsp;.---.-.-----.--|&nbsp;&nbsp;|<br />|&nbsp;&nbsp;&nbsp;&nbsp;__/&nbsp;&nbsp;||__&nbsp;--|__&nbsp;--|&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;&nbsp;|<br />|___|&nbsp;&nbsp;|__||_____|_____|&nbsp;&nbsp;&nbsp;&nbsp;|___._|__|__|_____|<br />&nbsp;___&nbsp;___&nbsp;__<br />|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|__|.-----.-----.-----.---.-.----.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;-__|&nbsp;&nbsp;_&nbsp;&nbsp;|&nbsp;&nbsp;_&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;_|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />&nbsp;\\_____/|__||__|__|_____|___&nbsp;&nbsp;|___._|__|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|_____|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	interactionMenu = drawMainMenu(false, false);
	let title_menu = document.querySelectorAll(".interactionmenu")[0];
	titlebg.appendChild(title_visual);
	titlebg.appendChild(title_menu);
	document.querySelector("#cylinder").appendChild(titlebg);
}

function drawInteractionMenu(target, actions = [], x = false, y = false) {
	const menu = document.createElement("div");
	menu.classList = "interactionmenu";
	if (target.portrait) {
		const portrait = document.createElement("div");
		portrait.classList = "portrait";
		menu.appendChild(portrait);
		for (pi = 0; pi < target.portrait.length; pi++) {
			let line = document.createElement("div");
			line.classList = "line";
			for (pj = 0; pj < target.portrait[pi][0].length; pj++) {
				let cell = document.createElement("div");
				cell.classList = "cell";
				cell.innerText = target.portrait[pi][0][pj];
				line.appendChild(cell);
			}
			portrait.appendChild(line);
		}
	}
	const title = document.createElement("div");
	title.classList = "title";
	title.innerHTML = target.name;
	menu.appendChild(title);
	const desc = document.createElement("div");
	desc.classList = "desc";
	desc.innerHTML = capitalize(target.status.join(", "));
	menu.appendChild(desc);
	menu.style.width = 9 * options.cellsize + "px";
	let posx, posy;
	if (x == false && y == false) {
		posx = target.pos.x;
		posy = target.pos.y;
	} else {
		posx = x;
		posy = y;
	}
	if (posx < player.pos.x) {
		menu.style.left = (posx - 9) * options.cellsize + "px";
	} /*if (target.pos.x > player.pos.x)*/ else {
		menu.style.left = (posx + 1) * options.cellsize + "px";
	}
	if (posy < player.pos.y) {
		menu.style.top = posy * options.cellsize + "px";
		menu.style.left = (posx - 9) * options.cellsize + "px";
	} else if (posy > player.pos.y) {
		menu.style.left = posx * options.cellsize + "px";
		menu.style.top = (posy + 1) * options.cellsize + "px";
	} else {
		menu.style.top = posy * options.cellsize + "px";
		menu.style.transform = "translateY(-50%)";
	}
	let buttons = document.createElement("div");
	buttons.classList = "buttons";
	menu.appendChild(buttons);
	if (actions && actions.length > 0) {
		actions.forEach((action, index) => {
			let newbutton = document.createElement("div");
			newbutton.classList = "button";
			if (index == 0) {
				newbutton.classList.add("active");
			}
			if (action.disabled) {
				newbutton.classList.add("disabled");
			}
			let newbutton_inner = document.createElement("div");
			newbutton_inner.classList = "button_inner";
			newbutton_inner.innerHTML =
				"<span>" + capitalize(action.label) + "</span><span>[" + (index + 1) + "]</span>";
			newbutton.appendChild(newbutton_inner);

			buttons.appendChild(newbutton);
			if (action.desc) {
				let desc = document.createElement("div");
				desc.classList = "button_desc";
				desc.innerHTML = action.desc;
				desc.style.width = "100%";
				newbutton.appendChild(desc);
			}
		});
	}

	const closebutton = document.createElement("div");
	closebutton.classList = "button close";
	let newbutton_inner = document.createElement("div");
	newbutton_inner.classList = "button_inner";
	newbutton_inner.innerHTML = "<span>Cancel</span><span>[esc]</span>";
	closebutton.appendChild(newbutton_inner);

	closebutton.setAttribute("data-action", "closeinteractionmenu");
	buttons.appendChild(closebutton);

	let mapcontainer = document.querySelectorAll(".mapcontainer .interfacelayer");
	mapcontainer.forEach((item) => {
		item.appendChild(menu.cloneNode(true));
	});

	this.selected = 0;
	this.numitems = actions.length;
	this.actions = actions;
	this.actions.push({ label: "Cancel", action: "interactionMenu.close();" });

	this.close = function () {
		document.querySelectorAll(".interactionmenu").forEach((item) => {
			item.remove();
		});
		mode = 0;
	};

	this.prev = function () {
		this.selected--;
		if (this.selected < 0) {
			this.selected = this.numitems;
		}
		document.querySelectorAll(".interactionmenu .button.active").forEach((item) => {
			item.classList.remove("active");
		});
		document.querySelectorAll(".interactionmenu .button:nth-child(" + (this.selected + 1) + ")").forEach((item) => {
			item.classList.add("active");
		});
	};

	this.next = function () {
		this.selected++;
		if (this.selected > this.numitems) {
			this.selected = 0;
		}
		document.querySelectorAll(".interactionmenu .button.active").forEach((item) => {
			item.classList.remove("active");
		});
		document.querySelectorAll(".interactionmenu .button:nth-child(" + (this.selected + 1) + ")").forEach((item) => {
			item.classList.add("active");
		});
	};

	this.confirm = function (index = this.selected) {
		if (index <= this.numitems) {
			if (!actions[index].disabled) {
				execute(actions[index].action);
				if (actions[index].action != "interactionMenu.close();") {
					updatePlayer(true);
				}
			}
		}
	};

	return this;
}

function drawMainMenu(exit = false, free = true, titletext = "Menu") {
	this.selected = 0;

	this.close = function () {
		document.querySelectorAll(".interactionmenu").forEach((item) => {
			item.remove();
		});
		mode = 0;
	};

	this.prev = function () {
		this.selected--;
		if (this.selected < 0) {
			this.selected = this.numitems;
		}
		document.querySelectorAll(".interactionmenu .button.active").forEach((item) => {
			item.classList.remove("active");
		});
		document.querySelectorAll(".interactionmenu .button:nth-child(" + (this.selected + 1) + ")").forEach((item) => {
			item.classList.add("active");
		});
	};

	this.next = function () {
		this.selected++;
		if (this.selected > this.numitems) {
			this.selected = 0;
		}
		document.querySelectorAll(".interactionmenu .button.active").forEach((item) => {
			item.classList.remove("active");
		});
		document.querySelectorAll(".interactionmenu .button:nth-child(" + (this.selected + 1) + ")").forEach((item) => {
			item.classList.add("active");
		});
	};

	this.confirm = function (index = this.selected) {
		if (index <= this.numitems) {
			execute(actions[index].action);
		}
	};

	playerturn = true;
	mode = 1;
	const menu = document.createElement("div");
	menu.classList = "interactionmenu";
	menu.style.width = 8 * options.cellsize + "px";
	if (free) {
		menu.style.left = "calc(50vw - " + 4 * options.cellsize + "px)";
		menu.style.top = "50vh";
		menu.style.transform = "translateY(-50%)";
	}
	const title = document.createElement("div");
	title.classList = "mainmenu title";
	title.innerHTML = titletext;
	menu.appendChild(title);
	actions = [
		{
			label: "New game",
			action: "newLevel(true);interactionMenu.close();",
		},
		{
			label: "Load game",
			action: "",
			disabled: true,
		},
		{
			label: "Save game",
			action: "",
			disabled: true,
		},
	];
	this.numitems = actions.length;
	this.actions = actions;
	let buttons = document.createElement("div");
	buttons.classList = "buttons";
	menu.appendChild(buttons);
	actions.forEach((action, index) => {
		let newbutton = document.createElement("div");
		newbutton.classList = "button";
		if (index == 0) {
			newbutton.classList.add("active");
		}
		if (action.disabled) {
			newbutton.classList.add("disabled");
		}

		let newbutton_inner = document.createElement("div");
		newbutton_inner.classList = "button_inner";
		newbutton_inner.innerHTML = "<span>" + capitalize(action.label) + "</span><span>[" + (index + 1) + "]</span>";
		newbutton.appendChild(newbutton_inner);

		buttons.appendChild(newbutton);
	});
	if (exit) {
		const closebutton = document.createElement("div");
		closebutton.classList = "button close";
		let newbutton_inner = document.createElement("div");
		newbutton_inner.classList = "button_inner";
		newbutton_inner.innerHTML = "<span>Cancel</span><span>[esc]</span>";
		closebutton.appendChild(newbutton_inner);
		closebutton.setAttribute("data-action", "closeinteractionmenu");
		buttons.appendChild(closebutton);
	}

	document.querySelector("#cylinder").appendChild(menu.cloneNode(true));

	return this;
}

function drawStatus() {
	// main area
	const statuscontainer = document.createElement("div");
	statuscontainer.classList = "statuscontainer";

	// top area
	const top = document.createElement("div");
	top.classList = "top column";

	const mpbar_container = document.createElement("div");
	mpbar_container.classList = "mpbar_container bar_container";
	const mpbar_icon = document.createElement("div");
	mpbar_icon.classList = "icon";
	mpbar_icon.innerHTML = "<img src='./style/hand-fist-solid.svg'>";
	const mpbar_label = document.createElement("div");
	mpbar_label.classList = "label";
	mpbar_label.innerHTML = "PISS";
	mpbar_label.setAttribute("data-text", "PISS");
	const mpbar = document.createElement("div");
	mpbar.classList = "bar mpbar";
	const mpbar_inner = document.createElement("div");
	mpbar_inner.classList = "bar_inner mpbar_inner";
	mpbar_container.appendChild(mpbar_label);
	mpbar_container.appendChild(mpbar_icon);
	mpbar_container.appendChild(mpbar);
	mpbar.appendChild(mpbar_inner);

	const hpbar_container = document.createElement("div");
	hpbar_container.classList = "hpbar_container bar_container";
	const hpbar_icon = document.createElement("div");
	hpbar_icon.classList = "icon";
	hpbar_icon.innerHTML = "<img src='./style/heart-solid.svg'>";
	const hpbar_label = document.createElement("div");
	hpbar_label.classList = "label";
	hpbar_label.innerHTML = "VINEGAR";
	mpbar_label.setAttribute("data-text", "VINEGAR");
	const hpbar = document.createElement("div");
	hpbar.classList = "bar hpbar";
	const hpbar_inner = document.createElement("div");
	hpbar_inner.classList = "bar_inner hpbar_inner";
	hpbar_container.appendChild(hpbar_label);
	hpbar_container.appendChild(hpbar_icon);
	hpbar_container.appendChild(hpbar);
	hpbar.appendChild(hpbar_inner);

	top.appendChild(mpbar_container);
	top.appendChild(hpbar_container);
	statuscontainer.appendChild(top);

	const info = document.createElement("div");
	info.classList = "info column";
	top.appendChild(info);

	// inventory
	const invbar = document.createElement("div");
	invbar.classList = "invbar column";
	let row = document.createElement("div");
	row.innerHTML = "Inventory";
	row.classList.add("title");
	invbar.appendChild(row);
	row = document.createElement("div");
	row.classList = "items column";
	invbar.appendChild(row);
	info.appendChild(invbar);

	// help items
	const helpbar = document.createElement("div");
	helpbar.classList = "helpbar column";
	let target = document.createElement("div");
	target.classList = "target button";
	target.innerHTML = "<span>[T]</span><span>Target mode</span>";
	helpbar.appendChild(target);
	info.appendChild(helpbar);

	return statuscontainer;
}
function updateStatus() {
	document.querySelectorAll(".mpbar").forEach((item) => {
		item.style.width = player.maxmp * options.cellsize + 4;
	});

	document.querySelectorAll(".mpbar_inner").forEach((item) => {
		item.style.width = player.mp * options.cellsize;
	});

	document.querySelectorAll(".hpbar").forEach((item) => {
		item.style.width = player.maxhp * options.cellsize + 4;
	});

	document.querySelectorAll(".hpbar_inner").forEach((item) => {
		item.style.width = player.hp * options.cellsize;
	});

	document.querySelectorAll(".invbar .title").forEach((item) => {
		item.innerHTML = "Inventory " + player.inventory.length + "/" + player.maxinventory;
	});

	document.querySelectorAll(".invbar .items").forEach((invbar) => {
		invbar.innerHTML = "";
		if (player.inventory.length > 0 || player.molotov > 0) {
			player.inventory.forEach((item) => {
				let row = document.createElement("div");
				row.innerHTML = "<li>" + item.name + "</li>";
				row.classList.add("item");
				invbar.appendChild(row);
			});
			if (player.molotov > 0) {
				let row = document.createElement("div");
				row.innerHTML = "<li>Molotov " + player.molotov + "/2</li>";
				row.classList.add("item");
				invbar.appendChild(row);
			}
		} else {
			/*let row = document.createElement("div");
			row.innerHTML = "<i>Empty</i>";
			row.classList.add("item");
			invbar.appendChild(row);*/
		}
	});
}

function buildScreen() {
	const screen = document.createElement("div");
	screen.classList = "mainscreen";
	screen.appendChild(mapdisplay);
	screen.appendChild(drawStatus());

	return screen;
}

function drawToScreen(content) {
	const body = document.getElementById("body");
	if (options.crt) {
		body.classList = "withcrt";
		const segments = document.querySelectorAll(".main_segment_container");
		segments.forEach((item) => {
			item.appendChild(content.cloneNode(true));
		});
	} else {
		//body.classList = "nocrt";
		document.getElementById("cylinder").appendChild(content);
	}
}
