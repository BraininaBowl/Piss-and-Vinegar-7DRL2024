window.addEventListener(
	"keydown",
	function (event) {
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}
		if (playerturn == true) {
			switch (event.code) {
				case "ArrowDown":
				case "Numpad2":
					// code for "down arrow" key press.
					handleInput("down");
					break;
				case "ArrowUp":
				case "Numpad8":
					// code for "up arrow" key press.
					handleInput("up");
					break;
				case "ArrowLeft":
				case "Numpad4":
					// code for "left arrow" key press.
					handleInput("left");
					break;
				case "ArrowRight":
				case "Numpad6":
					// code for "right arrow" key press.
					handleInput("right");
					break;
				case "Enter":
				case "Space":
				case "Numpad5":
					// code for "right arrow" key press.
					handleInput("confirm");
					break;
				case "KeyL":
				case "KeyT":
					handleInput("target");
					break;
				case "Escape":
					handleInput("escape");
					break;
				case "Digit1":
					handleInput(1);
					break;
				case "Digit2":
					handleInput(2);
					break;
				case "Digit3":
					handleInput(3);
					break;
				case "Digit4":
					handleInput(4);
					break;
				case "Digit5":
					handleInput(5);
					break;
				case "Digit6":
					handleInput(6);
					break;
				case "Digit7":
					handleInput(7);
					break;
				case "Digit8":
					handleInput(8);
					break;
				case "Digit9":
					handleInput(9);
					break;
				case "Digit0":
					handleInput(0);
					break;
				default:
					return; // Quit when this doesn't handle the key event.
			}
		}
		// Cancel the default action to avoid it being handled twice
		event.preventDefault();
	},
	true
);
// the last option dispatches the event to the listener first,
// then dispatches event to window

let touchstartX, touchstartY, x_delta, y_delta, numfingers;

window.addEventListener(
	"touchstart",
	function (event) {
		touchstartX = event.changedTouches[0].screenX;
		touchstartY = event.changedTouches[0].screenY;
	},
	false
);

window.addEventListener(
	"touchend",
	function (event) {
		x_delta = event.changedTouches[0].screenX - touchstartX;
		y_delta = event.changedTouches[0].screenY - touchstartY;
		numfingers = event.targetTouches.length + 1;
		handleGesture();
	},
	false
);

window.addEventListener("resize", (event) => {
	updatePlayer(false);
});

function handleGesture() {
	const swipedist = 80;
	if (Math.abs(x_delta) > Math.abs(y_delta) && Math.abs(x_delta) > swipedist) {
		if (x_delta > 0) {
			// swiped right
			handleInput("right");
		}
		if (x_delta < 0) {
			// swiped left
			handleInput("left");
		}
	} else if (Math.abs(x_delta) < Math.abs(y_delta) && Math.abs(y_delta) > swipedist) {
		if (y_delta > 0) {
			// swiped down
			handleInput("down");
		}
		if (y_delta < 0) {
			// swiped up
			handleInput("up");
		}
	} else if (x_delta < swipedist * 0.5 && y_delta < swipedist * 0.5) {
		if (numfingers == 1) {
			handleInput("confirm");
		} else if (numfingers == 2) {
			handleInput("escape");
		}
	} else {
	}
}

function handleInput(key) {
	if (mode == 0) {
		if (targeting) {
			if (key == "up") {
				moveTarget(target.x, target.y - 1);
			} else if (key == "right") {
				moveTarget(target.x + 1, target.y);
			} else if (key == "down") {
				moveTarget(target.x, target.y + 1);
			} else if (key == "left") {
				moveTarget(target.x - 1, target.y);
			} else if (key == "target" || key == "escape") {
				switchModes();
			} else if (key == "confirm") {
				const actor = map.content(target.x, target.y);
				//if (actor && actor != "pass") {
				setUpInteractionMenu(actor);
				mode = 1;
				//}
			}
			updateMap();
		} else {
			let dir;
			if (key == "up") {
				dir = 0;
			} else if (key == "right") {
				dir = 1;
			} else if (key == "down") {
				dir = 2;
			} else if (key == "left") {
				dir = 3;
			} else if (key == "target" || key == "confirm") {
				switchModes();
			} else if ((key = "escape")) {
				interactionMenu = drawMainMenu(true);
			}
			let action = player.move(dir);

			if (action && action != undefined && action != "player" && action != "bystander") {
				setUpInteractionMenu(action, false, dir);
				mode = 1;
			} else if (action == "bystander") {
				player.move(dir, true);
			} else {
			}
		}
	} else if (mode == 1) {
		if (key == "up") {
			interactionMenu.prev();
		} else if (key == "down") {
			interactionMenu.next();
		} else if (key == "confirm") {
			interactionMenu.confirm();
		} else if (typeof key === "number") {
			interactionMenu.confirm(key - 1);
		} else if ((key = "escape")) {
			interactionMenu.close();
		}
	}
}

function updateMap() {
	let mapcontainer = document.querySelector(".mainscreen .mapcontainer");
	let voff;
	let hoff;
	if (targeting) {
		voff =
			Math.round((-target.y * options.cellsize + mapcontainer.offsetHeight / 2) / options.cellsize) *
			options.cellsize;
		hoff =
			Math.round((-target.x * options.cellsize + mapcontainer.offsetWidth / 2) / options.cellsize) *
			options.cellsize;
	} else {
		voff =
			Math.round((-player.pos.y * options.cellsize + mapcontainer.offsetHeight / 2) / options.cellsize) *
			options.cellsize;
		hoff =
			Math.round((-player.pos.x * options.cellsize + mapcontainer.offsetWidth / 2) / options.cellsize) *
			options.cellsize;
	}
	document.querySelectorAll(".layers").forEach((layers) => {
		layers.style.top = voff + "px";
		layers.style.left = hoff + "px";
	});
}

function updatePlayer(endturn = false) {
	if (endturn) {
		violence = false;
	}
	drawFov(map);
	updateStatus();
	if ((player.hp <= 0 && skill_5 == false) || (player.hp <= 0 && player.mp <= 0 && skill_5 == true)) {
		interactionMenu = drawMainMenu(false, false, "You died");
		let title_menu = document.querySelectorAll(".interactionmenu")[0];
		document.querySelectorAll(".mainscreen")[0].innerHTML = "";
		document.querySelectorAll(".mainscreen")[0].appendChild(title_menu);
	}
	moveTarget(player.pos.x, player.pos.y);

	document.querySelectorAll(".mapcell_actor_player").forEach((playercell) => {
		playercell.style.left = player.pos.x * options.cellsize + 1 + "px";
		playercell.style.top = player.pos.y * options.cellsize + 1 + "px";
	});

	updateMap();

	if (endturn) {
		if (player.turnsSinceCombat > 3 && player.mp < 2) {
			player.addmp(1);
		}
		player.turnsSinceCombat += 1;
		playerturn = false;
		setTimeout(() => {
			enemyTurn();
		}, 200);
	}
}

function enemyTurn(runai = true) {
	updateStatus();
	lastdamage = 0;
	// clean actor cells
	interactionMenu.close();
	let states = ["nudge-up", "nudge-right", "nudge-down", "nudge-left", "pulse", "shake"];
	while (states.length > 0) {
		let state = states.shift();
		document.querySelectorAll("." + state).forEach((item) => {
			item.classList.remove(state);
		});
	}

	actors.forEach((actor) => {
		let opacity = 0;
		//check if actor is alive
		if (actor.hp <= 0) {
			if (!actor.out) {
				actor.out = true;
				map.content(actor.pos.x, actor.pos.y, false);
				opacity = 0.3;
				if (actor.ai || actor.type == "oblivious") {
					player.addmp(3);
					player.addhp(1);
					actor.ai = false;
					map.paintCell(actor.pos.x, actor.pos.y, "red");
				} else if (actor.type == "container") {
					document.querySelectorAll(".mapcell_actor_" + actor.id).forEach((item) => {
						item.innerHTML = "_";
					});
				}
				if (actor.inventory.length > 0) {
					actor.inventory[0].drop(actor.pos.x, actor.pos.y);
				}
			}
		} else {
			//check if actor is in wrong spot
			if (
				map.content(actor.pos.x, actor.pos.y) != actor.id ||
				map.readMap(actor.pos.x, actor.pos.y).passable != true
			) {
				if (map.content(actor.pos.x, actor.pos.y) == false || map.content(actor.pos.x, actor.pos.y) == "pass") {
					map.content(actor.pos.x, actor.pos.y, actor.id);
				} else {
					let newpos = closestEmpty(actor);
					if (newpos) {
						actor.pos.x = newpos.x;
						actor.pos.y = newpos.y;
						map.content(newpos.x, newpos.y, actor.id);
					}
				}
			}

			if (actor.type == "bystander") {
				if (actor.scared) {
					actor.status = ["running"];
				} else {
					actor.status = ["Partying"];
				}
			} else if (actor.ai) {
				// update status
				actor.status = [];
				if (actor.skip > 0) {
					actor.status.push("stunned");
				}
				if (
					actor.inventory.length > 0 &&
					(actor.inventory[0].subtype == "bottle" || actor.inventory[0].subtype == "knife")
				) {
					actor.status.push("armed");
				}
				if (actor.hp > actor.maxhp / 2) {
					actor.status.push("healthy");
				} else {
					actor.status.push("wounded");
				}
			} else if (actor.type == "container") {
				if (actor.inventory.length > 0) {
					actor.inventory.forEach((item) => {
						actor.status.push(item.name);
					});
				}
			}

			if (runai && actor.ai) {
				// run ai
				if (actor.type == "bystander") {
					let dir;
					if (actor.scared) {
						if (actor.pos.x < player.pos.x) {
							dir = 3;
						} else if (actor.pos.x > player.pos.x) {
							dir = 1;
						} else if (actor.pos.y < player.pos.y) {
							dir = 0;
						} else {
							dir = 2;
						}
						actor.move(dir);
						actor.move(dir);
						const deltax = Math.abs(actor.pos.x - player.pos.x);
						const deltay = Math.abs(actor.pos.y - player.pos.y);
						const steps = deltax + deltay;
						if (steps > 18) {
							deleteItem(actor.id);
						}
					} else {
						if (violence && actor.sees(player.pos.x, player.pos.y, true)) {
							actor.scared = true;
						} else {
							actor.move(getRandomInt(3));
						}
					}
				} else if (actor.skip > 0) {
					actor.skip--;
				} else {
					const deltax = Math.abs(actor.pos.x - player.pos.x);
					const deltay = Math.abs(actor.pos.y - player.pos.y);
					const steps = deltax + deltay;
					if (steps <= 1) {
						// close range
						player.addhp(-actor.damage);
						let dir = getDir(actor.pos.x, actor.pos.y, player.pos.x, player.pos.y);
						let anim;
						switch (dir) {
							case 0:
								anim = "nudge-up";
								break;
							case 1:
								anim = "nudge-right";
								break;
							case 2:
								anim = "nudge-down";
								break;
							case 3:
								anim = "nudge-left";
								break;
						}
						document.querySelectorAll(".mapcell_actor_" + actor.id).forEach((item) => {
							item.classList.add(anim);
						});
					} else {
						if (actor.sees(player.pos.x, player.pos.y)) {
							// actor can see player and will move towards
							actor.aware = true;
							actor.awareX = player.pos.x;
							actor.awareY = player.pos.y;
							// move to player
							actor.navigate(player.pos.x, player.pos.y);
						} else if (actor.aware) {
							// actor has seen player and will move to last spotted location
							actor.navigate(actor.awareX, actor.awareY);
						}
					}
				}
			}
			if (
				document
					.querySelectorAll(".mapcell.cell_" + actor.pos.x + "_" + actor.pos.y)[0]
					.classList.contains("lit")
			) {
				// floor actor is standing on is seen
				opacity = 1;
			}
		}
		document.querySelectorAll(".mapcell_actor_" + actor.id).forEach((actorcell) => {
			actorcell.style.left = actor.pos.x * options.cellsize + 1 + "px";
			actorcell.style.top = actor.pos.y * options.cellsize + 1 + "px";
			actorcell.style.opacity = opacity;
		});
	});
	playerturn = true;
}

function draw() {
	drawToScreen(screenContent);
	// resize interface
	let largest = 0;
	document.querySelectorAll(".bar_container .label").forEach((item) => {
		let size = item.offsetWidth;
		if (size > largest) {
			largest = size;
		}
	});
	document.querySelectorAll(".bar_container .label").forEach((item) => {
		item.style.width = largest;
	});
}
