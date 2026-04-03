"use client";

import { useEffect, useRef, useState } from "react";

interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface BrowserSpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: BrowserSpeechRecognitionAlternative;
}

interface BrowserSpeechRecognitionResultList {
  length: number;
  [index: number]: BrowserSpeechRecognitionResult;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: BrowserSpeechRecognitionResultList;
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: ((event: Event) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

type RecognitionWindow = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};

type UseSpeechToTextOptions = {
  lang?: string;
  onTranscript?: (transcript: string) => void;
};

function getRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const recognitionWindow = window as RecognitionWindow;

  return (
    recognitionWindow.SpeechRecognition ??
    recognitionWindow.webkitSpeechRecognition ??
    null
  );
}

function getSpeechErrorMessage(error: string) {
  switch (error) {
    case "audio-capture":
      return "No microphone was found. Please connect a microphone and try again.";
    case "network":
      return "Voice typing needs a network connection right now. Please try again.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Please allow mic access and try again.";
    case "no-speech":
      return "I didn't catch anything. Try speaking a little louder.";
    default:
      return "Voice typing could not start right now. Please try again.";
  }
}

export function useSpeechToText({
  lang = "en-US",
  onTranscript,
}: UseSpeechToTextOptions = {}) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptHandlerRef = useRef(onTranscript);

  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  transcriptHandlerRef.current = onTranscript;

  useEffect(() => {
    const Recognition = getRecognitionConstructor();

    setIsSupported(Boolean(Recognition));

    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let nextInterimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          nextInterimTranscript += `${transcript} `;
        }
      }

      setInterimTranscript(nextInterimTranscript.trim());

      if (finalTranscript.trim()) {
        transcriptHandlerRef.current?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(getSpeechErrorMessage(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.abort();
      } catch {
        // Ignore cleanup failures from browsers that already ended recognition.
      }

      recognitionRef.current = null;
    };
  }, [lang]);

  const startListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setError("Voice typing is not supported in this browser.");
      return;
    }

    setError(null);

    try {
      recognition.lang = lang;
      recognition.start();
    } catch {
      setError("Voice typing is already running or unavailable right now.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setInterimTranscript("");
  };

  const clearError = () => {
    setError(null);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  return {
    clearError,
    error,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
