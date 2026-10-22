/**
 * Journey Engine Module
 * Manages the full transit lifecycle, stop transitions, and accessibility alerts
 */

import { audioChimes } from '../voice/audioChimes';
import { hapticEngine } from '../voice/hapticEngine';
import { speechSynth } from '../voice/speechSynthesis';
import { evaluateStopProgress } from './stopManager';
import type { JourneyState, TransitRoute } from '../../types/transit';

type JourneyListener = (state: JourneyState) => void;

class JourneyEngineManager {
  private state: JourneyState = {
    route: null,
    confirmedBusNumber: null,
    currentStopIndex: 0,
    currentStop: null,
    nextStop: null,
    status: 'IDLE',
    isApproaching: false,
    hasArrived: false,
    autoPlayTimer: null,
  };

  private listeners: Set<JourneyListener> = new Set();
  private timerInterval: any = null;

  public subscribe(fn: JourneyListener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  public getState(): JourneyState {
    return { ...this.state };
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public startJourney(route: TransitRoute, confirmedBusNumber: string) {
    this.stopAutoPlay();

    const initialProgression = evaluateStopProgress(route, 0);

    this.state = {
      route,
      confirmedBusNumber,
      currentStopIndex: 0,
      currentStop: initialProgression.currentStop,
      nextStop: initialProgression.nextStop,
      status: 'STARTED',
      isApproaching: false,
      hasArrived: false,
      autoPlayTimer: null,
    };

    // Feedback
    audioChimes.play('next-stop');
    hapticEngine.nextStop();
    speechSynth.announceJourneyStarted(
      initialProgression.currentStop.name,
      route.destination
    );

    this.notify();
  }

  public advanceStop() {
    if (!this.state.route || this.state.hasArrived) return;

    const nextIndex = this.state.currentStopIndex + 1;
    const progression = evaluateStopProgress(this.state.route, nextIndex);

    if (progression.isFinal) {
      // Reached destination!
      this.stopAutoPlay();
      this.state.currentStopIndex = progression.currentIndex;
      this.state.currentStop = progression.currentStop;
      this.state.nextStop = null;
      this.state.status = 'ARRIVED';
      this.state.isApproaching = false;
      this.state.hasArrived = true;

      audioChimes.play('arrival');
      hapticEngine.destinationReached();
      speechSynth.announceDestinationReached(this.state.route.destination);
    } else if (progression.isPenultimate) {
      // Approaching destination (1 stop remaining)
      this.state.currentStopIndex = progression.currentIndex;
      this.state.currentStop = progression.currentStop;
      this.state.nextStop = progression.nextStop;
      this.state.status = 'APPROACHING';
      this.state.isApproaching = true;

      audioChimes.play('approaching');
      hapticEngine.approachingDestination();
      speechSynth.announceApproaching(this.state.route.destination);
    } else {
      // Intermediate stop progression
      this.state.currentStopIndex = progression.currentIndex;
      this.state.currentStop = progression.currentStop;
      this.state.nextStop = progression.nextStop;
      this.state.status = 'TRANSIT';
      this.state.isApproaching = false;

      audioChimes.play('next-stop');
      hapticEngine.nextStop();
      speechSynth.announceStopProgress(
        progression.currentStop.name,
        progression.nextStop ? progression.nextStop.name : null
      );
    }

    this.notify();
  }

  public toggleAutoPlay(enabled: boolean) {
    if (enabled && !this.timerInterval) {
      this.timerInterval = setInterval(() => {
        if (!this.state.hasArrived && this.state.status !== 'PAUSED') {
          this.advanceStop();
        } else {
          this.stopAutoPlay();
        }
      }, 6000);
      this.state.autoPlayTimer = 6;
      this.notify();
    } else {
      this.stopAutoPlay();
    }
  }

  public stopAutoPlay() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.state.autoPlayTimer = null;
    this.notify();
  }

  public pauseJourney() {
    if (this.state.status === 'TRANSIT' || this.state.status === 'STARTED' || this.state.status === 'APPROACHING') {
      this.state.status = 'PAUSED';
      this.stopAutoPlay();
      speechSynth.speak('Journey paused. Press resume when you are ready.');
      this.notify();
    }
  }

  public resumeJourney() {
    if (this.state.status === 'PAUSED') {
      this.state.status = this.state.isApproaching ? 'APPROACHING' : 'TRANSIT';
      speechSynth.speak('Journey resumed.');
      this.notify();
    }
  }

  public resetJourney() {
    this.stopAutoPlay();
    this.state = {
      route: null,
      confirmedBusNumber: null,
      currentStopIndex: 0,
      currentStop: null,
      nextStop: null,
      status: 'IDLE',
      isApproaching: false,
      hasArrived: false,
      autoPlayTimer: null,
    };
    speechSynth.stop();
    this.notify();
  }
}

export const journeyEngine = new JourneyEngineManager();
