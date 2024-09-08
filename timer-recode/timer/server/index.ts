import { TimerHandler } from './timer'
import { DeskThing as DK, IncomingData } from 'deskthing-server'
const DeskThing = DK.getInstance()
export { DeskThing }

let timer: TimerHandler

const start = async () => {
  timer = new TimerHandler()

  DeskThing.on('get', handleGet)
  DeskThing.on('set', handleSet)
}

const handleGet = async (data: IncomingData) => {

  if (data.request == null) {
    DeskThing.sendError('No args provided!')
    return
  }
  switch (data.request) {
    case 'timerState':
      await timer.returnTimerState()
      break
    default:
      DeskThing.sendError(`Unknown request: ${data.request}`)
      break
  }
}

const handleSet = async (data: IncomingData) => {

  if (data == null) {
    DeskThing.sendError('No data provided')
    return
  }
  let response
  switch (data.request) {
    case 'start':
      response = await timer.startTimer()
      break
    case 'pause':
      response = await timer.pauseTimer()
      break
    case 'reset':
      response = await timer.resetTimer()
      break
    case 'changeType':
      response = await timer.changeTimerType(data.payload);
      break
    default:
      DeskThing.sendError(`Unknown request: ${data.request}`)
      return
  }
  DeskThing.sendLog(response)
}

DeskThing.on('start', start)