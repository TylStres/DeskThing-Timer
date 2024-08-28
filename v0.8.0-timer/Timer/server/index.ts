import { DeskThing as DK } from 'deskthing-server';
const DeskThing = DK.getInstance();
export { DeskThing } // Required export of this exact name for the server to connect

let timerInterval: NodeJS.Timeout | null = null;
let duration = 0;
let isRunning = false;

const start = async () => {
    console.log('Server starting...');
    let Data = await DeskThing.getData()
    
    // Initialize timer data if it doesn't exist
    if (!Data?.settings?.timer) {
        Data.settings = { timer: { duration: 0, isRunning: false } };
        await DeskThing.saveData(Data);
    }

    duration = Data.settings.timer.duration;
    isRunning = Data.settings.timer.isRunning;

    if (isRunning) {
        startTimer();
    }

    // Handle client messages
    DeskThing.on('message', handleMessage);
}

const handleMessage = async (message: any) => {
    console.log('Received message:', message);
    switch (message.type) {
        case 'startPause':
            isRunning = !isRunning;
            if (isRunning) {
                startTimer();
            } else {
                stopTimer();
            }
            break;
        case 'reset':
            resetTimer();
            break;
        case 'setDuration':
            duration = Math.max(0, message.data.duration);
            break;
    }

    await updateClientAndSaveData();
}

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(async () => {
        if (duration > 0) {
            duration -= 1/60;
            if (duration <= 0) {
                duration = 0;
                isRunning = false;
                stopTimer();
                DeskThing.sendMessage({ type: 'timerEnd' });
            }
            await updateClientAndSaveData();
        }
    }, 1000);
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

const resetTimer = () => {
    duration = 0;
    isRunning = false;
    stopTimer();
}

const updateClientAndSaveData = async () => {
    const timerData = { duration, isRunning };
    console.log('Updating client with:', timerData);
    await DeskThing.sendMessage({ type: 'timerUpdate', data: timerData });
    await DeskThing.saveData({ settings: { timer: timerData } });
}

const stop = async () => {
    stopTimer();
}

// Main Entrypoint of the server
DeskThing.on('start', start)

// Main exit point of the server
DeskThing.on('stop', stop)