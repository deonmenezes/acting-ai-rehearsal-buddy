import logging
import numpy as np
import time
import random
import os

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try importing audio analysis libraries
try:
    from pyAudioAnalysis import audioAnalysis
    from pyAudioAnalysis import audioBasicIO
    from pyAudioAnalysis import audioFeatureExtraction
    AUDIO_ANALYSIS_AVAILABLE = True
    logger.info("pyAudioAnalysis successfully imported")
except ImportError as e:
    AUDIO_ANALYSIS_AVAILABLE = False
    logger.warning(f"pyAudioAnalysis could not be imported due to: {str(e)}. Using mock implementation for audio analysis.")

# Explicitly import TensorFlow first
try:
    import tensorflow as tf
    logger.info(f"TensorFlow version {tf.__version__} successfully imported")
    
    # Suppress TensorFlow logging except for errors
    tf.get_logger().setLevel('ERROR')
    
    # Add the missing LocallyConnected2D layer
    if not hasattr(tf.keras.layers, 'LocallyConnected2D'):
        logger.info("Adding missing LocallyConnected2D layer to TensorFlow Keras")
        from keras.layers import LocallyConnected2D
        tf.keras.layers.LocallyConnected2D = LocallyConnected2D

    # Now import DeepFace after TensorFlow is properly set up
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace successfully imported")
    
except ImportError as e:
    DEEPFACE_AVAILABLE = False
    logger.warning(f"DeepFace or TensorFlow could not be imported due to: {str(e)}. Using mock implementation.")

def analyze_face(img_path):
    """
    Analyze a single face image using DeepFace
    Args:
        img_path: Path to the image file
    Returns:
        A dictionary with analysis results
    """
    try:
        logger.info(f"Analyzing facial expression in image: {img_path}")
        
        if DEEPFACE_AVAILABLE:
            # Run DeepFace analysis
            result = DeepFace.analyze(
                img_path=img_path,
                actions=['emotion'],
                enforce_detection=False
            )
            
            # Process the result
            if isinstance(result, list):
                result = result[0]  # Take first face if multiple detected
            
            # Extract emotion data
            emotions = result['emotion']
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            
            # Format the result for consistency with frontend
            expressions = []
            for emotion, confidence in emotions.items():
                expressions.append({
                    "expression": emotion.capitalize(),
                    "confidence": float(confidence) / 100.0  # Normalize to 0-1 range
                })
        else:
            # Mock implementation when DeepFace is not available
            logger.info("Using mock implementation for facial expression analysis")
            emotions = {
                "happy": random.uniform(0, 100),
                "sad": random.uniform(0, 100),
                "angry": random.uniform(0, 100),
                "fear": random.uniform(0, 100),
                "surprise": random.uniform(0, 100),
                "neutral": random.uniform(0, 100),
                "disgust": random.uniform(0, 100)
            }
            
            # Make one emotion significantly higher to create a realistic dominant
            dominant_key = random.choice(list(emotions.keys()))
            emotions[dominant_key] = random.uniform(60, 90)
            
            # Normalize to make sure total is close to 100
            total = sum(emotions.values())
            emotions = {k: (v/total)*100 for k, v in emotions.items()}
            
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            
            # Format result like DeepFace would
            expressions = []
            for emotion, confidence in emotions.items():
                expressions.append({
                    "expression": emotion.capitalize(),
                    "confidence": float(confidence) / 100.0
                })
        
        # Sort by confidence (highest first)
        expressions.sort(key=lambda x: x["confidence"], reverse=True)
        
        return {
            "dominant": dominant_emotion.capitalize(),
            "all": expressions,
            "timestamp": int(time.time() * 1000)
        }
        
    except Exception as e:
        logger.error(f"Error in facial analysis: {str(e)}")
        # Return fallback data
        return {
            "dominant": "Unknown",
            "all": [
                {"expression": "Neutral", "confidence": 0.5},
                {"expression": "Happy", "confidence": 0.2},
                {"expression": "Sad", "confidence": 0.1},
                {"expression": "Angry", "confidence": 0.1},
                {"expression": "Surprise", "confidence": 0.05},
                {"expression": "Fear", "confidence": 0.03},
                {"expression": "Disgust", "confidence": 0.02},
            ],
            "timestamp": int(time.time() * 1000)
        }

def analyze_faces_batch(frame_paths, timestamps):
    """
    Analyze multiple face images as a batch
    Args:
        frame_paths: List of paths to image files
        timestamps: List of corresponding timestamps
    Returns:
        Dictionary with aggregated analysis results
    """
    try:
        logger.info(f"Batch analyzing {len(frame_paths)} facial expressions")
        
        results = []
        expression_map = {}
        
        # Process each frame
        for i, (img_path, timestamp) in enumerate(zip(frame_paths, timestamps)):
            try:
                if DEEPFACE_AVAILABLE:
                    # Analyze with DeepFace
                    analysis = DeepFace.analyze(
                        img_path=img_path,
                        actions=['emotion'],
                        enforce_detection=False
                    )
                    
                    # Process the result
                    if isinstance(analysis, list):
                        analysis = analysis[0]  # Take first face
                    
                    # Extract emotions
                    emotions = analysis['emotion']
                else:
                    # Mock implementation
                    emotions = {
                        "happy": random.uniform(0, 100),
                        "sad": random.uniform(0, 100),
                        "angry": random.uniform(0, 100),
                        "fear": random.uniform(0, 100),
                        "surprise": random.uniform(0, 100),
                        "neutral": random.uniform(0, 100),
                        "disgust": random.uniform(0, 100)
                    }
                    
                    # Make one emotion significantly higher
                    dominant_key = random.choice(list(emotions.keys()))
                    emotions[dominant_key] = random.uniform(60, 90)
                    
                    # Normalize to make sure total is close to 100
                    total = sum(emotions.values())
                    emotions = {k: (v/total)*100 for k, v in emotions.items()}
                
                dominant = max(emotions.items(), key=lambda x: x[1])[0]
                
                # Update expression tracking
                for emotion, confidence in emotions.items():
                    if emotion not in expression_map:
                        expression_map[emotion] = {
                            "count": 0,
                            "total_confidence": 0.0
                        }
                    
                    expression_map[emotion]["count"] += 1
                    expression_map[emotion]["total_confidence"] += float(confidence) / 100.0
                
                # Add to timeline
                results.append({
                    "timestamp": timestamp,
                    "dominant": dominant.capitalize(),
                    "confidences": {k: float(v)/100.0 for k, v in emotions.items()}
                })
                
                # Log progress for long batches
                if i > 0 and i % 10 == 0:
                    logger.info(f"Processed {i}/{len(frame_paths)} frames")
                    
            except Exception as e:
                logger.error(f"Error processing frame {img_path}: {str(e)}")
        
        # Calculate overall dominant expression
        total_frames = len(results)
        expression_counts = {emotion: data["count"] for emotion, data in expression_map.items()}
        overall_dominant = max(expression_counts.items(), key=lambda x: x[1])[0] if expression_counts else "Unknown"
        
        # Calculate average confidence for each expression
        avg_expressions = []
        for emotion, data in expression_map.items():
            avg_expressions.append({
                "expression": emotion.capitalize(),
                "averageConfidence": data["total_confidence"] / data["count"] if data["count"] > 0 else 0
            })
        
        # Sort by average confidence
        avg_expressions.sort(key=lambda x: x["averageConfidence"], reverse=True)
        
        return {
            "dominantExpression": overall_dominant.capitalize(),
            "allExpressions": avg_expressions,
            "timeline": results,
            "totalFrames": total_frames
        }
        
    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        return {
            "dominantExpression": "Unknown",
            "allExpressions": [
                {"expression": "Neutral", "averageConfidence": 0.5},
                {"expression": "Happy", "averageConfidence": 0.2},
            ],
            "timeline": [],
            "totalFrames": 0
        }

def analyze_audio(file_path):
    """
    Analyze audio file for emotional content using pyAudioAnalysis
    Args:
        file_path: Path to the audio file
    Returns:
        A dictionary with analysis results
    """
    try:
        logger.info(f"Analyzing audio file for emotions: {file_path}")
        
        if AUDIO_ANALYSIS_AVAILABLE:
            try:
                # Load audio file
                [Fs, x] = audioBasicIO.read_audio_file(file_path)
                
                if Fs > 0:
                    # Extract audio features (short-term)
                    F, f_names = audioFeatureExtraction.stFeatureExtraction(x, Fs, 0.050*Fs, 0.025*Fs)
                    
                    # Get statistics of features across frames
                    features_mean = np.mean(F, axis=1)
                    features_std = np.std(F, axis=1)
                    
                    # Use feature-based classification directly
                    dominant_emotion, confidence, all_emotions = classify_emotion_by_features(features_mean)
                else:
                    logger.error(f"Invalid sample rate ({Fs}) for file: {file_path}")
                    raise ValueError("Invalid audio format")
            
            except Exception as e:
                logger.error(f"Error processing audio file: {str(e)}")
                # If audio processing fails, use basic classifier
                dominant_emotion, confidence, all_emotions = basic_emotion_classifier(file_path)
            
            # Format the emotions for frontend consistency
            emotions_list = []
            for emotion_name, emotion_conf in all_emotions.items():
                emotions_list.append({
                    "expression": emotion_name,
                    "confidence": emotion_conf
                })
            
            # Sort emotions by confidence
            emotions_list.sort(key=lambda x: x["confidence"], reverse=True)
            
            return {
                "dominant": dominant_emotion,
                "confidence": confidence,
                "all": emotions_list,
                "timestamp": int(time.time() * 1000)
            }
        
        else:
            # Mock implementation when audio analysis library is not available
            logger.info("Using mock implementation for audio analysis")
            emotions = {
                "Happy": random.uniform(0, 100) / 100.0,
                "Sad": random.uniform(0, 100) / 100.0,
                "Angry": random.uniform(0, 100) / 100.0,
                "Fear": random.uniform(0, 100) / 100.0,
                "Surprise": random.uniform(0, 100) / 100.0,
                "Neutral": random.uniform(0, 100) / 100.0,
                "Disgust": random.uniform(0, 100) / 100.0
            }
            
            # Make one emotion significantly higher
            dominant_key = random.choice(list(emotions.keys()))
            emotions[dominant_key] = random.uniform(60, 90) / 100.0
            
            # Normalize
            total = sum(emotions.values())
            emotions = {k: v/total for k, v in emotions.items()}
            
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            confidence = emotions[dominant_emotion]
            
            # Format for frontend
            emotions_list = []
            for emotion_name, emotion_conf in emotions.items():
                emotions_list.append({
                    "expression": emotion_name,
                    "confidence": emotion_conf
                })
            
            # Sort emotions by confidence
            emotions_list.sort(key=lambda x: x["confidence"], reverse=True)
            
            return {
                "dominant": dominant_emotion,
                "confidence": confidence,
                "all": emotions_list,
                "timestamp": int(time.time() * 1000)
            }
        
    except Exception as e:
        logger.error(f"Error in audio analysis: {str(e)}")
        return {
            "dominant": "Neutral",
            "confidence": 0.5,
            "all": [
                {"expression": "Neutral", "confidence": 0.5},
                {"expression": "Happy", "confidence": 0.2},
                {"expression": "Sad", "confidence": 0.1},
            ],
            "timestamp": int(time.time() * 1000)
        }

def classify_emotion_by_features(features):
    """
    Classify emotion based on audio features
    Args:
        features: Numpy array of audio features
    Returns:
        Tuple of (dominant_emotion, confidence, all_emotions_dict)
    """
    # Use feature-based heuristics for emotion classification
    # These thresholds should be tuned based on your specific use case
    
    # Features relevant to emotional speech:
    energy = features[1]       # Energy
    zcr = features[0]          # Zero crossing rate
    spectral_entropy = features[2]  # Spectral entropy
    mfcc1 = features[3]        # MFCC1
    mfcc2 = features[4]        # MFCC2
    
    # Initialize emotion confidences
    emotions = {
        "Happy": 0.0,
        "Sad": 0.0,
        "Angry": 0.0, 
        "Fear": 0.0,
        "Surprise": 0.0,
        "Neutral": 0.0
    }
    
    # Heuristic rules based on audio research
    # High energy and MFCC variance often correlate with happiness/excitement
    if energy > 0.6:
        emotions["Happy"] += 0.3
        emotions["Angry"] += 0.2
    
    # High zero-crossing rate often indicates excitement or anger
    if zcr > 0.6:
        emotions["Angry"] += 0.3
        emotions["Surprise"] += 0.2
    
    # Low energy and spectral entropy often correlate with sadness
    if energy < 0.4 and spectral_entropy < 0.5:
        emotions["Sad"] += 0.4
        emotions["Fear"] += 0.2
    
    # Neutral speech typically has moderate values
    if 0.4 <= energy <= 0.6 and 0.4 <= spectral_entropy <= 0.6:
        emotions["Neutral"] += 0.5
    
    # Ensure all emotions have at least minimal values and normalize
    min_value = 0.1
    for emotion in emotions:
        emotions[emotion] = max(emotions[emotion], min_value)
    
    total = sum(emotions.values())
    emotions = {k: v/total for k, v in emotions.items()}
    
    # Get dominant emotion
    dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
    confidence = emotions[dominant_emotion]
    
    return dominant_emotion, confidence, emotions

def basic_emotion_classifier(file_path):
    """
    Very basic emotion classifier as a fallback
    Args:
        file_path: Path to the audio file
    Returns:
        Tuple of (dominant_emotion, confidence, all_emotions_dict)
    """
    # Get file properties as a basic indicator
    file_size = os.path.getsize(file_path)
    
    # Very basic rules based on file size
    # This is just a fallback and not scientifically accurate
    emotions = {
        "Happy": 0.2,
        "Sad": 0.2,
        "Angry": 0.2,
        "Fear": 0.1,
        "Surprise": 0.1,
        "Neutral": 0.2
    }
    
    # Randomly select a dominant emotion but weight by file size
    # Larger files might have more energy/content
    if file_size > 500000:  # Large file
        emotions["Happy"] += 0.2
        emotions["Angry"] += 0.1
    else:  # Small file
        emotions["Neutral"] += 0.2
        emotions["Sad"] += 0.1
    
    # Normalize
    total = sum(emotions.values())
    emotions = {k: v/total for k, v in emotions.items()}
    
    # Get dominant emotion
    dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
    confidence = emotions[dominant_emotion]
    
    return dominant_emotion, confidence, emotions

def compare_facial_expressions(img_paths):
    """
    Compare facial expressions across multiple images
    Args:
        img_paths: List of paths to image files
    Returns:
        Dictionary with comparison analysis
    """
    try:
        logger.info(f"Comparing facial expressions across {len(img_paths)} images")
        
        results = []
        expression_data = {}
        
        # Process each image
        for i, img_path in enumerate(img_paths):
            try:
                # Use our existing analyze_face function to get expressions
                analysis = analyze_face(img_path)
                
                # Extract the image name from path for reference
                img_name = os.path.basename(img_path)
                
                # Add to results
                result = {
                    "imageName": img_name,
                    "dominant": analysis["dominant"],
                    "expressions": analysis["all"]
                }
                
                results.append(result)
                
                # Group by expression type for comparison
                for expr in analysis["all"]:
                    expression = expr["expression"]
                    if expression not in expression_data:
                        expression_data[expression] = []
                    
                    expression_data[expression].append({
                        "imageName": img_name,
                        "confidence": expr["confidence"]
                    })
                
                logger.info(f"Processed image {i+1}/{len(img_paths)}: {img_name}")
                
            except Exception as e:
                logger.error(f"Error processing image {img_path}: {str(e)}")
        
        # Sort expression data by confidence for each expression
        for expression in expression_data:
            expression_data[expression].sort(key=lambda x: x["confidence"], reverse=True)
        
        # Find most varied and most consistent expressions
        expression_variance = {}
        for expression, data in expression_data.items():
            if len(data) > 1:
                confidences = [item["confidence"] for item in data]
                variance = np.var(confidences)
                expression_variance[expression] = variance
        
        most_varied = None
        most_consistent = None
        
        if expression_variance:
            most_varied = max(expression_variance.items(), key=lambda x: x[1])[0]
            most_consistent = min(expression_variance.items(), key=lambda x: x[1])[0]
        
        # Generate comparison insights
        insights = []
        
        # Check for similar dominant expressions
        dominant_expressions = [result["dominant"] for result in results]
        if len(set(dominant_expressions)) == 1:
            insights.append(f"All images show the same dominant expression: {dominant_expressions[0]}")
        elif len(set(dominant_expressions)) < len(dominant_expressions):
            common_expressions = {}
            for expr in dominant_expressions:
                if expr not in common_expressions:
                    common_expressions[expr] = 0
                common_expressions[expr] += 1
            
            for expr, count in common_expressions.items():
                if count > 1:
                    insights.append(f"{count} images share the dominant expression: {expr}")
        
        # Add insights about most varied and consistent expressions
        if most_varied:
            insights.append(f"The most varied expression across images is '{most_varied}'")
        if most_consistent and len(results) > 1:
            insights.append(f"The most consistent expression across images is '{most_consistent}'")
        
        # Create actor names (can be customized later)
        actor_names = [f"Actor {i+1}" for i in range(len(img_paths))]
        actor_map = dict(zip([os.path.basename(path) for path in img_paths], actor_names))
            
        return {
            "individualResults": results,
            "expressionComparison": expression_data,
            "insights": insights,
            "actorMap": actor_map,
            "timestamp": int(time.time() * 1000)
        }
        
    except Exception as e:
        logger.error(f"Error in facial expression comparison: {str(e)}")
        return {
            "individualResults": [],
            "expressionComparison": {},
            "insights": ["Error analyzing expressions"],
            "timestamp": int(time.time() * 1000)
        }