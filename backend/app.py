from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import tempfile
import logging
import base64
from facial_analysis import analyze_face, analyze_faces_batch, analyze_audio, compare_facial_expressions
from utils import save_base64_image, cleanup_image_files, save_base64_audio

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend requests

# Ensure tmp directory exists
os.makedirs('tmp', exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the service is running"""
    return jsonify({
        "status": "ok", 
        "message": "DeepFace facial analysis service is running"
    }), 200

@app.route('/api/analyze-facial-expression', methods=['POST'])
def analyze_facial_expression():
    """
    Analyze a single facial expression image
    
    Expects JSON with:
    {
        "image": "base64 encoded image data"
    }
    """
    try:
        # Get image data from request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        image_data = data['image']
        
        # Save image to temporary file
        img_path = save_base64_image(image_data)
        logger.info(f"Saved image to {img_path}")
        
        # Analyze with DeepFace
        result = analyze_face(img_path)
        
        # Cleanup
        try:
            os.remove(img_path)
        except Exception as e:
            logger.warning(f"Could not remove temporary file {img_path}: {str(e)}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error analyzing facial expression: {str(e)}")
        return jsonify({
            "error": f"Error analyzing facial expression: {str(e)}",
            "dominant": "Unknown",
            "all": [
                {"expression": "Neutral", "confidence": 0.5},
                {"expression": "Happy", "confidence": 0.2},
                {"expression": "Sad", "confidence": 0.1},
            ],
            "timestamp": int(time.time() * 1000)
        }), 500

@app.route('/api/analyze-facial-expressions-batch', methods=['POST'])
def analyze_facial_expressions_batch():
    """
    Analyze a batch of facial expression images
    
    Expects JSON with:
    {
        "frames": [
            {"imageBase64": "base64 image data", "timestamp": 1234567890},
            ...
        ]
    }
    """
    try:
        # Get frames data from request
        data = request.json
        if not data or 'frames' not in data:
            return jsonify({"error": "No frames provided"}), 400

        frames = data['frames']
        logger.info(f"Received {len(frames)} frames for batch analysis")
        
        if len(frames) == 0:
            return jsonify({"error": "Empty frames array"}), 400
            
        # Create temp directory for batch processing
        saved_files = []
        timestamps = []
            
        try:
            # Process and save each frame
            for i, frame in enumerate(frames):
                try:
                    # Extract image data
                    image_data = frame['imageBase64']
                    timestamp = frame.get('timestamp', int(time.time() * 1000))
                    
                    # Save image to file
                    img_path = save_base64_image(
                        image_data, 
                        directory='tmp', 
                        prefix=f"batch_{i}"
                    )
                    
                    saved_files.append(img_path)
                    timestamps.append(timestamp)
                    
                except Exception as e:
                    logger.error(f"Error processing frame {i}: {str(e)}")
                    continue
                    
            # Run batch analysis
            if saved_files:
                logger.info(f"Analyzing {len(saved_files)} saved frames")
                result = analyze_faces_batch(saved_files, timestamps)
                return jsonify(result)
            else:
                return jsonify({"error": "Failed to process any frames"}), 500
                
        finally:
            # Clean up temp files
            cleanup_image_files(saved_files)

    except Exception as e:
        logger.error(f"Error in batch analysis endpoint: {str(e)}")
        return jsonify({
            "error": f"Error in batch analysis: {str(e)}",
            "dominantExpression": "Unknown",
            "allExpressions": [],
            "timeline": [],
            "totalFrames": 0
        }), 500

@app.route('/api/analyze-audio', methods=['POST'])
def analyze_audio_endpoint():
    """
    Analyze audio for emotional content

    Expects JSON with:
    {
        "audio": "base64 encoded audio data"
    }
    """
    try:
        # Get audio data from request
        data = request.json
        if not data or 'audio' not in data:
            return jsonify({"error": "No audio data provided"}), 400

        audio_data = data['audio']
        
        # Save audio to temporary file
        audio_path = save_base64_audio(audio_data)
        logger.info(f"Saved audio to {audio_path}")
        
        # Analyze with DeepFace
        result = analyze_audio(audio_path)
        
        # Cleanup
        try:
            os.remove(audio_path)
        except Exception as e:
            logger.warning(f"Could not remove temporary file {audio_path}: {str(e)}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error analyzing audio: {str(e)}")
        return jsonify({
            "error": f"Error analyzing audio: {str(e)}",
            "dominantEmotion": "Unknown",
            "allEmotions": [
                {"emotion": "Neutral", "confidence": 0.5},
                {"emotion": "Happy", "confidence": 0.2},
                {"emotion": "Sad", "confidence": 0.1},
            ],
            "timestamp": int(time.time() * 1000)
        }), 500

@app.route('/api/compare-facial-expressions', methods=['POST'])
def compare_expressions_endpoint():
    """
    Compare facial expressions across multiple images
    
    Expects JSON with:
    {
        "images": [
            {"imageBase64": "base64 image data", "name": "optional custom name"},
            ...
        ]
    }
    """
    try:
        # Get images data from request
        data = request.json
        if not data or 'images' not in data:
            return jsonify({"error": "No images provided"}), 400

        images = data['images']
        logger.info(f"Received {len(images)} images for comparison analysis")
        
        if len(images) == 0:
            return jsonify({"error": "Empty images array"}), 400
            
        # Create temp directory for batch processing
        saved_files = []
        image_names = []
            
        try:
            # Process and save each image
            for i, image_data in enumerate(images):
                try:
                    # Extract image data
                    base64_data = image_data.get('imageBase64', '')
                    if not base64_data:
                        logger.error(f"Missing image data for image {i}")
                        continue
                        
                    # Extract custom name if provided
                    custom_name = image_data.get('name', f"image_{i}")
                    image_names.append(custom_name)
                    
                    # Save image to file
                    img_path = save_base64_image(
                        base64_data, 
                        directory='tmp', 
                        prefix=f"compare_{i}"
                    )
                    
                    saved_files.append(img_path)
                    logger.info(f"Saved image {i} to {img_path}")
                    
                except Exception as e:
                    logger.error(f"Error processing image {i}: {str(e)}")
                    continue
                    
            # Run comparison analysis
            if saved_files:
                logger.info(f"Comparing {len(saved_files)} saved images")
                result = compare_facial_expressions(saved_files)
                
                # Add custom names if provided
                if result.get("actorMap") and image_names:
                    updated_actor_map = {}
                    for img_path, actor_id in result["actorMap"].items():
                        idx = saved_files.index(os.path.join('tmp', img_path))
                        if 0 <= idx < len(image_names):
                            updated_actor_map[img_path] = image_names[idx]
                        else:
                            updated_actor_map[img_path] = actor_id
                    result["actorMap"] = updated_actor_map
                
                return jsonify(result)
            else:
                return jsonify({"error": "Failed to process any images"}), 500
                
        finally:
            # Clean up temp files
            cleanup_image_files(saved_files)

    except Exception as e:
        logger.error(f"Error in comparison analysis endpoint: {str(e)}")
        return jsonify({
            "error": f"Error in comparison analysis: {str(e)}",
            "individualResults": [],
            "expressionComparison": {},
            "insights": ["Error analyzing expressions"]
        }), 500

# Add a helper route to test with a simple UI
@app.route('/', methods=['GET'])
def index():
    """Simple HTML page for testing the API"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>DeepFace Facial Expression API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
            .endpoint { border-left: 3px solid #0066cc; padding-left: 10px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>DeepFace Facial Expression API</h1>
        <p>This service provides facial expression analysis using the DeepFace library.</p>
        
        <div class="endpoint">
            <h2>Health Check</h2>
            <p>Endpoint: <code>GET /api/health</code></p>
            <p>Check if the service is running.</p>
        </div>
        
        <div class="endpoint">
            <h2>Analyze Single Image</h2>
            <p>Endpoint: <code>POST /api/analyze-facial-expression</code></p>
            <p>Analyze a single facial expression image.</p>
            <pre>
{
  "image": "base64 encoded image data"
}
            </pre>
        </div>
        
        <div class="endpoint">
            <h2>Batch Analysis</h2>
            <p>Endpoint: <code>POST /api/analyze-facial-expressions-batch</code></p>
            <p>Analyze multiple images and get aggregate results.</p>
            <pre>
{
  "frames": [
    {"imageBase64": "base64 image data", "timestamp": 1234567890},
    ...
  ]
}
            </pre>
        </div>

        <div class="endpoint">
            <h2>Analyze Audio</h2>
            <p>Endpoint: <code>POST /api/analyze-audio</code></p>
            <p>Analyze audio for emotional content.</p>
            <pre>
{
  "audio": "base64 encoded audio data"
}
            </pre>
        </div>

        <div class="endpoint">
            <h2>Compare Facial Expressions</h2>
            <p>Endpoint: <code>POST /api/compare-facial-expressions</code></p>
            <p>Compare facial expressions across multiple images.</p>
            <pre>
{
  "images": [
    {"imageBase64": "base64 image data", "name": "optional custom name"},
    ...
  ]
}
            </pre>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)