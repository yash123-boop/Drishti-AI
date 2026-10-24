export class CameraSession {
  private stream: MediaStream | null = null;
  private generation = 0;

  public async start(videoElement: HTMLVideoElement): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera unavailable on this device or browser.');
    }

    this.stop(videoElement);
    const generation = ++this.generation;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      videoElement.srcObject = stream;
      await videoElement.play();
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (this.stream === stream) this.stream = null;
      if (videoElement.srcObject === stream) videoElement.srcObject = null;
      throw error;
    }
  }

  public captureFrame(videoElement: HTMLVideoElement): string | null {
    if (!videoElement.videoWidth || !videoElement.videoHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;

    try {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Could not capture a camera frame:', error);
      return null;
    }
  }

  public stop(videoElement?: HTMLVideoElement | null): void {
    this.generation += 1;
    const stream = this.stream;
    this.stream = null;
    stream?.getTracks().forEach((track) => track.stop());

    if (videoElement && videoElement.srcObject === stream) {
      videoElement.srcObject = null;
    }
  }
}
