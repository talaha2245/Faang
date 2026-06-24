import os
import sys
import warnings
import joblib
# Suppress UserWarning about feature names
warnings.filterwarnings("ignore", category=UserWarning)
# Determine the absolute directory where predict.py is located
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "linear_regression_model.pkl")

# Load model using joblib (since it was saved using joblib in the notebook)
model = joblib.load(model_path)

# Map arguments to floats
features = list(map(float, sys.argv[1:]))

features = [2000,156,193,200,3,70.7,4]
# Run prediction
prediction = model.predict([features])

# Print output
print(min(prediction[0], 0.92)*100)