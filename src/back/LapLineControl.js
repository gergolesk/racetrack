const {getRunningSession, hasRunningSession, updateSession} = require("./RaceSession");

// Backend logic
let cars = [];
let runningSession = null;

// General helper functions
const updateLeaderboard = (io) => {
    const leaderboard = [...cars]
        .sort((a, b) => {
            if (a.fastestLap === null || a.fastestLap === 0) return 1;
            if (b.fastestLap === null || b.fastestLap === 0) return -1;
            return a.fastestLap - b.fastestLap;
        })
        .map(car => ({
            number: car.number,
            name: car.name,
            fastestLap: car.fastestLap,
            currentLap: car.currentLap > 0 ? car.currentLap : 'Not started',
        }));

    io.emit('leaderboard-update', leaderboard);
};

const loadCarsFromSession = () => {
    try {
        runningSession = getRunningSession();
        if (runningSession) {
            cars = runningSession.drivers.map(driver => ({
                number: driver.carNumber,
                laps: Array.isArray(driver.laps) ? driver.laps : [],
                fastestLap: driver.fastestLap || null,
                currentLap: Array.isArray(driver.laps) ? driver.laps.length : 0,
                name: driver.name,
            }));
            console.log('Cars loaded');
        } else {
            console.log('No upcoming sessions found');
        }
    } catch (err) {
        console.error('Error reading cars:', err);
    }
};

const saveCarToSession = (car) => {
    if (!runningSession) return;

    const driverIndex = runningSession.drivers.findIndex(d => d.carNumber === car.number);
    if (driverIndex !== -1) {
        runningSession.drivers[driverIndex] = {
            ...runningSession.drivers[driverIndex],
            laps: car.laps,
            fastestLap: car.fastestLap,
            currentLap: car.currentLap,
        };

        updateSession({id: runningSession.id, sessionData: {drivers: runningSession.drivers}});
    }
};

// LapLineControl function
const LapLineControl = (socket, io) => {
    if (hasRunningSession()) {
        loadCarsFromSession();
        socket.emit('init-cars', cars);
        updateLeaderboard(io);
    }

    socket.on('start_race', () => {
        loadCarsFromSession();
        io.emit('init-cars', cars);
        updateLeaderboard(io);
    });

    socket.on('request-init-cars', () => {
        console.log(`Received request-init-cars from ${socket.id}`);
        if (hasRunningSession()) {
            loadCarsFromSession();
            socket.emit('init-cars', cars);
        }
        updateLeaderboard(io);
    });

    socket.on('lap-cross', ({carNumber, timestamp}) => {
        let car = cars.find(c => c.number === carNumber);

        if (!car) {
            car = {number: carNumber, laps: [], fastestLap: null, currentLap: 0};
            cars.push(car);
        }

        const lastLapTime = car.laps.length > 0 ? car.laps[car.laps.length - 1] : timestamp;
        const lapTime = timestamp - lastLapTime;

        if (car.laps.length > 0) {
            console.log(`Car #${carNumber} finished a lap: ${lapTime} ms`);
        } else {
            console.log(`Car #${carNumber} started its first lap.`);
        }

        car.laps.push(timestamp);
        car.fastestLap = !car.fastestLap || lapTime < car.fastestLap ? lapTime : car.fastestLap;
        car.currentLap += 1;

        saveCarToSession(car);

        io.emit('update-car', {
            number: car.number,
            fastestLap: car.fastestLap,
            currentLap: car.currentLap,
        });

        updateLeaderboard(io);
    });
};

module.exports = LapLineControl;