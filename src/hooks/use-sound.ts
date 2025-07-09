
"use client";

import { useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';
import { useTaskContext } from '@/contexts/TaskContext';

type SoundType = 'drag' | 'drop' | 'complete' | 'add' | 'delete' | 'success' | 'error';

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
      switch (type) {
        case 'drag':
           new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
          }).toDestination().triggerAttackRelease('C2', '32n');
          break;
        case 'drop':
           new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
            oscillator: { type: 'sine' },
          }).toDestination().triggerAttackRelease('C3', '8n');
          break;
        case 'success':
        case 'complete':
           const completeSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fmsine" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4 },
           }).toDestination();
           completeSynth.triggerAttackRelease(["C5", "E5", "G5"], "8n");
          break;
        case 'add':
          const addSynth = new Tone.Synth({
            oscillator: { type: 'amtriangle' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
          }).toDestination();
          addSynth.triggerAttackRelease('C5', '16n');
          break;
        case 'error':
        case 'delete':
           const deleteSynth = new Tone.NoiseSynth({
             noise: { type: 'pink' },
             envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
           }).toDestination();
           deleteSynth.triggerAttackRelease("8n");
          break;
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [settings.soundEnabled, isInitialized]);

  useEffect(() => {
    const init = async () => {
      await initializeAudio();
    };
    
    document.body.addEventListener('click', init, { once: true });
    document.body.addEventListener('keydown', init, { once: true });
    document.body.addEventListener('dragstart', init, { once: true });

    return () => {
      document.body.removeEventListener('click', init);
      document.body.removeEventListener('keydown', init);
      document.body.removeEventListener('dragstart', init);
    }
  }, [initializeAudio]);

  return playSound;
}
