import React, { useState, useEffect, useRef } from 'react'
import { DeskThing } from 'deskthing-client'

const App: React.FC = () => {
    const deskthing = DeskThing.getInstance()
    const [duration, setDuration] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        if (isRunning && duration > 0) {
            timerRef.current = window.setInterval(() => {
                setDuration(prev => {
                    const newDuration = prev - 1/60
                    if (newDuration <= 0) {
                        clearInterval(timerRef.current!)
                        setIsRunning(false)
                        flashFiveTimes()
                        sendMessageToParent()
                        return 0
                    }
                    return newDuration
                })
            }, 1000)
        } else if (!isRunning && timerRef.current) {
            clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRunning, duration])

    const formatTime = (time: number) => {
        if (time <= 0) return '00:00'
        const minutes = Math.floor(Math.abs(time))
        const seconds = Math.round((Math.abs(time) - minutes) * 60)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const flashFiveTimes = () => {
        let count = 0
        const flash = () => {
            document.body.style.backgroundColor = count % 2 === 0 ? 'white' : '#000000'
            count++
            if (count < 10) setTimeout(flash, 100)
        }
        flash()
    }

    const sendMessageToParent = () => {
        const payload = {
            type: 'message',
            request: 'play-sound',
        }
        window.parent.postMessage({ type: 'IFRAME_ACTION', payload }, '*')
    }

    const startPauseTimer = () => {
        setIsRunning(prev => !prev)
    }

    const resetTimer = () => {
        setDuration(0)
        setIsRunning(false)
    }

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            setDuration(prev => {
                const newDuration = prev + (event.deltaX > 0 || event.deltaY < 0 ? 1 : -1)
                return Math.max(0, newDuration)
            })
        }
        window.addEventListener('wheel', handleWheel)
        return () => window.removeEventListener('wheel', handleWheel)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
            <p id="timer-display" className="text-[150px] text-white font-serif mb-[5%] mt-0">
                {formatTime(duration)}
            </p>
            <div className="grid grid-cols-2 gap-4">
                <button
                    className="text-3xl m-5 p-2.5 px-5 border-none bg-[#4CAF50] rounded-[10px] text-black cursor-pointer"
                    onClick={startPauseTimer}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    className="text-3xl m-5 p-2.5 px-5 border-none bg-[#4CAF50] rounded-[10px] text-black cursor-pointer"
                    onClick={resetTimer}
                >
                    Reset
                </button>
            </div>
        </div>
    )
}

export default App
