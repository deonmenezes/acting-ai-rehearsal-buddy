export interface RecordingResult {
  audioUrl: string;
  blob: Blob;
  duration: number;
  timestamp: number;
}

export interface AudioAnalysisResult {
  clarity: number;
  emotionalDelivery: number;
  pacing: number;
  overallScore: number;
}

export class VoiceRecorderService {
  private static instance: VoiceRecorderService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;
  
  private constructor() {}
  
  public static getInstance(): VoiceRecorderService {
    if (!VoiceRecorderService.instance) {
      VoiceRecorderService.instance = new VoiceRecorderService();
    }
    return VoiceRecorderService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  }
  
  public startRecording(onDataAvailable?: (e: BlobEvent) => void): boolean {
    if (!this.stream) {
      console.error('Media stream not initialized. Call initialize() first.');
      return false;
    }
    
    try {
      this.audioChunks = [];
      this.startTime = Date.now();
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          if (onDataAvailable) {
            onDataAvailable(event);
          }
        }
      };
      
      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }
  
  public stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const duration = (Date.now() - this.startTime) / 1000; // in seconds
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        resolve({
          audioUrl,
          blob: audioBlob,
          duration,
          timestamp: Date.now()
        });
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  public analyzeAudio(recording: RecordingResult): Promise<AudioAnalysisResult> {
    // In a real implementation, this would send the audio to a server for analysis
    // For demonstration, we'll generate some random scores
    return new Promise((resolve) => {
      // Simulate processing delay
      setTimeout(() => {
        // Generate random scores between 60 and 95
        const clarity = 60 + Math.random() * 35;
        const emotionalDelivery = 60 + Math.random() * 35;
        const pacing = 60 + Math.random() * 35;
        
        // Calculate overall score as an average
        const overallScore = Math.round((clarity + emotionalDelivery + pacing) / 3);
        
        resolve({
          clarity: Math.round(clarity),
          emotionalDelivery: Math.round(emotionalDelivery),
          pacing: Math.round(pacing),
          overallScore
        });
      }, 1000);
    });
  }
  
  public cleanUp(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
  }
}

export default VoiceRecorderService.getInstance();
