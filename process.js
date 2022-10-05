const iotum = {
  io:              { level: 1, roll: 6, value: 1, name: 'Io' },
  responsiveSynth: { level: 2, roll: 6, value: 3, name: 'Responsive Synth' },
  aptClay:         { level: 3, roll: 6, value: 5, name: 'Apt Clay' },
  bioCircuitry:    { level: 4, roll: 6, value: 10, name: 'Bio-Circuitry' },
  synthsteel:      { level: 4, roll: 6, value: 10, name: 'Synthsteel' },
  pliableMetal:    { level: 4, roll: 6, value: 10, name: 'Pliable Metal' },
  azureSteel:      { level: 5, roll: 6, value: 20, name: 'Azure Steel' },
  mimeticGel:      { level: 5, roll: 6, value: 20, name: 'Mimetic Gel' },
  quantium:        { level: 5, roll: 6, value: 20, name: 'Quantium' },
  amberCrystal:    { level: 6, roll: 6, value: 30, name: 'Amber Crystal' },
  protomatter:     { level: 6, num: 1, value: 60, name: 'Protomatter', large: true },
  thaumDust:       { level: 6, roll: 6, value: 30, name: 'Thaum Dust' },
  smartTissue:     { level: 7, roll: 6, value: 40, name: 'Smart Tissue' },
  psiranium:       { level: 7, num: 2, value: 40, name: 'Psiranium' },
  kaonDot:         { level: 7, num: 2, value: 40, name: 'Kaon Dot' },
  planSeed:        { level: 0, num: 1, value: 0, name: 'Plan Seed' },
  monopole:        { level: 7, num: 2, value: 40, name: 'Monopole' },
  midnightStone:   { level: 8, num: 2, value: 50, name: 'Midnight Stone' },
  oraculum:        { level: 8, num: 1, value: 50, name: 'Oraculum' },
  virtuonParticle: { level: 8, num: 1, value: 50, name: 'Virtuon Particle' },
  tamedIron:       { level: 9, num: 1, value: 70, name: 'Tamed Iron' },
  philosophine:    { level: 9, num: 1, value: 70, name: 'Philosophine' },
  dataOrb:         { level: 9, num: 1, value: 100, name: 'Data Orb' },
  scalarBosonRod:  { level: 9, num: 1, value: 100, name: 'Scalar Boson Rod' },
  cosmicFoam:      { level: 10, num: 1, value: 200, name: 'Cosmic Foam' },
};

const level = {
  1: 12,
  2: 24,
  3: 32,
  4: 50,
  5: 60,
  6: 75,
  7: 89,
  8: 95,
  9: 99,
  10: 100,
}

let salvage = {};
let currentInt = 0;
let intSpent = 0;
let totalValue = 0;

function processForm(e) {
  e.preventDefault();

  salvage = {}; // reset
  intSpent = 0;
  totalValue = 0;

  const form = e.target.parentElement;
  let fieldList = [].slice.call(form.elements, 0);
  fieldList = fieldList.filter((f) => {
    return f.id && f.type !== 'submit';
  });

  const fields = {
    numSources: 1,
    specific: 'random',
    salvageLevel: 0,
    useEffort: 1,
    int: 10,
    intAbove: 0,
    freeEffort: 0,
    edge: 1,
    proficiency: 0,
    assets1st: 0,
    assets2nd: 0,
    chanceBelow: 50,
    numRolls: 1,
    large: 0,
    maxEffort: 0,
    effort: 0,
  };

  fieldList.forEach((f) => {
    if (f.type === 'checkbox') {
      fields[f.id] = Number(f.checked);
    } else if (!isNaN(f.value)) {
      fields[f.id] = Number(f.value);
    } else {
      fields[f.id] = f.value;
    }
  });

  const specific = fields.specific !== 'random';
  const specificLevel = specific ? iotum[fields.specific].level : fields.salvageLevel;
  currentInt = fields.int;
  let freeEffort = fields.edge > 2 ? Math.min(fields.effort, Math.floor((fields.edge - 1) / 2)) : 0;

  for (let i = 0; i < fields.numSources; i++) {
    console.log(`Salvaging source number ${i + 1}.`);
    let diff1 = fields.salvageLevel - fields.proficiency - fields.assets1st;
    let diff2 = specificLevel - fields.proficiency - fields.assets2nd;

    console.log(`Search difficulty reduced by proficiency and assets to ${diff1}.`);
    console.log(`Salvage difficulty reduced by proficiency and assets to ${diff2}.`)

    let effort = freeEffort ? freeEffort + fields.freeEffort : 0;

    console.log(`Using ${effort} free level(s) of effort.`);

    while (salvageSource(diff1, diff2, freeEffort, effort, specific, fields)) {
      if (specific) {
        getIotum(iotum[fields.specific]);
      }

      for (let i = 0; i < fields.numRolls; i++) {
        getIotum(getRandomIotum(fields.salvageLevel, fields.large));
      }

      diff1++;
    }
  }

  displayResults();

  return false;
}

function salvageSource(diff1, diff2, freeEffort, effort, specific, fields) {
  let effortCost = 0;
  let effort1st = effort;
  let effort2nd = effort;

  if (fields.useEffort) {
    if (fields.maxEffort) {
      effort = fields.effort;
      effortCost = Math.max(2 * effort + 1 - fields.edge, 0);
      console.log('Using maximum effort:', fields.effort);
    } else {
      if ((currentInt - effortCost) > fields.intAbove) {
        while (((diff1 - effort1st) * 15) > fields.chanceBelow && (effort1st - fields.freeEffort) < fields.effort) {
          effort1st++;
        }

        console.log(`Using ${effort1st} level(s) of effort for first roll.`);
        effortCost += Math.max(2 * effort1st + 1 - fields.edge, 0);
      }

      if (specific) {
        if ((currentInt - effortCost) > fields.intAbove) {
          while (((diff2 - effort2nd) * 15) > fields.chanceBelow && (effort1st - fields.freeEffort) < fields.effort) {
            effort2nd++;
          }

          console.log(`Using ${effort2nd} level(s) of effort for second roll.`);
          effortCost += Math.max(2 * effort2nd + 1 - fields.edge, 0);
        }
      }
    }
  }

  console.log('Effort cost:', effortCost);

  diff1 -= effort1st;
  diff2 -= effort2nd;

  console.log(`Search difficulty reduced by effort to ${diff1}.`);
  console.log(`Salvage difficulty reduced by effort to ${diff2}.`)

  let success = false;

  if (diff1 > 0) {
    let roll = Math.ceil(Math.random() * 20);

    console.log(`Rolled a ${roll} against the required ${diff1 * 3}.`)

    if (roll >= (diff1 * 3)) {
      success = true;

      if (roll === 20) {
        effortCost = 0;
        console.log('Effort cost reduced to 0.');
      }

      if (specific)  {
        roll = Math.ceil(Math.random() * 20);

        console.log(`Rolled a ${roll} against the required ${diff2 * 3}.`)

        if (roll <= diff2) {
          success = false;
        }

        if (roll === 20) {
          effortCost = 0;
          console.log('Effort cost reduced to 0.');
        }
      }
    }
    // TODO: What to do with nat 1 and nat 19, 20.
  } else {
    success = true;
  }

  currentInt -= effortCost;
  intSpent += effortCost;

  console.log('Salvage roll success:', success);
  return success;
}

function getRandomIotum(salvageLevel, largeSource) {
  let roll = Math.ceil(Math.random() * level[salvageLevel]);
  console.log('Random roll result:', roll);

  let i;

  if (roll < 13) {
    i = iotum.io;
  } else if (roll < 25) {
    i = iotum.responsiveSynth;
  } else if (roll < 33) {
    i = iotum.aptClay;
  } else if (roll < 39) {
    i = iotum.bioCircuitry;
  } else if (roll < 45) {
    i = iotum.synthsteel;
  } else if (roll < 51) {
    i = iotum.pliableMetal;
  } else if (roll < 56) {
    i = iotum.azureSteel;
  } else if (roll < 61) {
    i = iotum.mimeticGel;
  } else if (roll < 66) {
    i = iotum.quantium;
  } else if (roll < 70) {
    i = iotum.amberCrystal;
  } else if (roll < 72) {
    i = iotum.protomatter;
  } else if (roll < 76) {
    i = iotum.thaumDust;
  } else if (roll < 79) {
    i = iotum.smartTissue;
  } else if (roll < 82) {
    i = iotum.psiranium;
  } else if (roll < 85) {
    i = iotum.kaonDot;
  } else if (roll < 87) {
    i = iotum.planSeed;
  } else if (roll < 90) {
    i = iotum.monopole;
  } else if (roll < 92) {
    i = iotum.midnightStone;
  } else if (roll < 94) {
    i = iotum.oraculum;
  } else if (roll < 96) {
    i = iotum.virtuonParticle;
  } else if (roll === 96) {
    i = iotum.tamedIron;
  } else if (roll === 97) {
    i = iotum.philosophine;
  } else if (roll === 98) {
    i = iotum.dataOrb;
  } else if (roll === 99) {
    i = iotum.scalarBosonRod;
  } else {
    i = iotum.cosmicFoam;
  }

  if (i.large && !largeSource) {
    i = iotum.thaumDust;
  }

  return i;
}

function getIotum(i) {
  let num = i.num ? i.num : Math.ceil(Math.random() * i.roll);
  let parts = num * i.level;
  let value = num * i.value;

  salvage[i.name] = salvage[i.name] ? salvage[i.name] + num : num;
  salvage['Parts'] = salvage['Parts'] ? salvage['Parts'] + parts : parts;
  totalValue += value;

  console.log(`Salvaged ${num} units of ${i.name} and ${parts} Parts.`);
}

const submitButton = document.getElementById('submit');
submitButton.onclick = processForm;

function displayResults() {
  const summary = document.getElementById('result-items');
  summary.replaceChildren();

  for (const res in salvage) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${res}:</b> ${salvage[res]} unit(s)`;
    summary.appendChild(li);
  }

  const value = document.createElement('li');
  value.innerHTML = `<b>Total Value:</b> ${totalValue} io`;
  summary.appendChild(value);

  const intCost = document.createElement('li');
  intCost.innerHTML = `<b>Int Spent:</b> ${intSpent}`;
  summary.appendChild(intCost);

  const remaining = document.createElement('li');
  remaining.innerHTML = `<b>Remaining Int:</b> ${currentInt}`;
  summary.appendChild(remaining);
}