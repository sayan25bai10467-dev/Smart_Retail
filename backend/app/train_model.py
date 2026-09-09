import pandas as pd
from sklearn.tree import DecisionTreeRegressor
import joblib

# 1. Mock Dataset: [Original Price, Age in Months, Condition (1=Poor, 5=Excellent)]
data = {
    'original_price': [5000, 10000, 2000, 8000, 6000, 15000],
    'age_months': [12, 24, 6, 36, 18, 6],
    'condition': [4, 3, 5, 2, 4, 5],
    'selling_price': [3000, 5000, 1500, 3000, 4000, 12000] # Target variable
}

df = pd.DataFrame(data)

# 2. Split into Features (X) and Target (y)
X = df[['original_price', 'age_months', 'condition']]
y = df['selling_price']

# 3. Train the Model
model = DecisionTreeRegressor()
model.fit(X, y)

# 4. Save the Model to a file so FastAPI can use it
joblib.dump(model, 'price_estimator.pkl')
print("Model trained and saved successfully!")