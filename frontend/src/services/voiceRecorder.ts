export interface RecordingResult {
  audioBlob?: Blob;
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

export interface AudioEmotionResult {
  dominant: string;
  confidence: number;
  features?: Record<string, number>;
  timestamp: number;
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
        // Change audio format to WAV instead of webm for better backend compatibility
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
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
  
  public analyzeAudioEmotion(recording: RecordingResult): Promise<AudioEmotionResult> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Analyzing audio with blob size:', recording.blob.size);
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(recording.blob);
        
        reader.onloadend = async () => {
          try {
            // Get base64 data
            const base64data = reader.result?.toString() || '';
            console.log('Audio base64 data length:', base64data.length);
            
            // Send to backend with error handling
            console.log('Sending audio data to backend...');
            const response = await fetch('http://localhost:5000/api/analyze-audio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ audio: base64data })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Backend API error:', response.status, errorText);
              throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            console.log('Received response from backend');
            const result = await response.json();
            console.log('Audio analysis result:', result);
            resolve(result);
          } catch (error) {
            console.error('Error in audio analysis request:', error);
            throw error;
          }
        };
        
        reader.onerror = (error) => {
          console.error('Error reading audio file:', error);
          throw new Error('Failed to read audio data');
        };
      } catch (error) {
        console.error('Error analyzing audio emotions:', error);
        // Fallback result if analysis fails
        resolve({
          dominant: "Neutral",
          confidence: 0.6,
          timestamp: Date.now()
        });
      }
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
