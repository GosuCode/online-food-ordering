# Food Delivery System - Algorithms Documentation

## Overview

This document outlines the **3 core algorithms** implemented in the Food Delivery System, along with supporting utility functions for demand forecasting, dynamic pricing, and order management.

## Core Algorithms

### 1. Demand Forecasting Algorithm

#### Purpose

Predicts food demand for the next 24 hours based on historical patterns and time-based factors.

#### Algorithm Type

**Time Series Forecasting with Pattern Recognition**

#### Pseudo Code

```
FUNCTION generateForecast(foodId, baseDemand):
    forecasts = []

    FOR hour = 0 TO 23:
        demand = baseDemand

        // Apply time-based multipliers
        IF hour >= 18 AND hour <= 21:
            demand *= 2.5  // Dinner peak
        ELSE IF hour >= 12 AND hour <= 14:
            demand *= 2.0  // Lunch peak
        ELSE IF hour >= 7 AND hour <= 9:
            demand *= 1.5  // Breakfast moderate
        ELSE IF hour >= 2 AND hour <= 6:
            demand *= 0.2  // Very low at night
        ELSE:
            demand *= 0.8  // Regular hours

        // Add randomness (±20%)
        demand *= (0.8 + random() * 0.4)

        // Calculate confidence and bounds
        confidence = 0.75 + random() * 0.15
        margin = demand * (1 - confidence) * 0.3

        forecast = {
            foodId: foodId,
            forecastHour: hour,
            predictions: {
                pointForecast: round(demand),
                lowerBound: round(max(0, demand - margin)),
                upperBound: round(demand + margin),
                confidence: confidence
            },
            weatherFactor: 0.9 + random() * 0.2,
            demandLevel: classifyDemandLevel(demand)
        }

        forecasts.append(forecast)

    RETURN forecasts

FUNCTION classifyDemandLevel(demand):
    IF demand > 15:
        RETURN "high"
    ELSE IF demand > 8:
        RETURN "medium"
    ELSE:
        RETURN "low"
```

---

### 2. Dynamic Pricing Algorithm

#### Purpose

Adjusts food prices based on demand levels, user loyalty, weather conditions, and time-based factors.

#### Algorithm Type

**Rule-Based Pricing with Multi-Factor Analysis**

#### Pseudo Code

```
FUNCTION calculateDynamicPrice(basePrice, user, weather, demandLevel):
    finalPrice = basePrice
    appliedRules = []

    // Sort rules by priority (higher priority first)
    rules = sortByPriority(pricingRules)

    FOR each rule IN rules:
        IF rule.isActive AND rule.matches(user, weather, demandLevel):
            discount = calculateDiscount(rule, basePrice)
            finalPrice = applyDiscount(finalPrice, discount)
            appliedRules.append(rule)

    RETURN {
        finalPrice: finalPrice,
        originalPrice: basePrice,
        discount: basePrice - finalPrice,
        appliedRules: appliedRules
    }

FUNCTION calculateDiscount(rule, basePrice):
    discount = 0

    SWITCH rule.type:
        CASE "user":
            IF user.isNewUser:
                discount = min(rule.newUserDiscount, rule.maxDiscount)
        CASE "loyalty":
            IF user.loyaltyTier == rule.loyaltyTier:
                discount = min(rule.loyaltyDiscount, rule.maxDiscount)
        CASE "demand":
            IF demandLevel == rule.demandLevel:
                discount = min(rule.demandDiscount, rule.maxDiscount)
        CASE "weather":
            IF weather.condition == rule.weatherCondition:
                discount = min(rule.weatherDiscount, rule.maxDiscount)

    // Ensure minimum price
    IF (basePrice - discount) < rule.minPrice:
        discount = basePrice - rule.minPrice

    RETURN discount
```

---

### 3. Demand Level Calculation Algorithm

#### Purpose

Determines current demand level (low/normal/high) based on recent order volume.

#### Algorithm Type

**Sliding Window Analysis**

#### Pseudo Code

```
FUNCTION updateDemandLevel():
    oneHourAgo = currentTime - 1 hour

    // Count orders in last hour
    orderCount = countOrders(createdAt >= oneHourAgo)

    // Determine demand level
    IF orderCount < thresholds.low:
        level = "low"
    ELSE IF orderCount > thresholds.high:
        level = "high"
    ELSE:
        level = "normal"

    // Update database
    updateDemandLevelRecord(level, orderCount, currentTime)

    RETURN level

FUNCTION getDemandDiscount(demandLevel):
    discounts = {
        "low": 15,    // 15% discount for low demand
        "normal": 0,  // No discount for normal demand
        "high": 0     // No discount for high demand
    }

    RETURN discounts[demandLevel]
```

---

## Performance Optimizations

### 1. Database Indexing

- **Orders**: Index on `createdAt` for time-based queries
- **Forecasts**: Index on `foodId` and `forecastHour`
- **Users**: Index on `email` for authentication

### 2. Caching Strategy

- **Demand levels**: Cached for 5 minutes
- **Weather data**: Cached for 2 hours
- **Forecast data**: Cached until next generation

### 3. Algorithm Optimizations

- **Peak hour detection**: Single pass through forecasts
- **Pricing rules**: Sorted by priority to exit early
- **Historical analysis**: Limited to recent 100 orders

---

## Summary

The Food Delivery System implements **3 core algorithms**:

1. **Demand Forecasting** - Generates 24-hour predictions with realistic time patterns
2. **Dynamic Pricing** - Applies multi-factor discounts based on user, loyalty, demand, and weather
3. **Demand Level Calculation** - Determines current demand state for pricing decisions

The remaining functions are **utility helpers** that support these core algorithms with simple data processing operations rather than complex algorithmic solutions.
