
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseVoiceCommand } from '@/lib/voiceCommandParser';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceFilterButton = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Wait a moment for final transcript processing
      setTimeout(() => {
        if (transcript) {
          handleCommand(transcript);
        }
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: "Could not recognize voice command. Please try again."
      });
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [transcript]);

  const handleCommand = (text) => {
    if (!text) return;
    const command = parseVoiceCommand(text);
    
    if (command.action === 'unknown') {
      toast({
        title: "Unknown Command",
        description: `heard: "${text}". Try "Show Dhaka" or "Reset".`
      });
    } else {
      onCommand(command);
      toast({
        className: "bg-green-600 text-white border-green-700",
        title: "Command Recognized",
        description: `Action: ${command.action.replace('_', ' ')} ${command.params.district || ''}`
      });
    }
    setTranscript('');
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast({ variant: "destructive", title: "Not Supported", description: "Voice control requires a modern browser like Chrome." });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  if (!isSupported) return null;

  return (
    <div className="relative">
      <Button 
        onClick={toggleListening}
        variant={isListening ? "destructive" : "outline"}
        className={`relative overflow-hidden transition-all ${isListening ? 'pl-10' : ''}`}
      >
        <AnimatePresence>
          {isListening && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              exit={{ scale: 0 }}
              className="absolute left-3 w-3 h-3 bg-white rounded-full animate-ping"
            />
          )}
        </AnimatePresence>
        
        {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
        {isListening ? "Listening..." : "Voice Control"}
      </Button>
      
      {isListening && transcript && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white whitespace-nowrap z-50 shadow-xl">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceFilterButton;
