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
      switch (type) {
        case 'drag':
           new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
          }).toDestination().triggerAttackRelease("A2", "32n");
          break;
        case 'drop':
          new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 },
          }).toDestination().triggerAttackRelease('C4', '16n');
          break;
        case 'complete':
           const completeSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "amsine", harmonicity: 1.2, modulationType: 'sine' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
           }).toDestination();
           completeSynth.triggerAttackRelease(["C4", "G4", "C5"], "8n");
          break;
        case 'add':
          const addSynth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
          }).toDestination();
          addSynth.triggerAttackRelease('C4', '16n', Tone.now());
          addSynth.triggerAttackRelease('E4', '16n', Tone.now() + 0.1);
          break;
        case 'delete':
           const deleteSynth = new Tone.Synth({
             oscillator: { type: 'triangle' },
             envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 },
           }).toDestination();
           deleteSynth.triggerAttackRelease("A2", "16n");
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
