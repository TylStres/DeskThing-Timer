import { DeskThing as DK, Settings } from 'deskthing-server'

export type TimerData = {
  time: number | null
  isActive: boolean
  timerType: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK'
}

type settings = {
  pomodoro_duration: {
    value: string;
    label: string;
    options: {
      value: string;
      label: string;
    }[]
  }
  short_break_duration: {
    value: string;
    label: string;
    options: {
      value: string;
      label: string;
    }[]
  }
  long_break_duration: {
    value: string;
    label: string;
    options: {
      value: string;
      label: string;
    }[]
  }
}

const TIMER_TYPES = {
  POMODORO: { value: 'pomodoro', label: 'Pomodoro', duration: 25 * 60 },
  SHORT_BREAK: { value: 'short_break', label: 'Short Break', duration: 5 * 60 },
  LONG_BREAK: { value: 'long_break', label: 'Long Break', duration: 15 * 60 },
}

type SavedData ={
  settings?: settings | Settings
  timerState?: TimerData
}

type method = 'get' | 'put' | 'post' | 'delete'

type body = {
  position_ms: number
}

export class TimerHandler {
  public Data: SavedData = {}
  private DeskThing: DK
  private timerInterval: NodeJS.Timeout | null = null
  
  constructor() {
    this.DeskThing = DK.getInstance()
    this.DeskThing.on('data', (data) => {
      this.Data = data
      console.log('Got more data', data)
    })
    this.initializeData()
  }

  async initializeData() {
    const data = await this.DeskThing.getData()
    if (data) {
      this.Data = data
    }

    if (!this.Data.settings) {
      const settings: settings = {
        pomodoro_duration: {
          value: '25',
          label: '25 minutes',
          options: [
            { value: '5', label: '5 minutes' },
            { value: '10', label: '10 minutes' },
            { value: '25', label: '25 minutes' }
          ]
        },
        short_break_duration: {
          value: '5',
          label: '5 minutes',
          options: [
            { value: '1', label: '1 minute' },
            { value: '2', label: '2 minutes' },
            { value: '5', label: '5 minutes' }
          ]
        },
        long_break_duration: {
          value: '15',
          label: '15 minutes',
          options: [
            { value: '5', label: '5 minutes' },
            { value: '10', label: '10 minutes' },
            { value: '15', label: '15 minutes' }
          ]
        }
      }
      this.Data.settings = settings
      await this.DeskThing.saveData({ settings })
    }
    
    if (!this.Data.timerState) {
      const settings = this.Data.settings as Settings;
      this.Data.timerState = settings.timerState ? JSON.parse(settings.timerState as string) : {
        time: TIMER_TYPES.POMODORO.duration,
        isActive: false,
        timerType: 'POMODORO'
      };
    }

    this.sendTimerUpdate()

    if (this.Data.timerState.isActive) {
      this.startTimer()
    }
  }

  private sendTimerUpdate() {
    if (!this.Data.timerState) return;
    const { time, isActive, timerType } = this.Data.timerState;
    const message = {
      app: 'timer',
      type: 'update',
      data: {
        time,
        isActive,
        timerType: TIMER_TYPES[timerType].label
      }
    };
    this.DeskThing.sendDataToClient(message);
  }

  async saveTimerState(): Promise<void> {
    if (!this.Data.timerState) return Promise.resolve();
    const settings = this.Data.settings as Settings;
    settings.timerState = JSON.stringify(this.Data.timerState);
    return this.DeskThing.saveData({ settings });
  }

  private startTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    this.timerInterval = setInterval(() => {
      if (this.Data.timerState?.isActive && this.Data.timerState.time > 0) {
        this.Data.timerState.time--
        this.sendTimerUpdate()
        this.saveTimerState()
      } else if (this.Data.timerState?.time === 0 && this.Data.timerState?.isActive) {
        this.timerFinished()
      }
    }, 1000)
  }

  private timerFinished() {
    if (!this.Data.timerState) return
    this.Data.timerState.isActive = false
    this.DeskThing.sendLog('Timer Finished')
    this.sendTimerUpdate()
    this.saveTimerState()
    // Play a sound when the timer finishes
    this.DeskThing.sendDataToClient({
      app: 'timer',
      type: 'playSound',
      data: { sound: 'timerFinished' }
    } as PlaySoundMessage)
  }

  async startTimer() {
    if (!this.Data.timerState) return 'No timer state';
    this.Data.timerState.isActive = true;
    this.startTimerInterval();
    await this.saveTimerState();
    this.sendTimerUpdate();
    return 'Timer started';
  }

  async pauseTimer() {
    if (!this.Data.timerState) return 'No timer state';
    this.Data.timerState.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    await this.saveTimerState();
    this.sendTimerUpdate();
    return 'Timer paused';
  }

  async resetTimer() {
    if (!this.Data.timerState) return 'No timer state';
    this.Data.timerState.isActive = false;
    this.Data.timerState.time = TIMER_TYPES[this.Data.timerState.timerType].duration;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    await this.saveTimerState();
    this.sendTimerUpdate();
    return 'Timer reset';
  }

  async changeTimerType(newType: keyof typeof TIMER_TYPES) {
    if (!this.Data.timerState) return 'No timer state';
    this.Data.timerState.timerType = newType;
    this.Data.timerState.time = TIMER_TYPES[newType].duration;
    await this.saveTimerState();
    this.sendTimerUpdate();
    return `Timer type changed to ${newType}`;
  }

  async returnTimerState() {
    this.sendTimerUpdate()
    return 'Timer state sent'
  }
}

interface TimerUpdateMessage {
  app: 'timer';
  type: 'update';
  data: {
    time: number;
    isActive: boolean;
    timerType: string;
  };
}

interface PlaySoundMessage {
  app: 'timer';
  type: 'playSound';
  data: { sound: 'timerFinished' };
}
