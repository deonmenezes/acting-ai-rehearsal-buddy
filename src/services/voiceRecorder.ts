
type RecorderStatus = 'inactive' | 'recording' | 'paused';

class VoiceRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  private onStatusChangeCallback: ((status: RecorderStatus) => void) | null = null;
  private onRecordingCompleteCallback: ((audioBlob: Blob) => void) | null = null;

  public async startRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      
      if (!this.stream) {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        if (this.onRecordingCompleteCallback) {
          this.onRecordingCompleteCallback(audioBlob);
        }
        this.updateStatus('inactive');
      });
      
      this.mediaRecorder.start();
      this.updateStatus('recording');
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }
  
  public stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
  
  public pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.updateStatus('paused');
    }
  }
  
  public resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.updateStatus('recording');
    }
  }
  
  public cleanUp(): void {
    this.stopRecording();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  public onStatusChange(callback: (status: RecorderStatus) => void): void {
    this.onStatusChangeCallback = callback;
  }
  
  public onRecordingComplete(callback: (audioBlob: Blob) => void): void {
    this.onRecordingCompleteCallback = callback;
  }
  
  private updateStatus(status: RecorderStatus): void {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }
  
  public getStatus(): RecorderStatus {
    if (!this.mediaRecorder) return 'inactive';
    
    switch (this.mediaRecorder.state) {
      case 'recording': return 'recording';
      case 'paused': return 'paused';
      default: return 'inactive';
    }
  }
}

const voiceRecorder = new VoiceRecorderService();
export default voiceRecorder;
