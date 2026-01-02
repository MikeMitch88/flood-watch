# AI/ML Model Training Dataset Guide

## Overview

The flood detection model requires a labeled dataset of flood and non-flood images. This guide explains how to acquire, prepare, and use training data.

---

## 📊 Dataset Requirements

### Minimum Dataset Size
- **10,000+ images** (5,000 flood, 5,000 non-flood)
- Higher quality and diversity improve model performance

### Image Requirements
- **Format**: JPG, PNG
- **Resolution**: Minimum 224x224 pixels (higher is better)
- **Variety**: Different flood severities, locations, weather conditions
- **Labels**:
  - Binary: Flood (Yes/No)
  - Severity: 1-5 scale
  - Optional: Water depth estimate

---

## 🔍 Public Datasets

### 1. FloodNet Dataset
- **Source**: [FloodNet Challenge](http://www.classic.grss-ieee.org/earthvision2021/challenge.html)
- **Size**: ~4,500 images
- **Labels**: Semantic segmentation labels
- **Quality**: High-resolution aerial/drone imagery
- **Download**: Available through challenge website

### 2. MediaEval Flood Detection
- **Source**: [MediaEval Benchmark](https://www.multimediaeval.org/)
- **Size**: ~15,000 images
- **Labels**: Flood/Non-flood classification
- **Quality**: Social media images (variable quality)
- **Download**: Register for MediaEval access

### 3. Sentinel-1 SAR Flood Dataset
- **Source**: [Copernicus Open Access Hub](https://scihub.copernicus.eu/)
- **Size**: Unlimited (satellite imagery)
- **Labels**: Requires manual labeling or water detection algorithms
- **Quality**: Excellent for large-scale floods
- **Note**: Requires SAR processing expertise

### 4. Social Media Scraping (with permission)
- **Sources**: Twitter, Instagram (with API access)
- **Keywords**: #flood, #flooding, #floodwater
- **Quality**: Variable (requires filtering)
- **Legal**: Ensure compliance with terms of service

---

## 📁 Dataset Structure

Organize your dataset as follows:

```
flood_dataset/
├── train/
│   ├── flood/
│   │   ├── severity_1/
│   │   │   ├── img_001.jpg
│   │   │   ├── img_002.jpg
│   │   │   └── ...
│   │   ├── severity_2/
│   │   ├── severity_3/
│   │   ├── severity_4/
│   │   └── severity_5/
│   └── no_flood/
│       ├── img_001.jpg
│       ├── img_002.jpg
│       └── ...
├── validation/
│   ├── flood/
│   └── no_flood/
└── test/
    ├── flood/
    └── no_flood/
```

---

## 🏷️ Data Labeling

### Manual Labeling Tools
1. **Label Studio** (Recommended)
   - Open source
   - Web-based interface
   - Supports classification and segmentation
   - Install: `pip install label-studio`

2. **CVAT (Computer Vision Annotation Tool)**
   - Developed by Intel
   - Powerful for complex annotations
   - Web: https://cvat.org/

3. **Labelbox**
   - Cloud-based (paid with free tier)
   - Team collaboration features

### Labeling Guidelines

For each image, annotate:
1. **Is Flood?**: Yes/No
2. **Severity**: 
   - 1 = Minor water accumulation
   - 2 = Road/property partially flooded
   - 3 = Significant flooding
   - 4 = Dangerous flooding
   - 5 = Catastrophic flooding
3. **Estimated Water Depth** (optional): In cm

---

## 🔨 Data Preparation Script

```python
import os
import shutil
from sklearn.model_selection import train_test_split

def prepare_dataset(source_dir, output_dir, test_size=0.2, val_size=0.1):
    """
    Organize images into train/val/test splits
    """
    # Create output directories
    splits = ['train', 'validation', 'test']
    categories = ['flood', 'no_flood']
    
    for split in splits:
        for category in categories:
            os.makedirs(f"{output_dir}/{split}/{category}", exist_ok=True)
    
    # Get all flood images
    flood_images = []
    for root, dirs, files in os.walk(f"{source_dir}/flood"):
        for file in files:
            if file.endswith(('.jpg', '.png', '.jpeg')):
                flood_images.append(os.path.join(root, file))
    
    # Get all non-flood images
    no_flood_images = []
    for root, dirs, files in os.walk(f"{source_dir}/no_flood"):
        for file in files:
            if file.endswith(('.jpg', '.png', '.jpeg')):
                no_flood_images.append(os.path.join(root, file))
    
    # Split data
    for images, category in [(flood_images, 'flood'), (no_flood_images, 'no_flood')]:
        # Split into train+val and test
        train_val, test = train_test_split(images, test_size=test_size, random_state=42)
        
        # Split train+val into train and val
        train, val = train_test_split(train_val, test_size=val_size/(1-test_size), random_state=42)
        
        # Copy files
        for img in train:
            shutil.copy(img, f"{output_dir}/train/{category}/{os.path.basename(img)}")
        for img in val:
            shutil.copy(img, f"{output_dir}/validation/{category}/{os.path.basename(img)}")
        for img in test:
            shutil.copy(img, f"{output_dir}/test/{category}/{os.path.basename(img)}")
    
    print(f"Dataset prepared:")
    print(f"  Train: {len(train)*2} images")
    print(f"  Validation: {len(val)*2} images")
    print(f"  Test: {len(test)*2} images")

# Usage
prepare_dataset('raw_images', 'flood_dataset')
```

---

## 🎓 Model Training Script

```python
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(rescale=1./255)

# Load data
train_generator = train_datagen.flow_from_directory(
    'flood_dataset/train',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=True
)

validation_generator = val_datagen.flow_from_directory(
    'flood_dataset/validation',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False
)

# Create model
base_model = EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)

base_model.trainable = False  # Freeze base model

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)

# Multi-output heads
is_flood = Dense(1, activation='sigmoid', name='is_flood')(x)
severity = Dense(5, activation='softmax', name='severity')(x)

model = Model(inputs=base_model.input, outputs=[is_flood, severity])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss={
        'is_flood': 'binary_crossentropy',
        'severity': 'categorical_crossentropy'
    },
    loss_weights={'is_flood': 1.0, 'severity': 0.8},
    metrics=['accuracy']
)

# Callbacks
callbacks = [
    ModelCheckpoint(
        'flood_detector_best.h5',
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7
    )
]

# Train
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=50,
    callbacks=callbacks,
    verbose=1
)

# Save final model
model.save('flood_detector_v1.h5')
print("Training complete! Model saved.")
```

---

## 📊 Model Evaluation

```python
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Load test data
test_datagen = ImageDataGenerator(rescale=1./255)
test_generator = test_datagen.flow_from_directory(
    'flood_dataset/test',
    target_size=(224, 224),
    batch_size=1,
    class_mode='categorical',
    shuffle=False
)

# Evaluate
predictions = model.predict(test_generator, verbose=1)

# Get binary predictions
binary_preds = (predictions[0] > 0.5).astype(int)

# Ground truth
ground_truth = test_generator.classes

# Metrics
print("Classification Report:")
print(classification_report(ground_truth, binary_preds))

print("\nConfusion Matrix:")
print(confusion_matrix(ground_truth, binary_preds))
```

---

## 🚀 Deploying the Model

### Option 1: Include in Backend

```bash
# Copy trained model to backend
cp flood_detector_v1.h5 backend/app/ml/model/

# Update flood_detector.py to load model
# Set ML_MODEL_PATH in .env
```

### Option 2: Separate ML Service

```python
# Create separate FastAPI service for ML inference
# run on different port (e.g., 8001)
# Backend calls this service for predictions
```

---

## 🎯 Continuous Improvement

### Active Learning
1. Collect production images from reports
2. Have admins label uncertain predictions
3. Periodically retrain model with new data

### Model Monitoring
- Track prediction confidence over time
- Monitor false positive/negative rates
- A/B test model versions

---

## 📝 Licensing Note

Ensure all training data complies with:
- Image licensing (CC BY, CC0, public domain)
- Privacy laws (no identifiable people without consent)
- Terms of service for scraped data

---

## ✅ Quick Start Checklist

- [ ] Download FloodNet and MediaEval datasets
- [ ] Install Label Studio (`pip install label-studio`)
- [ ] Label images with severity levels
- [ ] Run data preparation script
- [ ] Train initial model (50 epochs)
- [ ] Evaluate on test set
- [ ] Deploy to backend
- [ ] Monitor predictions in production
- [ ] Collect feedback for retraining

---

**Need help?** Check TensorFlow documentation: https://www.tensorflow.org/tutorials/images/classification
