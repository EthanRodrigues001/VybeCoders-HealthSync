"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoiceRecordingReturn {
  isRecording: boolean
  transcript: string
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  error: string | null
  isListening: boolean
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  const recognitionRef = useRef<any | null>(null)
  const mediaRecorderRef = useRef<any | null>(null)
  const audioChunksRef = useRef<any[]>([])
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setIsListening(false)

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported in this browser")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"
      recognition.maxAlternatives = 1

      recognition.onspeechstart = () => {
        console.log("[v0] Speech detected")
        setIsListening(true)
        setError(null)
      }

      recognition.onspeechend = () => {
        console.log("[v0] Speech ended")
        setIsListening(false)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript
          return newTranscript + (interimTranscript ? `[${interimTranscript}]` : "")
        })
      }

      recognition.onerror = (event) => {
        console.log("[v0] Speech recognition error:", event.error)

        if (event.error === "no-speech") {
          console.log("[v0] No speech detected, continuing to listen...")
          setError("Listening... Please speak into your microphone")
          setIsListening(false)

          if (isRecording) {
            restartTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                try {
                  recognitionRef.current.start()
                } catch (err) {
                  console.log("[v0] Error restarting recognition:", err)
                }
              }
            }, 1000)
          }
        } else if (event.error === "aborted") {
          console.log("[v0] Recognition aborted by user")
        } else {
          setError(`Speech recognition error: ${event.error}`)
          setIsRecording(false)
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        console.log("[v0] Recognition ended")
        setIsListening(false)

        if (isRecording && !error) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                recognitionRef.current.start()
              } catch (err) {
                console.log("[v0] Error restarting recognition:", err)
              }
            }
          }, 100)
        }
      }

      mediaRecorder.start()
      recognition.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(err instanceof Error ? err.message : "Failed to start recording")
      setIsRecording(false)
      setIsListening(false)
    }
  }, [isRecording, error])

  const stopRecording = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    setTranscript((prev) => prev.replace(/\[.*?\]/g, ""))
    setIsRecording(false)
    setIsListening(false)
    setError(null)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript("")
    setError(null)
    setIsListening(false)
  }, [])

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    error,
    isListening,
  }
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
