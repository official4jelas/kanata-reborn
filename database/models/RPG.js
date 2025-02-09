import db from '../config.js';
import moment from 'moment';
import User from './User.js';

class RPG {
    static async initPlayer(userId) {
        return new Promise((resolve, reject) => {
            db.run('INSERT OR IGNORE INTO rpg_stats (user_id) VALUES (?)', [userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    static async getStats(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM rpg_stats WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async hunt(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHunt = stats.last_hunt ? new Date(stats.last_hunt) : new Date(0);
                
                // Cooldown 5 menit
                if (now - lastHunt < 300000) {
                    reject(new Error(`Tunggu ${Math.ceil((300000 - (now - lastHunt)) / 1000)} detik lagi`));
                    return;
                }

                // Generate random rewards
                const goldEarned = Math.floor(Math.random() * 100) + 50;
                const expEarned = Math.floor(Math.random() * 50) + 25;
                const healthLost = Math.floor(Math.random() * 20) + 5;

                // Update stats
                db.run(`UPDATE rpg_stats SET 
                    gold = gold + ?,
                    health = CASE 
                        WHEN health - ? <= 0 THEN 1 
                        ELSE health - ? 
                    END,
                    last_hunt = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [goldEarned, healthLost, healthLost, userId],
                async (err) => {
                    if (err) reject(err);
                    
                    // Add exp
                    const expResult = await User.addExp(userId, expEarned);
                    
                    resolve({
                        goldEarned,
                        expEarned,
                        healthLost,
                        levelUp: expResult.levelUp,
                        newLevel: expResult.newLevel
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async heal(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHeal = stats.last_heal ? new Date(stats.last_heal) : new Date(0);
                
                // Cooldown 3 menit
                if (now - lastHeal < 180000) {
                    reject(new Error(`Tunggu ${Math.ceil((180000 - (now - lastHeal)) / 1000)} detik lagi`));
                    return;
                }

                const healAmount = 30;
                
                db.run(`UPDATE rpg_stats SET 
                    health = CASE 
                        WHEN health + ? > max_health THEN max_health 
                        ELSE health + ? 
                    END,
                    last_heal = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [healAmount, healAmount, userId],
                (err) => {
                    if (err) reject(err);
                    resolve(healAmount);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getInventory(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT i.name, i.type, i.rarity, inv.quantity, i.effect, i.description 
                FROM inventory inv 
                JOIN items i ON inv.item_id = i.id 
                WHERE inv.user_id = ?`,
            [userId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async useItem(userId, itemName) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item) {
                    reject(new Error('Item tidak ditemukan'));
                    return;
                }

                const effect = JSON.parse(item.effect);
                let updateQuery = 'UPDATE rpg_stats SET ';
                const updateValues = [];

                if (effect.health) {
                    updateQuery += 'health = CASE WHEN health + ? > max_health THEN max_health ELSE health + ? END, ';
                    updateValues.push(effect.health, effect.health);
                }
                if (effect.mana) {
                    updateQuery += 'mana = CASE WHEN mana + ? > max_mana THEN max_mana ELSE mana + ? END, ';
                    updateValues.push(effect.mana, effect.mana);
                }

                updateQuery = updateQuery.slice(0, -2); // Remove last comma
                updateQuery += ' WHERE user_id = ?';
                updateValues.push(userId);

                db.run(updateQuery, updateValues, (err) => {
                    if (err) reject(err);
                    resolve(effect);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async scavenge(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastScavenge = stats.last_scavenge ? new Date(stats.last_scavenge) : new Date(0);
                
                // Cooldown 2 menit
                if (now - lastScavenge < 120000) {
                    reject(new Error(`Tunggu ${Math.ceil((120000 - (now - lastScavenge)) / 1000)} detik lagi`));
                    return;
                }

                if (stats.energy < 10) {
                    reject(new Error('Energi tidak cukup! Minimal butuh 10 energi'));
                    return;
                }

                // Generate random rewards
                const goldEarned = Math.floor(Math.random() * 50) + 20;
                const expEarned = Math.floor(Math.random() * 30) + 10;
                const energyLost = 10;

                // Update stats
                db.run(`UPDATE rpg_stats SET 
                    gold = gold + ?,
                    energy = energy - ?,
                    last_scavenge = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [goldEarned, energyLost, userId],
                async (err) => {
                    if (err) reject(err);
                    const expResult = await User.addExp(userId, expEarned);
                    resolve({
                        goldEarned,
                        expEarned,
                        energyLost,
                        levelUp: expResult.levelUp,
                        newLevel: expResult.newLevel
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async steal(userId, targetId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const targetStats = await this.getStats(targetId);
                
                if (!targetStats) {
                    reject(new Error('Target tidak ditemukan'));
                    return;
                }

                const now = new Date();
                const lastSteal = stats.last_steal ? new Date(stats.last_steal) : new Date(0);
                
                // Cooldown 10 menit
                if (now - lastSteal < 600000) {
                    reject(new Error(`Tunggu ${Math.ceil((600000 - (now - lastSteal)) / 1000)} detik lagi`));
                    return;
                }

                if (stats.jail_time && new Date(stats.jail_time) > now) {
                    reject(new Error('Kamu masih di penjara!'));
                    return;
                }

                // 40% chance to fail and go to jail
                if (Math.random() < 0.4) {
                    const jailTime = new Date(now.getTime() + 300000); // 5 menit di penjara
                    db.run(`UPDATE rpg_stats SET 
                        jail_time = ? 
                        WHERE user_id = ?`,
                    [jailTime.toISOString(), userId]);
                    reject(new Error('Kamu tertangkap dan dipenjara selama 5 menit!'));
                    return;
                }

                const stolenAmount = Math.floor(targetStats.gold * 0.1); // Steal 10% of target's gold
                
                db.run(`UPDATE rpg_stats SET 
                    gold = gold + ?,
                    last_steal = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [stolenAmount, userId]);

                db.run(`UPDATE rpg_stats SET 
                    gold = gold - ? 
                    WHERE user_id = ?`,
                [stolenAmount, targetId]);

                resolve(stolenAmount);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async eat(userId, foodName) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(foodName);
                if (!item || item.type !== 'food') {
                    reject(new Error('Makanan tidak valid'));
                    return;
                }

                const inventory = await this.getInventory(userId);
                const hasItem = inventory.find(i => i.name === foodName);
                if (!hasItem || hasItem.quantity < 1) {
                    reject(new Error('Kamu tidak memiliki makanan ini'));
                    return;
                }

                const effect = JSON.parse(item.effect);
                db.run(`UPDATE rpg_stats SET 
                    hunger = CASE WHEN hunger + ? > 100 THEN 100 ELSE hunger + ? END,
                    energy = CASE WHEN energy + ? > 100 THEN 100 ELSE energy + ? END
                    WHERE user_id = ?`,
                [effect.hunger, effect.hunger, effect.energy, effect.energy, userId]);

                // Kurangi item dari inventory
                await this.removeItem(userId, item.id, 1);

                resolve(effect);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async drink(userId, drinkName) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(drinkName);
                if (!item || item.type !== 'drink') {
                    reject(new Error('Minuman tidak valid'));
                    return;
                }

                const inventory = await this.getInventory(userId);
                const hasItem = inventory.find(i => i.name === drinkName);
                if (!hasItem || hasItem.quantity < 1) {
                    reject(new Error('Kamu tidak memiliki minuman ini'));
                    return;
                }

                const effect = JSON.parse(item.effect);
                db.run(`UPDATE rpg_stats SET 
                    thirst = CASE WHEN thirst + ? > 100 THEN 100 ELSE thirst + ? END,
                    energy = CASE WHEN energy + ? > 100 THEN 100 ELSE energy + ? END
                    WHERE user_id = ?`,
                [effect.thirst, effect.thirst, effect.energy, effect.energy, userId]);

                await this.removeItem(userId, item.id, 1);

                resolve(effect);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async shop() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM items WHERE price > 0', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async buy(userId, itemName, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item) {
                    reject(new Error('Item tidak ditemukan'));
                    return;
                }

                const stats = await this.getStats(userId);
                const totalCost = item.price * quantity;

                if (stats.gold < totalCost) {
                    reject(new Error('Gold tidak cukup'));
                    return;
                }

                db.run(`UPDATE rpg_stats SET gold = gold - ? WHERE user_id = ?`,
                [totalCost, userId]);

                await this.addItem(userId, item.id, quantity);

                resolve({
                    item: item.name,
                    quantity,
                    totalCost
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async sell(userId, itemName, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item) {
                    reject(new Error('Item tidak ditemukan'));
                    return;
                }

                const inventory = await this.getInventory(userId);
                const hasItem = inventory.find(i => i.name === itemName);
                if (!hasItem || hasItem.quantity < quantity) {
                    reject(new Error('Item tidak cukup'));
                    return;
                }

                const sellPrice = Math.floor(item.price * 0.7); // Jual 70% dari harga beli
                const totalEarned = sellPrice * quantity;

                db.run(`UPDATE rpg_stats SET gold = gold + ? WHERE user_id = ?`,
                [totalEarned, userId]);

                await this.removeItem(userId, item.id, quantity);

                resolve({
                    item: item.name,
                    quantity,
                    totalEarned
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async enterDungeon(userId, dungeonName) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const dungeon = await this.getDungeonByName(dungeonName);
                
                if (stats.level < dungeon.min_level) {
                    reject(new Error(`Level kamu terlalu rendah! Minimal level ${dungeon.min_level}`));
                    return;
                }

                // Cek cooldown
                const lastDungeon = await this.getLastDungeonTime(userId);
                if (lastDungeon) {
                    const cooldownEnd = moment(lastDungeon).add(dungeon.cooldown_minutes, 'minutes');
                    if (moment().isBefore(cooldownEnd)) {
                        const remaining = moment.duration(cooldownEnd.diff(moment()));
                        reject(new Error(`Dungeon masih cooldown! Tunggu ${remaining.minutes()} menit lagi`));
                        return;
                    }
                }

                // Kalkulasi battle
                const playerDamage = stats.strength - dungeon.defense;
                const dungeonDamage = dungeon.attack - stats.defense;
                let playerHP = stats.health;
                let dungeonHP = dungeon.hp;
                let battleLog = [];

                while (playerHP > 0 && dungeonHP > 0) {
                    // Player turn
                    dungeonHP -= Math.max(1, playerDamage);
                    battleLog.push(`⚔️ Kamu menyerang dungeon boss! (-${Math.max(1, playerDamage)} HP)`);
                    
                    if (dungeonHP <= 0) break;

                    // Dungeon turn
                    playerHP -= Math.max(1, dungeonDamage);
                    battleLog.push(`💢 Boss menyerang! (-${Math.max(1, dungeonDamage)} HP)`);
                }

                // Update stats dan rewards
                if (playerHP > 0) {
                    // Player menang
                    const drops = JSON.parse(dungeon.item_drops);
                    let droppedItems = [];

                    for (const [item, chance] of Object.entries(drops)) {
                        if (Math.random() < chance) {
                            await this.addItem(userId, item, 1);
                            droppedItems.push(item);
                        }
                    }

                    await this.updateDungeonStats(userId, dungeon.exp_reward, dungeon.gold_reward);
                    
                    resolve({
                        win: true,
                        battleLog,
                        rewards: {
                            exp: dungeon.exp_reward,
                            gold: dungeon.gold_reward,
                            items: droppedItems
                        }
                    });
                } else {
                    // Player kalah
                    resolve({
                        win: false,
                        battleLog
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static async learnSkill(userId, skillName) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const skill = await this.getSkillByName(skillName);

                if (stats.level < skill.min_level) {
                    reject(new Error(`Level kamu terlalu rendah! Minimal level ${skill.min_level}`));
                    return;
                }

                if (stats.gold < skill.price) {
                    reject(new Error(`Gold tidak cukup! Butuh ${skill.price} gold`));
                    return;
                }

                await this.addUserSkill(userId, skill.id);
                await this.updateGold(userId, -skill.price);

                resolve(skill);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async useSkill(userId, skillName, targetId = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const skill = await this.getSkillByName(skillName);
                const userSkill = await this.getUserSkill(userId, skill.id);

                if (!userSkill) {
                    reject(new Error('Kamu belum mempelajari skill ini!'));
                    return;
                }

                // Cek cooldown
                if (userSkill.last_used) {
                    const cooldownEnd = moment(userSkill.last_used).add(skill.cooldown_seconds, 'seconds');
                    if (moment().isBefore(cooldownEnd)) {
                        const remaining = moment.duration(cooldownEnd.diff(moment()));
                        reject(new Error(`Skill masih cooldown! Tunggu ${remaining.seconds()} detik lagi`));
                        return;
                    }
                }

                if (stats.mana < skill.mana_cost) {
                    reject(new Error(`Mana tidak cukup! Butuh ${skill.mana_cost} MP`));
                    return;
                }

                // Proses efek skill
                const effect = JSON.parse(skill.effect);
                let result = {
                    skillName: skill.name,
                    effect: {}
                };

                switch (skill.type) {
                    case 'attack':
                        if (!targetId) {
                            reject(new Error('Target tidak ditemukan!'));
                            return;
                        }
                        await this.applyDamage(targetId, effect.damage);
                        result.effect.damage = effect.damage;
                        break;

                    case 'support':
                        if (effect.health) {
                            await this.heal(userId, effect.health);
                            result.effect.heal = effect.health;
                        }
                        break;

                    case 'defense':
                        await this.addTemporaryDefense(userId, effect.defense);
                        result.effect.defense = effect.defense;
                        break;
                }

                // Update mana dan cooldown
                await this.updateMana(userId, -skill.mana_cost);
                await this.updateSkillCooldown(userId, skill.id);

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getQuests(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT q.*, uq.progress, uq.completed 
                   FROM quests q 
                   LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = ?
                   WHERE q.min_level <= (SELECT level FROM rpg_stats WHERE user_id = ?)`,
            [userId, userId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async updateQuestProgress(userId, questType, amount = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const quests = await this.getActiveQuests(userId, questType);
                let completedQuests = [];

                for (const quest of quests) {
                    const newProgress = quest.progress + amount;
                    if (newProgress >= quest.target_amount && !quest.completed) {
                        // Quest completed
                        await this.completeQuest(userId, quest.id);
                        completedQuests.push(quest);
                    } else {
                        // Update progress
                        await this.updateProgress(userId, quest.id, newProgress);
                    }
                }

                resolve(completedQuests);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default RPG; 