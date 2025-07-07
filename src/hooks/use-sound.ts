"use client";

import { useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';
import { useTaskContext } from '@/contexts/TaskContext';

type SoundType = 'drag' | 'drop' | 'complete' | 'add' | 'delete';

export function useSound() {
  const { settings } = useTaskContext();
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAudio = useCallback(async () => {
    if (!isInitialized) {
      await Tone.start();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const playSound = useCallback((type: SoundType) => {
    if (!settings.soundEnabled || !isInitialized) return;

    try {
      let synth;
      switch (type) {
        case 'drag':
          synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 },
          }).toDestination();
          synth.triggerAttackRelease('C4', '8n');
          break;
        case 'drop':
          synth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
          }).toDestination();
          synth.triggerAttackRelease('E4', '8n', Tone.now());
          synth.triggerAttackRelease('G4', '8n', Tone.now() + 0.1);
          break;
        case 'complete':
           const polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4, attackCurve: "exponential" },
           }).toDestination();
           polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4"], 0.5);
          break;
        case 'add':
          const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
          new Tone.MembraneSynth().toDestination().connect(feedbackDelay).triggerAttackRelease("C2", "8n");
          break;
        case 'delete':
           const noiseSynth = new Tone.NoiseSynth({
             noise: { type: 'white' },
             envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
           }).toDestination();
           noiseSynth.triggerAttackRelease("4n");
          break;
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [settings.soundEnabled, isInitialized]);

  useEffect(() => {
    document.body.addEventListener('click', initializeAudio, { once: true });
    document.body.addEventListener('dragstart', initializeAudio, { once: true });

    return () => {
      document.body.removeEventListener('click', initializeAudio);
      document.body.removeEventListener('dragstart', initializeAudio);
    }
  }, [initializeAudio]);

  return playSound;
}
