import os
import base64
from PIL import Image
import io
import time
import logging
import wave

# Configure logging
logger = logging.getLogger(__name__)

def save_base64_image(image_data, directory="tmp", prefix="frame"):
    """
    Save a base64 encoded image to disk
    
    Args:
        image_data: Base64 encoded image data (may include data URL prefix)
        directory: Directory to save the image
        prefix: Prefix for the filename
        
    Returns:
        Path to the saved image
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
            
        # Decode base64 data
        image_bytes = base64.b64decode(image_data)
        
        # Create a PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Ensure directory exists
        os.makedirs(directory, exist_ok=True)
        
        # Create filename with timestamp
        timestamp = int(time.time() * 1000)
        filename = f"{prefix}_{timestamp}.jpg"
        filepath = os.path.join(directory, filename)
        
        # Save the image
        img.save(filepath)
        
        return filepath
    
    except Exception as e:
        logger.error(f"Error saving base64 image: {str(e)}")
        raise e

def cleanup_image_files(file_paths):
    """
    Delete temporary image files
    
    Args:
        file_paths: List of file paths to delete
    """
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.warning(f"Could not remove file {file_path}: {str(e)}")

def save_base64_audio(audio_data, directory="tmp", prefix="audio"):
    """
    Save a base64 encoded audio to disk
    
    Args:
        audio_data: Base64 encoded audio data (may include data URL prefix)
        directory: Directory to save the audio
        prefix: Prefix for the filename
        
    Returns:
        Path to the saved audio
    """
    try:
        # Remove data URL prefix if present
        if ',' in audio_data:
            # Example: data:audio/wav;base64,AAABABAC...
            logger.info(f"Extracting audio data from data URL format")
            audio_data = audio_data.split(',')[1]
            
        # Decode base64 data
        logger.info(f"Decoding base64 audio data")
        audio_bytes = base64.b64decode(audio_data)
        logger.info(f"Decoded {len(audio_bytes)} bytes of audio data")
        
        # Ensure directory exists
        os.makedirs(directory, exist_ok=True)
        
        # Create filename with timestamp
        timestamp = int(time.time() * 1000)
        filename = f"{prefix}_{timestamp}.wav"
        filepath = os.path.join(directory, filename)
        
        # Save the audio bytes directly to file
        with open(filepath, "wb") as audio_file:
            audio_file.write(audio_bytes)
            logger.info(f"Saved audio to {filepath}")
        
        return filepath
    
    except Exception as e:
        logger.error(f"Error saving base64 audio: {str(e)}")
        raise e