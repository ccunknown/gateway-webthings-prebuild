"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
function extractProperty(href) {
    return href.match(/properties\/([^/]+)/)[1];
}
function extractThing(href) {
    return href.match(/things\/([^/]+)/)[1];
}
function migrateTimeTrigger(trigger) {
    if (trigger.localized) {
        return null;
    }
    // If the time trigger has not been localized, it's still in UTC time
    const parts = trigger.time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    // Convert from UTC to local
    const oldTime = new Date();
    const offset = oldTime.getTimezoneOffset();
    oldTime.setUTCHours(hours, minutes, 0, 0);
    const newTime = new Date(oldTime.getTime() + offset * 60 * 1000);
    const hoursStr = newTime.getHours().toString().padStart(2, '0');
    const minutesStr = newTime.getMinutes().toString().padStart(2, '0');
    return {
        type: 'TimeTrigger',
        time: `${hoursStr}:${minutesStr}`,
        localized: true,
    };
}
function migrateProperty(prop) {
    if (!prop.href) {
        return null;
    }
    const base = Object.assign({}, prop);
    delete base.href;
    return Object.assign(base, {
        id: extractProperty(prop.href),
        thing: extractThing(prop.href),
    });
}
function migrateThing(thing) {
    if (typeof thing !== 'object') {
        return null;
    }
    if (!thing.href) {
        return null;
    }
    return extractThing(thing.href);
}
function migratePart(part) {
    let changed = false;
    const newPart = Object.assign({}, part);
    if (part.type === 'MultiTrigger') {
        newPart.triggers = part.triggers.map((child) => {
            const newChild = migratePart(child);
            if (newChild) {
                changed = true;
            }
            return newChild || child;
        });
    }
    if (part.type === 'MultiEffect') {
        newPart.effects = part.effects.map((child) => {
            const newChild = migratePart(child);
            if (newChild) {
                changed = true;
            }
            return newChild || child;
        });
    }
    if (part.type === 'TimeTrigger') {
        const newTrigger = migrateTimeTrigger(part);
        if (newTrigger) {
            changed = true;
            Object.assign(newPart, newTrigger);
        }
    }
    else if (part.property) {
        const newProp = migrateProperty(part.property);
        if (newProp) {
            changed = true;
        }
        newPart.property =
            newProp || part.property;
    }
    else if (part.thing) {
        const newThing = migrateThing(part.thing);
        if (newThing) {
            changed = true;
        }
        newPart.thing =
            newThing || part.thing;
    }
    if (!changed) {
        return null;
    }
    return newPart;
}
function migrate(oldRule) {
    const newRule = Object.assign({}, oldRule);
    const newTrigger = migratePart(oldRule.trigger);
    let changed = false;
    if (newTrigger) {
        changed = true;
        newRule.trigger = newTrigger;
    }
    const newEffect = migratePart(oldRule.effect);
    if (newEffect) {
        changed = true;
        newRule.effect = newEffect;
    }
    if (!changed) {
        return null;
    }
    return newRule;
}
exports.migrate = migrate;
//# sourceMappingURL=DatabaseMigrate.js.map