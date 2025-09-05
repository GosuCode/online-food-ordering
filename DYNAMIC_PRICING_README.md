# Dynamic Pricing System - Implementation Guide

## Overview

This document describes the implementation of a comprehensive dynamic pricing system for the Food Delivery application. The system applies various discounts based on demand, user loyalty, weather conditions, and user type.

## Features Implemented

### 1. Demand-Based Pricing

- **Low Demand**: 15% discount to encourage orders
- **Normal Demand**: Regular pricing
- **High Demand**: Regular pricing (no increase as per specification)

### 2. User-Based Pricing

- **New User Discount**: 10% discount on first order
- **Loyalty Discounts**:
  - Bronze (5+ orders OR $100+ spent): 5% discount
  - Silver (10+ orders OR $300+ spent): 7% discount
  - Gold (20+ orders OR $500+ spent): 10% discount
  - Platinum (50+ orders OR $1000+ spent): 15% discount

### 3. Weather-Based Pricing

- **Hot soup on cold days**: 15% discount
- **Cold drinks on hot days**: 10% discount
- **Regular weather**: Normal pricing

### 4. Discount Application Rules

- **Only the highest priority discount is applied** (no stacking)
- **Priority order**: Loyalty > New User > Weather > Demand
- **Example**: If user has 7% loyalty discount and it's cold weather (-15% for soup), only the 7% loyalty discount is applied

## Technical Implementation

### Backend Changes

#### 1. Database Models

- **Updated User Model**: Added loyalty tracking fields

  - `orderCount`: Number of orders placed
  - `totalSpent`: Total amount spent
  - `isNewUser`: Boolean flag for new users
  - `loyaltyTier`: Bronze, Silver, Gold, or Platinum

- **New Pricing Models**:
  - `pricingRuleModel`: Configuration for pricing rules
  - `demandLevelModel`: Tracks current demand levels
  - `weatherDataModel`: Caches weather data

#### 2. Services

- **PricingService**: Main service for calculating dynamic prices
- **WeatherService**: Integrates with OpenWeather API for weather data
- **DemandService**: Tracks order volume and determines demand levels

#### 3. API Endpoints

- `GET /api/food/list?userId={id}&city={city}` - Returns food with dynamic pricing
- `GET /api/food/pricing/rules` - Admin endpoint to get pricing rules
- `POST /api/food/pricing/rules` - Admin endpoint to create pricing rules
- `PUT /api/food/pricing/rules/{id}` - Admin endpoint to update pricing rules

### Frontend Changes

#### 1. Food Item Display

- Updated `FoodItem.jsx` to show original price, discounted price, and discount reason
- Added visual indicators for discounts with badges and strikethrough pricing

#### 2. Dynamic Pricing Integration

- Modified `StoreContext.jsx` to pass user information to API calls
- Automatically refetches food list when user logs in to apply dynamic pricing

#### 3. Admin Dashboard

- New `Pricing` page for managing pricing rules
- Visual interface for creating and editing pricing rules
- Real-time display of active pricing rules

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm install node-fetch  # For weather API integration
```

### 2. Environment Variables

Add to your `.env` file:

```
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### 3. Database Migration

The system will automatically create the necessary database collections and default pricing rules on startup.

### 4. Testing

Run the test script to verify the implementation:

```bash
cd backend
npm run test-pricing
```

## Usage Examples

### 1. Getting Food with Dynamic Pricing

```javascript
// Frontend call with user context
const response = await fetch(`/api/food/list?userId=${userId}&city=${city}`);
const foods = response.data;

// Each food item will have:
// - originalPrice: Base price
// - price: Final price after discount
// - discount: Discount percentage
// - appliedRule: Description of applied rule
// - discountType: Type of discount applied
```

### 2. Admin Pricing Management

```javascript
// Get all pricing rules
const rules = await fetch("/api/food/pricing/rules", {
  headers: { token: adminToken },
});

// Create new pricing rule
const newRule = await fetch("/api/food/pricing/rules", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    token: adminToken,
  },
  body: JSON.stringify({
    name: "Weekend Special",
    type: "demand",
    priority: 2,
    demandLevel: "low",
    demandDiscount: 20,
  }),
});
```

## Configuration

### 1. Demand Thresholds

Default thresholds in `demandService.js`:

- Low: < 5 orders per hour
- Normal: 5-15 orders per hour
- High: > 15 orders per hour

### 2. Weather Categories

Weather conditions are categorized as:

- Cold: Temperature < 10°C
- Hot: Temperature > 30°C
- Normal: 10-30°C

### 3. Loyalty Tiers

- Bronze: 5+ orders OR $100+ spent
- Silver: 10+ orders OR $300+ spent
- Gold: 20+ orders OR $500+ spent
- Platinum: 50+ orders OR $1000+ spent

## Monitoring and Analytics

### 1. Demand Tracking

- Automatic demand level updates every 5 minutes
- Real-time order volume monitoring
- Historical demand data storage

### 2. User Loyalty Tracking

- Automatic tier updates based on order history
- Real-time spending and order count tracking
- Loyalty progression monitoring

### 3. Weather Data Caching

- 30-minute cache for weather data
- Automatic cache refresh
- Fallback to default weather on API failure

## Performance Considerations

### 1. Caching Strategy

- Weather data cached for 30 minutes
- Demand levels updated every 5 minutes
- Pricing rules cached in memory

### 2. Database Optimization

- Indexed fields for fast lookups
- Efficient aggregation queries for demand tracking
- Optimized user stats updates

### 3. API Rate Limiting

- Weather API calls minimized through caching
- Efficient database queries
- Minimal external API dependencies

## Troubleshooting

### 1. Weather API Issues

- Check `OPENWEATHER_API_KEY` environment variable
- Verify API key permissions
- Check network connectivity

### 2. Pricing Not Applied

- Verify user is logged in
- Check user data is properly loaded
- Ensure pricing rules are active

### 3. Admin Access Issues

- Verify admin role in user model
- Check authentication token
- Ensure proper API endpoint access

## Future Enhancements

### 1. Advanced Analytics

- Pricing effectiveness metrics
- User behavior analysis
- Revenue impact tracking

### 2. Machine Learning Integration

- Predictive demand modeling
- Dynamic threshold adjustment
- Personalized pricing recommendations

### 3. A/B Testing

- Pricing rule experimentation
- Conversion rate optimization
- User experience testing

## Support

For technical support or questions about the dynamic pricing system:

1. Check the test script output for system health
2. Review server logs for error messages
3. Verify database connectivity and data integrity
4. Test API endpoints individually

## Conclusion

The dynamic pricing system provides a comprehensive solution for implementing flexible pricing strategies based on multiple factors. The system is designed to be scalable, maintainable, and easily configurable through the admin interface.
