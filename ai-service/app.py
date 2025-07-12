from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime

# Import models
from src.models.demand_forecasting.demand_model import DemandForecastingModel
from src.models.sustainability.sustainability_model import SustainabilityModel

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize models
demand_model = DemandForecastingModel()
sustainability_model = SustainabilityModel()

# Sample data for demo
def create_sample_data():
    """Create sample data for demonstration"""
    np.random.seed(42)
    
    # Sample sales data
    products = [f'PROD{i:03d}' for i in range(1, 21)]
    categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books']
    
    # Generate sales data
    sales_data = []
    for i in range(100):
        sales_data.append({
            'product_id': np.random.choice(products),
            'date': pd.date_range('2024-01-01', periods=100)[i],
            'quantity': np.random.poisson(10) + 1,
            'price': np.random.uniform(10, 100)
        })
    
    # Generate sustainability data
    sustainability_data = []
    for product in products:
        sustainability_data.append({
            'product_id': product,
            'category': np.random.choice(categories),
            'carbon_footprint': np.random.uniform(0.5, 5.0),
            'recyclability': np.random.uniform(0, 100),
            'packaging_score': np.random.uniform(0, 100),
            'sourcing_score': np.random.uniform(0, 100),
            'durability': np.random.uniform(1, 10),
            'end_of_life_score': np.random.uniform(0, 100)
        })
    
    return pd.DataFrame(sales_data), pd.DataFrame(sustainability_data)

# Load sample data
sales_df, sustainability_df = create_sample_data()

@app.route('/')
def home():
    return jsonify({
        'message': 'Retail Analytics API',
        'version': '1.0',
        'endpoints': {
            'demand_forecast': '/api/demand/forecast',
            'demand_analysis': '/api/demand/analyze',
            'sustainability_score': '/api/sustainability/score',
            'sustainability_analysis': '/api/sustainability/analyze'
        }
    })

# Demand Forecasting Endpoints
@app.route('/api/demand/train', methods=['POST'])
def train_demand_model():
    try:
        # Train with sample data or uploaded data
        result = demand_model.train(sales_df)
        return jsonify({
            'status': 'success',
            'message': 'Demand forecasting model trained successfully',
            'details': result
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/demand/forecast', methods=['POST'])
def forecast_demand():
    try:
        data = request.json
        days = data.get('days', 30)
        
        # Train model if not already trained
        if not demand_model.is_trained:
            demand_model.train(sales_df)
        
        predictions = demand_model.predict(sales_df, days=days)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions.to_dict('records'),
            'forecast_days': days
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/demand/analyze', methods=['GET'])
def analyze_demand():
    try:
        analysis = demand_model.analyze_demand(sales_df)
        return jsonify({
            'status': 'success',
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/demand/product/<product_id>', methods=['GET'])
def get_product_demand(product_id):
    try:
        product_data = sales_df[sales_df['product_id'] == product_id]
        if product_data.empty:
            return jsonify({'status': 'error', 'message': 'Product not found'}), 404
        
        stats = {
            'product_id': product_id,
            'total_sales': product_data['quantity'].sum(),
            'avg_sales': product_data['quantity'].mean(),
            'order_count': len(product_data),
            'date_range': {
                'start': product_data['date'].min().strftime('%Y-%m-%d'),
                'end': product_data['date'].max().strftime('%Y-%m-%d')
            }
        }
        
        return jsonify({
            'status': 'success',
            'product_stats': stats
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Sustainability Endpoints
@app.route('/api/sustainability/score', methods=['POST'])
def calculate_sustainability_score():
    try:
        data = request.json
        product_ids = data.get('product_ids', [])
        
        if product_ids:
            filtered_data = sustainability_df[sustainability_df['product_id'].isin(product_ids)]
        else:
            filtered_data = sustainability_df
        
        scored_data = sustainability_model.calculate_sustainability_score(filtered_data)
        
        return jsonify({
            'status': 'success',
            'scores': scored_data[['product_id', 'sustainability_score', 'sustainability_level']].to_dict('records')
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/sustainability/analyze', methods=['GET'])
def analyze_sustainability():
    try:
        analysis = sustainability_model.analyze_sustainability(sustainability_df)
        return jsonify({
            'status': 'success',
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/sustainability/product/<product_id>', methods=['GET'])
def get_product_sustainability(product_id):
    try:
        suggestions = sustainability_model.get_improvement_suggestions(sustainability_df, product_id)
        return jsonify({
            'status': 'success',
            'sustainability_analysis': suggestions
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/sustainability/benchmark', methods=['POST'])
def benchmark_products():
    try:
        data = request.json
        category = data.get('category', None)
        
        benchmarks = sustainability_model.benchmark_products(sustainability_df, category)
        
        return jsonify({
            'status': 'success',
            'benchmarks': benchmarks,
            'category': category
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Data upload endpoints
@app.route('/api/upload/sales', methods=['POST'])
def upload_sales_data():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename.endswith('.csv'):
            global sales_df
            sales_df = pd.read_csv(file)
            return jsonify({
                'status': 'success',
                'message': 'Sales data uploaded successfully',
                'rows': len(sales_df),
                'columns': list(sales_df.columns)
            })
        else:
            return jsonify({'status': 'error', 'message': 'Please upload a CSV file'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/upload/sustainability', methods=['POST'])
def upload_sustainability_data():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename.endswith('.csv'):
            global sustainability_df
            sustainability_df = pd.read_csv(file)
            return jsonify({
                'status': 'success',
                'message': 'Sustainability data uploaded successfully',
                'rows': len(sustainability_df),
                'columns': list(sustainability_df.columns)
            })
        else:
            return jsonify({'status': 'error', 'message': 'Please upload a CSV file'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)