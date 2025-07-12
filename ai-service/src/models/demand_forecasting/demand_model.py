import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
import joblib
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DemandForecastingModel:
    """Simple demand forecasting model for retail analytics"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, data):
        """Create basic features for demand forecasting"""
        df = data.copy()
        df['date'] = pd.to_datetime(df['date'])
        
        # Basic time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Lag features
        df['quantity_lag_7'] = df.groupby('product_id')['quantity'].shift(7)
        df['quantity_lag_30'] = df.groupby('product_id')['quantity'].shift(30)
        
        # Rolling averages
        df['quantity_avg_7'] = df.groupby('product_id')['quantity'].rolling(7).mean().reset_index(0, drop=True)
        df['quantity_avg_30'] = df.groupby('product_id')['quantity'].rolling(30).mean().reset_index(0, drop=True)
        
        # Fill missing values
        df = df.fillna(0)
        
        return df
    
    def train(self, data):
        """Train the demand forecasting model"""
        processed_data = self.prepare_features(data)
        
        # Select features
        feature_cols = ['day_of_week', 'month', 'is_weekend', 'quantity_lag_7', 
                       'quantity_lag_30', 'quantity_avg_7', 'quantity_avg_30']
        
        X = processed_data[feature_cols]
        y = processed_data['quantity']
        
        # Remove rows with NaN values
        mask = ~(X.isna().any(axis=1) | y.isna())
        X = X[mask]
        y = y[mask]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        return {"status": "trained", "samples": len(X)}
    
    def predict(self, data, days=30):
        """Make demand predictions"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        predictions = []
        
        for product_id in data['product_id'].unique():
            product_data = data[data['product_id'] == product_id].sort_values('date')
            
            # Get last 30 days for features
            recent_data = product_data.tail(30)
            
            for i in range(days):
                # Create future date
                last_date = product_data['date'].max()
                future_date = last_date + timedelta(days=i+1)
                
                # Create features for prediction
                features = [
                    future_date.weekday(),  # day_of_week
                    future_date.month,      # month
                    1 if future_date.weekday() >= 5 else 0,  # is_weekend
                    recent_data['quantity'].iloc[-7:].mean() if len(recent_data) >= 7 else 0,  # lag_7
                    recent_data['quantity'].mean(),  # lag_30
                    recent_data['quantity'].iloc[-7:].mean() if len(recent_data) >= 7 else 0,  # avg_7
                    recent_data['quantity'].mean()   # avg_30
                ]
                
                # Make prediction
                features_scaled = self.scaler.transform([features])
                pred = self.model.predict(features_scaled)[0]
                
                predictions.append({
                    'product_id': product_id,
                    'date': future_date.strftime('%Y-%m-%d'),
                    'predicted_quantity': max(0, round(pred, 2))
                })
        
        return pd.DataFrame(predictions)
    
    def analyze_demand(self, data):
        """Analyze demand patterns"""
        df = data.copy()
        df['date'] = pd.to_datetime(df['date'])
        
        # Product performance
        product_stats = df.groupby('product_id')['quantity'].agg(['sum', 'mean', 'count']).round(2)
        product_stats.columns = ['total_sales', 'avg_sales', 'order_count']
        
        # Time patterns
        daily_sales = df.groupby(df['date'].dt.date)['quantity'].sum()
        monthly_sales = df.groupby(df['date'].dt.month)['quantity'].sum()
        
        # Top/bottom products
        top_products = product_stats.sort_values('total_sales', ascending=False).head(10)
        bottom_products = product_stats.sort_values('total_sales', ascending=True).head(10)
        
        return {
            'product_stats': product_stats.to_dict('index'),
            'top_products': top_products.to_dict('index'),
            'bottom_products': bottom_products.to_dict('index'),
            'daily_avg': daily_sales.mean(),
            'monthly_totals': monthly_sales.to_dict(),
            'total_orders': len(df),
            'unique_products': df['product_id'].nunique()
        }
    
    def save_model(self, path):
        """Save the trained model"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }, path)
    
    def load_model(self, path):
        """Load a trained model"""
        saved_data = joblib.load(path)
        self.model = saved_data['model']
        self.scaler = saved_data['scaler']
        self.is_trained = saved_data['is_trained']