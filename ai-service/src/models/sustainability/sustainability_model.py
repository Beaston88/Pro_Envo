import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import logging

logger = logging.getLogger(__name__)

class SustainabilityModel:
    """Simple sustainability scoring model for products"""
    
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.weights = {
            'carbon_footprint': 0.25,
            'recyclability': 0.20,
            'packaging_score': 0.15,
            'sourcing_score': 0.20,
            'durability': 0.10,
            'end_of_life_score': 0.10
        }
        self.is_trained = False
    
    def prepare_features(self, data):
        """Prepare sustainability features"""
        df = data.copy()
        
        # Fill missing values with category averages
        for col in self.weights.keys():
            if col in df.columns:
                df[col] = df[col].fillna(df.groupby('category')[col].transform('mean'))
                df[col] = df[col].fillna(df[col].mean())
        
        # Normalize carbon footprint (lower is better)
        if 'carbon_footprint' in df.columns:
            df['carbon_footprint'] = 1 / (1 + df['carbon_footprint'])
        
        return df
    
    def calculate_sustainability_score(self, data):
        """Calculate sustainability scores for products"""
        df = self.prepare_features(data)
        
        # Calculate weighted sustainability score
        score = 0
        for factor, weight in self.weights.items():
            if factor in df.columns:
                # Normalize to 0-1 scale
                normalized = (df[factor] - df[factor].min()) / (df[factor].max() - df[factor].min())
                score += normalized * weight
        
        # Convert to 0-100 scale
        df['sustainability_score'] = (score * 100).round(2)
        
        # Classify sustainability level
        df['sustainability_level'] = df['sustainability_score'].apply(self._classify_sustainability)
        
        return df
    
    def _classify_sustainability(self, score):
        """Classify sustainability based on score"""
        if score >= 80:
            return 'Excellent'
        elif score >= 60:
            return 'Good'
        elif score >= 40:
            return 'Fair'
        else:
            return 'Poor'
    
    def analyze_sustainability(self, data):
        """Analyze sustainability patterns"""
        df = self.calculate_sustainability_score(data)
        
        # Overall statistics
        stats = {
            'avg_score': df['sustainability_score'].mean(),
            'score_distribution': df['sustainability_level'].value_counts().to_dict(),
            'top_sustainable': df.nlargest(10, 'sustainability_score')[['product_id', 'sustainability_score']].to_dict('records'),
            'least_sustainable': df.nsmallest(10, 'sustainability_score')[['product_id', 'sustainability_score']].to_dict('records')
        }
        
        # Category analysis
        if 'category' in df.columns:
            category_stats = df.groupby('category')['sustainability_score'].agg(['mean', 'count']).round(2)
            stats['category_analysis'] = category_stats.to_dict('index')
        
        # Factor analysis
        factor_scores = {}
        for factor in self.weights.keys():
            if factor in df.columns:
                factor_scores[factor] = {
                    'avg': df[factor].mean(),
                    'weight': self.weights[factor]
                }
        stats['factor_analysis'] = factor_scores
        
        return stats
    
    def get_improvement_suggestions(self, data, product_id):
        """Get sustainability improvement suggestions for a product"""
        df = self.calculate_sustainability_score(data)
        product_data = df[df['product_id'] == product_id]
        
        if product_data.empty:
            return {"error": "Product not found"}
        
        product = product_data.iloc[0]
        suggestions = []
        
        # Check each factor and suggest improvements
        for factor, weight in self.weights.items():
            if factor in df.columns:
                product_score = product[factor]
                avg_score = df[factor].mean()
                
                if product_score < avg_score:
                    suggestions.append({
                        'factor': factor,
                        'current_score': product_score,
                        'average_score': avg_score,
                        'improvement_potential': (avg_score - product_score) * weight * 100,
                        'suggestion': self._get_improvement_suggestion(factor)
                    })
        
        return {
            'product_id': product_id,
            'current_score': product['sustainability_score'],
            'current_level': product['sustainability_level'],
            'suggestions': suggestions
        }
    
    def _get_improvement_suggestion(self, factor):
        """Get specific improvement suggestions"""
        suggestions = {
            'carbon_footprint': 'Reduce carbon emissions through cleaner production methods',
            'recyclability': 'Use more recyclable materials in product design',
            'packaging_score': 'Adopt eco-friendly packaging materials',
            'sourcing_score': 'Source materials from sustainable suppliers',
            'durability': 'Improve product quality to increase lifespan',
            'end_of_life_score': 'Design for easier disposal or recycling'
        }
        return suggestions.get(factor, 'Improve this sustainability factor')
    
    def benchmark_products(self, data, category=None):
        """Benchmark products within category or overall"""
        df = self.calculate_sustainability_score(data)
        
        if category:
            df = df[df['category'] == category]
        
        # Rank products
        df['rank'] = df['sustainability_score'].rank(method='dense', ascending=False)
        df['percentile'] = df['sustainability_score'].rank(pct=True) * 100
        
        return df[['product_id', 'sustainability_score', 'sustainability_level', 'rank', 'percentile']].to_dict('records')
    
    def save_model(self, path):
        """Save the model configuration"""
        joblib.dump({
            'weights': self.weights,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }, path)
    
    def load_model(self, path):
        """Load model configuration"""
        saved_data = joblib.load(path)
        self.weights = saved_data['weights']
        self.scaler = saved_data['scaler']
        self.is_trained = saved_data['is_trained']