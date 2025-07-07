"use client";

import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSound } from '@/hooks/use-sound';

export function SettingsPanel() {
  const { settings, updateSettings } = useTaskContext();
  const playSound = useSound();

  const handleWeightChange = (name: string, value: number[]) => {
    updateSettings({
      priorityWeights: { ...settings.priorityWeights, [name]: value[0] },
    });
  };
  
  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
    if(enabled) playSound('add');
  };

  return (
    <div className="p-4 space-y-6">
        <div className="space-y-4">
            <h4 className="font-medium">Priority Weights</h4>
            <div>
                <Label htmlFor="urgency-slider">Urgency ({settings.priorityWeights.urgency})</Label>
                <Slider id="urgency-slider" defaultValue={[settings.priorityWeights.urgency]} max={10} step={1} onValueChange={(v) => handleWeightChange('urgency', v)} />
            </div>
            <div>
                <Label htmlFor="importance-slider">Importance ({settings.priorityWeights.importance})</Label>
                <Slider id="importance-slider" defaultValue={[settings.priorityWeights.importance]} max={10} step={1} onValueChange={(v) => handleWeightChange('importance', v)} />
            </div>
            <div>
                <Label htmlFor="impact-slider">Impact ({settings.priorityWeights.impact})</Label>
                <Slider id="impact-slider" defaultValue={[settings.priorityWeights.impact]} max={10} step={1} onValueChange={(v) => handleWeightChange('impact', v)} />
            </div>
            <div>
                <Label htmlFor="deadline-slider">Deadline ({settings.priorityWeights.deadline})</Label>
                <Slider id="deadline-slider" defaultValue={[settings.priorityWeights.deadline]} max={10} step={1} onValueChange={(v) => handleWeightChange('deadline', v)} />
            </div>
        </div>
        <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="font-medium">Sound Effects</Label>
            <Switch id="sound-toggle" checked={settings.soundEnabled} onCheckedChange={handleSoundToggle} />
        </div>
    </div>
  );
}
