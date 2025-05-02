# DeepFace Facial Expression Analysis Backend

This backend server uses DeepFace to analyze facial expressions from images sent by the frontend.

## Features

- Real-time facial expression analysis
- Batch analysis of multiple frames
- Expression timeline visualization
- Aggregated statistics on expressions

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the server:
   ```
   python app.py
   ```

The server will be available at http://localhost:5000

## API Endpoints

### Health Check
- `GET /api/health` - Check if the service is running

### Analyze Single Image
- `POST /api/analyze-facial-expression` - Analyze a single facial expression image
  ```json
  {
    "image": "base64 encoded image data"
  }
  ```

### Batch Analysis
- `POST /api/analyze-facial-expressions-batch` - Analyze multiple images and get aggregate results
  ```json
  {
    "frames": [
      {"imageBase64": "base64 image data", "timestamp": 1234567890},
      ...
    ]
  }
  ```

## Usage with Frontend

The frontend has been updated to use this backend. When recording expressions in the FacialExpressionPage, 
frames are captured and sent to the backend for analysis. The results are displayed in the UI with 
statistics and visualizations.

## Troubleshooting

- If you see CUDA/CuDNN errors, don't worry - DeepFace will fall back to CPU processing.
- Make sure port 5000 is not in use by another application.
- The first time you run the analysis, DeepFace will download models which may take some time.