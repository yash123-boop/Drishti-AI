import { getStopInfo } from './stopManager.js';
import { checkDestinationAlert } from './destinationAlert.js';

export class JourneyEngine {
  constructor(route) {
    this.route = route;
    this.currentIndex = 0;
    this.status = 'STARTED';
  }

  nextStop() {
    if (!this.route || this.currentIndex >= this.route.stops.length - 1) {
      this.status = 'ARRIVED';
      return getStopInfo(this.route, this.currentIndex);
    }
    this.currentIndex++;
    const alert = checkDestinationAlert(this.route, this.currentIndex);
    this.status = alert === 'ARRIVED' ? 'ARRIVED' : alert === 'APPROACHING' ? 'APPROACHING' : 'TRANSIT';
    return getStopInfo(this.route, this.currentIndex);
  }
}
