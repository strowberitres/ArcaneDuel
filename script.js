let positions = {
  left: 50,
  right: 50
};

let stats = {
  left: { health: 100, mana: 100, shield: false },
  right: { health: 100, mana: 100, shield: false }
};

let gameOver = false;

function updateBars(side) {
  document.getElementById(`health-${side}`).style.width = `${stats[side].health}%`;
  document.getElementById(`mana-${side}`).style.width = `${stats[side].mana}%`;
}

let cooldowns = {};

const audio = {
  beam: document.getElementById("audio-beam"),
  lightning: document.getElementById("audio-lightning"),
  ultimate: document.getElementById("audio-ultimate"),
  shield: document.getElementById("audio-shield"),
  hit: document.getElementById("audio-hit"),
  bg: document.getElementById("audio-bg")
};

const houses = {
  Gryffindor: { name: "Gryffindor", icon: "houses/Gryffindor.jpg" },
  Slytherin: { name: "Slytherin", icon: "houses/Slytherin.jpg" },
  Ravenclaw: { name: "Ravenclaw", icon: "houses/Ravenclaw.jpg" },
  Hufflepuff: { name: "Hufflepuff", icon: "houses/Hufflepuff.jpg" }
};

let playerHouses = {
  left: null,
  right: null
};

function startSortingCeremony() {
  const houseNames = Object.keys(houses);
  const shuffled = houseNames.sort(() => 0.5 - Math.random());

  const leftHouse = shuffled[0];
  const rightHouse = shuffled[1] || shuffled[0];

  playerHouses.left = houses[leftHouse];
  playerHouses.right = houses[rightHouse];

  document.getElementById("sorting-message").innerText =
    `Player 1: ${leftHouse} | Player 2: ${rightHouse}`;

  showHouseCrest(playerHouses.left.icon, "left");
  showHouseCrest(playerHouses.right.icon, "right");

  // 🔁 Animate mouth
  const mouth = document.querySelector(".mouth");
  if (mouth) mouth.classList.add("talking");

  // ⏳ Stop after 2s
  setTimeout(() => {
    if (mouth) mouth.classList.remove("talking");
    document.getElementById("sorting-ceremony").style.display = "none";
  }, 2000);
}

function showHouseCrest(icon, side) {
  const crest = document.getElementById(`house-crest-${side}`);
  crest.src = `assets/${icon}`;
  crest.style.display = "block";
}


function applyHouseEffects(side, bonus) {
  switch (bonus) {
    case "attack":
      stats[side].attackBoost = 1.1;
      break;
    case "mana":
      stats[side].manaRegen = 0.20; // 20% instead of 15%
      break;
    case "cooldown":
      stats[side].cooldownBoost = 0.8; // 20% faster cooldown
      break;
    case "regen":
      stats[side].healthRegen = true;
      break;
  }
}



function getDistanceBetweenCasters() {
  const left = document.querySelector(".left-caster").getBoundingClientRect();
  const right = document.querySelector(".right-caster").getBoundingClientRect();
  return Math.abs(left.left - right.left);
}

function setCooldown(key, duration = 1000) {
  cooldowns[key] = true;
  setTimeout(() => cooldowns[key] = false, duration);
}

function checkVictory() {
  if (stats.left.health <= 0 || stats.left.mana <= 0) {
    alert("Player 2 Wins!");
    gameOver = true;
    document.getElementById("play-again").style.display = "block";
  } else if (stats.right.health <= 0 || stats.right.mana <= 0) {
    alert("Player 1 Wins!");
    gameOver = true;
    document.getElementById("play-again").style.display = "block";
  }
}

document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  const key = e.key.toLowerCase();

  const leftKeys = ["q", "w", "a", "e"];
  const rightKeys = ["u", "i", "o", "p"];

if (cooldowns[key]) {
  if (leftKeys.includes(key)) {
    showCooldownWarning("Player 1 skill is on cooldown!");
  } else if (rightKeys.includes(key)) {
    showCooldownWarning("Player 2 skill is on cooldown!");
  }
  return;
}

  switch (key) {
    // Skills
    case "q": setCooldown("q", 1000); castSpell("left", "left-beam.svg", 10, 5); break;
    case "w": setCooldown("w", 3000); castSpell("left", "lightning-left.svg", 15, 15); break;
    case "a": setCooldown("a", 6000); castShield("left"); break;
    case "e": setCooldown("e", 8000); castUltimate("left", "sparkles-blue.svg", 25, 30); break;

    case "u": setCooldown("u", 1000); castSpell("right", "right-beam.svg", 10, 5); break;
    case "i": setCooldown("i", 3000); castSpell("right", "lightning-right.svg", 15, 15); break;
    case "o": setCooldown("o", 6000); castShield("right"); break;
    case "p": setCooldown("p", 8000); castUltimate("right", "sparkles-red.svg", 25, 30); break;

    // Movement
    case "z": moveCharacter("left", -20); break;
    case "x": moveCharacter("left", 20); break;
    case "l": moveCharacter("right", -20); break;
    case "j": moveCharacter("right", 20); break;
  }
});

function triggerCollisionEffect(targetSide, impactY) {
  const effect = document.createElement("img");
  effect.src = "assets/collision.svg";
  effect.className = "collision-effect";

  const arena = document.querySelector(".arena");
  const targetCaster = document.querySelector(`.${targetSide}-caster`);
  const arenaRect = arena.getBoundingClientRect();
  const targetRect = targetCaster.getBoundingClientRect();

  const effectX = targetRect.left - arenaRect.left + targetRect.width / 2;

  effect.style.position = "absolute";
  effect.style.left = `${effectX}px`;
  effect.style.top = `${impactY}px`;
  effect.style.zIndex = 15;
  effect.style.width = "50px";

  document.getElementById("spells").appendChild(effect);

  setTimeout(() => {
    effect.remove();
  }, 500);
}




function castSpell(side, image, manaCost, damage) {
  if (stats[side].mana < manaCost) return;

   const distance = getDistanceBetweenCasters();
  const maxRange = image.includes("beam") ? 800 : 500;

  if (stats[side].mana < manaCost) return;
  if (distance > maxRange) {
    showRangeWarning(side);
    return;
  }

    const key = side === "left"
    ? (image.includes("beam") ? "q" : image.includes("lightning") ? "w" : "e")
    : (image.includes("beam") ? "u" : image.includes("lightning") ? "i" : "p");
  setCooldown(key, image.includes("beam") ? 1000 : image.includes("lightning") ? 3000 : 8000);
  
  const wand = document.querySelector(`.wand-${side}`);
  const char = document.getElementById(`${side}-char`);
  const target = side === "left" ? "right" : "left";
  const spell = document.createElement("img");

  spell.src = `assets/${image}`;
  spell.className = `spell`;
  spell.style.position = "absolute";

  const wandRect = wand.getBoundingClientRect();
  const arenaRect = document.querySelector(".arena").getBoundingClientRect();

  const startX = wandRect.left - arenaRect.left + wand.offsetWidth / 2;
  const startY = wandRect.top - arenaRect.top - 220; 

  spell.style.left = `${startX}px`;
  spell.style.top = `${startY}px`;

  document.getElementById("spells").appendChild(spell);

  spell.animate([
    { transform: "translateX(0)" },
    { transform: `translateX(${side === "left" ? 700 : -700}px)` }
  ], {
    duration: 1000,
    fill: "forwards"
  });

  if (image.includes("beam")) {
    audio.beam.currentTime = 0;
    audio.beam.play();
  } else if (image.includes("lightning")) {
    audio.lightning.currentTime = 0;
    audio.lightning.play();
  }

  char.src = `assets/${side}-char.svg`;
  char.style.transform = side === "left" ? "scaleX(-1)" : "scaleX(1)";
  wand.classList.add("casting", side === "left" ? "flick-left" : "flick-right");

  setTimeout(() => {
    spell.remove();
    wand.classList.remove("casting", "flick-left", "flick-right");
    char.src = `assets/lower-left.svg`;
    char.style.transform = side === "left" ? "scaleX(1)" : "scaleX(1)";

    stats[side].mana -= manaCost;

    if (!stats[target].shield) {
      stats[target].health -= damage;
      const impactY = startY; // use the same Y as the spell
triggerCollisionEffect(target, impactY);

      audio.hit.currentTime = 0;
      audio.hit.play();

      if (stats[target].health < 0) stats[target].health = 0;

      stats[side].mana += manaCost * 0.25;
      if (stats[side].mana > 100) stats[side].mana = 100;
    }

    updateBars(side);
    updateBars(target);
    checkVictory();
  }, 1000);
}

function castShield(side) {
  if (stats[side].mana < 20) return;
  stats[side].mana -= 20;
  stats[side].shield = true;
  updateBars(side);

  audio.shield.currentTime = 0;
  audio.shield.play();

  const char = document.getElementById(`${side}-char`);
  const wand = document.querySelector(`.wand-${side}`);

  char.src = `assets/both-hands.svg`;
  char.style.transform = side === "left" ? "scaleX(-1)" : "scaleX(1)";
  wand.style.display = "none";

  const shield = document.createElement("img");
  shield.src = `assets/shield.svg`;
  shield.className = `spell shield-spell shield-${side}`;
  document.getElementById("spells").appendChild(shield);

  setTimeout(() => {
    stats[side].shield = false;
    char.src = `assets/lower-left.svg`;
    char.style.transform = side === "left" ? "scaleX(1)" : "scaleX(1)";
    wand.style.display = "block";
    shield.remove();
    checkVictory();
  }, 1000);
}

function castUltimate(side, image, manaCost, damage) {
  if (stats[side].mana < manaCost) return;
  
   const distance = getDistanceBetweenCasters();
  const maxRange = image.includes("beam") ? 800 : 500;

  if (stats[side].mana < manaCost) return;
  if (distance > maxRange) {
    showRangeWarning(side);
    return;
  }

   const key = side === "left"
    ? (image.includes("beam") ? "q" : image.includes("lightning") ? "w" : "e")
    : (image.includes("beam") ? "u" : image.includes("lightning") ? "i" : "p");
  setCooldown(key, image.includes("beam") ? 1000 : image.includes("lightning") ? 3000 : 8000);

  const wand = document.querySelector(`.wand-${side}`);
  const char = document.getElementById(`${side}-char`);
  const target = side === "left" ? "right" : "left";
  const spell = document.createElement("img");

  spell.src = `assets/${image}`;
  spell.className = `spell spell-${side} ultimate`;
  spell.style.position = "absolute";

  const wandRect = wand.getBoundingClientRect();
  const arenaRect = document.querySelector(".arena").getBoundingClientRect();

  const startX = wandRect.left - arenaRect.left + wand.offsetWidth / 2;
  const startY = wandRect.top - arenaRect.top - 240; 

  spell.style.left = `${startX}px`;
  spell.style.top = `${startY}px`;

  document.getElementById("spells").appendChild(spell);

  audio.ultimate.currentTime = 0;
  audio.ultimate.play();

  spell.animate([
    { transform: "translateX(0) scale(0.5)" },
    { transform: `translateX(${side === "left" ? 700 : -700}px) scale(1.5)` }
  ], {
    duration: 1200,
    fill: "forwards"
  });

  char.src = `assets/${side}-char.svg`;
  char.style.transform = side === "left" ? "scaleX(-1)" : "scaleX(1)";
  wand.classList.add("casting", side === "left" ? "flick-left" : "flick-right");

  setTimeout(() => {
    spell.remove();
    wand.classList.remove("casting", "flick-left", "flick-right");
    char.src = `assets/lower-left.svg`;
    char.style.transform = side === "left" ? "scaleX(1)" : "scaleX(1)";

    stats[side].mana -= manaCost;

    if (!stats[target].shield) {
      stats[target].health -= damage;
      const impactY = startY; // use the same Y as the spell
triggerCollisionEffect(target, impactY);

      audio.hit.currentTime = 0;
      audio.hit.play();

      if (stats[target].health < 0) stats[target].health = 0;

      stats[side].mana += manaCost * 0.25;
      if (stats[side].mana > 100) stats[side].mana = 100;
    }

    updateBars(side);
    updateBars(target);
    checkVictory();
  }, 1200);
}

function moveCharacter(side, distance) {
  const caster = document.querySelector(`.${side}-caster`);
  const char = document.getElementById(`${side}-char`);
  const wand = document.querySelector(`.wand-${side}`);
  const currentPos = positions[side];
  const newPos = currentPos + distance;

  if (newPos >= 0 && newPos <= window.innerWidth - 220) {
    positions[side] = newPos;

    //Fix position by side
    if (side === "left") {
      caster.style.left = `${newPos}px`;
    } else {
      caster.style.right = `${newPos}px`;
    }

    char.src = `assets/run-${side}.svg`;
    char.style.transform = side === "left" ? "scaleX(-1)" : "scaleX(1)";
    wand.style.display = "none";

    setTimeout(() => {
      char.src = `assets/lower-left.svg`;
      char.style.transform = side === "left" ? "scaleX(1)" : "scaleX(1)";
      wand.style.display = "block";
    }, 300);
  }
}

setInterval(() => {
  if (gameOver) return;

  ["left", "right"].forEach(side => {
    if (stats[side].mana < 100) {
      stats[side].mana += 15;
      if (stats[side].mana > 100) stats[side].mana = 100;
      updateBars(side);
    }
  });
}, 5000); 

window.addEventListener("load", () => {
  audio.bg.volume = 0.8;
  audio.bg.play().catch(() => {
    console.warn("Background music will play on first interaction.");
  });
});

document.addEventListener("keydown", () => {
  if (audio.bg.paused) audio.bg.play();
});

function restartGame() {
  positions = { left: 50, right: 50 };
  stats = {
    left: { health: 100, mana: 100, shield: false },
    right: { health: 100, mana: 100, shield: false }
  };
  gameOver = false;

  document.getElementById("play-again").style.display = "none";

  updateBars("left");
  updateBars("right");

  document.querySelector(".left-caster").style.left = `${positions.left}px`;
  document.querySelector(".right-caster").style.right = `${positions.right}px`;

  document.getElementById("left-char").src = "assets/lower-left.svg";
  document.getElementById("right-char").src = "assets/lower-left.svg";

  // Remove any leftover spells
  document.getElementById("spells").innerHTML = "";
}

function showCooldownWarning(message) {
  const warning = document.getElementById("cooldown-warning");
  warning.innerText = message;  // Use the custom message passed
  warning.style.display = "block";

  clearTimeout(warning.timer); // Clear any previous timer
  warning.timer = setTimeout(() => {
    warning.style.display = "none";
  }, 1000);
}

function showRangeWarning(side) {
  const warning = document.getElementById("cooldown-warning");
  warning.innerText = side === "left"
    ? "Player 1's target is out of range!"
    : "Player 2's target is out of range!";
  warning.style.display = "block";

  clearTimeout(warning.timer);
  warning.timer = setTimeout(() => {
    warning.style.display = "none";
  }, 1000);
}


const toggleBtn = document.getElementById("toggle-instructions");
const instructionsBox = document.getElementById("instructions-box");

toggleBtn.addEventListener("click", () => {
  const isVisible = instructionsBox.style.display === "block";
  instructionsBox.style.display = isVisible ? "none" : "block";
  toggleBtn.textContent = isVisible ? "Show Controls" : "Hide Controls";
});

const closeBtn = document.getElementById("close-instructions");

closeBtn.addEventListener("click", () => {
  instructionsBox.style.display = "none";
  toggleBtn.textContent = "Show Controls";
});

