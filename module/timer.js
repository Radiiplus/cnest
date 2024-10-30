let timersMap = {};
let activeTimersCount = 0;

const setTimers = (timers) => {
    activeTimersCount = timers.length;
    timers.forEach(({ duration, tag, callback }) => {
        console.log(`Timer set with tag: ${tag} for ${duration / 1000} seconds.`);
        const timerId = setTimeout(() => {
            console.log(`Timer up! Tag: ${tag}`);
            delete timersMap[tag]; 
            if (--activeTimersCount === 0) console.log('All timers have completed.');
            callback && callback();
        }, duration);
        timersMap[tag] = { active: true, duration, timerId, callback };
    });
};

const checkTimerStatus = (tag) => timersMap[tag] || { active: false };

const resetTimer = (tag, newDuration) => {
    const { active, timerId, callback } = checkTimerStatus(tag);
    if (active) {
        clearTimeout(timerId);
        console.log(`Resetting timer with tag: ${tag} to ${newDuration / 1000} seconds.`);
        timersMap[tag] = {
            active: true,
            duration: newDuration,
            timerId: setTimeout(() => {
                console.log(`Timer up! Tag: ${tag}`);
                delete timersMap[tag];
                if (--activeTimersCount === 0) console.log('All timers have completed after a reset.');
                callback && callback();
            }, newDuration),
            callback
        };
    } else {
        console.log(`No active timer found for tag: ${tag}`);
    }
};

module.exports = { setTimers, checkTimerStatus, resetTimer };
