export class HuggingFaceClient {
  private token: string;
  private modelId: string;
  private baseUrl: string = 'https://api-inference.huggingface.co/models/';
  
  constructor(token: string, modelId: string) {
    this.token = token;
    this.modelId = modelId;
  }

  async analyzeImage(imageBase64: string): Promise<any> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
      if (!base64Data || base64Data.length < 100) {
        throw new Error('Invalid image format - ensure it is a proper base64 encoded image');
      }
      
      console.debug('Sending request to HF API with data length:', base64Data.length);
      
      // Try a different model that's known to work with binary data
      const alternativeModel = 'dima806/face_emotions_image_detection';
      
      // Try the binary approach
      try {
        // Convert base64 string to binary data using browser-compatible approach
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Send request to Hugging Face API with binary data
        console.debug(`Sending binary request to ${this.modelId}`);
        const response = await fetch(`${this.baseUrl}${this.modelId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/octet-stream'
          },
          body: bytes
        });
        
        console.debug('Binary request response status:', response.status);
        const responseText = await response.text();
        console.debug('Raw response text:', responseText);
        
        let result;
        try {
          // Try to parse the response as JSON
          result = JSON.parse(responseText);
          console.debug('Raw API response (parsed):', result);
          return result;
        } catch (parseError) {
          console.debug('Failed to parse response as JSON, using text response');
          // If it's not valid JSON, it might be an error message
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
          }
          // Return a simple object with the text
          return { response: responseText };
        }
      } catch (binaryError) {
        console.error('Binary request failed:', binaryError);
        
        // Try with the alternative model
        console.debug(`Trying with alternative model: ${alternativeModel}`);
        try {
          const alternativeResponse = await fetch(`${this.baseUrl}${alternativeModel}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              inputs: {
                image: base64Data
              }
            })
          });
          
          console.debug('Alternative model response status:', alternativeResponse.status);
          
          if (alternativeResponse.ok) {
            const altResult = await alternativeResponse.json();
            console.debug('Alternative model response:', altResult);
            return altResult;
          }
        } catch (altError) {
          console.error('Alternative model request failed:', altError);
        }
        
        // Try the JSON approach as a last fallback
        console.debug('Trying JSON format approach');
        
        const jsonResponse = await fetch(`${this.baseUrl}${this.modelId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: base64Data })
        });
        
        console.debug('JSON request response status:', jsonResponse.status);
        
        if (!jsonResponse.ok) {
          if (jsonResponse.status === 503) {
            throw new Error('The facial expression model is currently loading. Please try again in a moment.');
          }
          throw new Error(`API request failed with status ${jsonResponse.status}`);
        }
        
        const jsonResult = await jsonResponse.json();
        console.debug('Raw API response (JSON approach):', jsonResult);
        return jsonResult;
      }
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      throw error;
    }
  }
}