// function to handle stat leveling
export function onStatLevelUp(event) {
  event.preventDefault();

  const key = event.currentTarget.dataset.key;
  const statBaseKey = `${key}Base`;
  const statTotalKey = `${key}Total`;
  const statLabel = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter for the label
  const statValue = this.actor.system[statTotalKey];
  const cost = 300 + Math.floor(statValue / 10) * 100;

  console.log(`Attempting to level up ${statLabel}`);
  console.log(`Current ${statLabel} value: ${statValue}`);
  console.log(`Cost to level up: ${cost} Coins`);
  console.log(`Current Armor Total: ${this.actor.system.armorTotal}`);

  new Dialog({
    title: 'Level Up!',
    content: `
      <div class='stat-dialog'>
        <p>${statLabel} Lv. ${statValue} → ${statLabel} Lv. ${statValue + 1}</p>
        <p>Cost: ${cost} Coins</p>
      </div>`,
    buttons: {
      yes: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Yes',
        callback: () => {
          if (this.actor.system.coins >= cost) {
            const updatedCoins = this.actor.system.coins - cost;
            const newStatValue = this.actor.system[statBaseKey] + 1;

            console.log(`Updating ${statLabel} to new value: ${newStatValue}`);
            console.log(`Updated coins: ${updatedCoins}`);

            // Prepare the data object for updating
            let updateData = {
              [`system.coins`]: updatedCoins,
              [`system.${statBaseKey}`]: newStatValue,
            };

            // Add health if Constitution is leveled up
            if (key === 'con') {
              const healthGain = 2.5; // Rounding the 2.5 heal
              updateData['system.healthCurrent'] =
                (this.actor.system.healthCurrent || 0) + healthGain;
              console.log(`Health gain: ${healthGain}`);
            }

            // Add mana if Intelligence is leveled up
            if (key === 'int') {
              const manaGain = 5;
              updateData['system.manaCurrent'] =
                (this.actor.system.manaCurrent || 0) + manaGain;
              console.log(`Mana gain: ${manaGain}`);
            }

            // Apply updates to actor
            this.actor.update(updateData).then(() => {
              console.log('Actor updated successfully');
              // Recalculate derived values
              this.actor.prepareDerivedData();
              console.log(
                `Recalculated Armor Total: ${this.actor.system.armorTotal}`
              );
              this.render(); // Re-render the sheet
            });
          } else {
            ui.notifications.error('Not enough coins to level up!');
            console.log('Not enough coins to level up!');
          }
        },
      },
      no: {
        icon: '<i class="fas fa-times"></i>',
        label: 'No',
        callback: () => console.log('Level up canceled'),
      },
    },
    default: 'no',
    close: () => console.log('Dialog closed without choosing.'),
  }).render(true, { width: 400, height: 200 });
}
