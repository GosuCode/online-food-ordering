# Database Seeding Scripts

This directory contains scripts for seeding and managing the database with dummy data for development and testing purposes.

## Available Scripts

### 1. Seed Data (`seedData.js`)

Creates comprehensive dummy data for all models in the food delivery system.

**Usage:**

```bash
npm run seed-data
```

**What it creates:**

- **6 Users** with different loyalty tiers and order histories
- **10 Food Items** across various categories (pizza, burger, momo, drinks, etc.)
- **200 Orders** with realistic order patterns over the last 30 days
- **8 Pricing Rules** for dynamic pricing system
- **3 Demand Levels** (low, normal, high)
- **5 Weather Data** entries for different cities
- **1 Forecast Configuration** with default ARIMA parameters
- **1,680 Historical Demand** records (7 days × 24 hours × 10 food items)
- **240 Sample Forecasts** (24 hours × 10 food items)

### 2. Verify Data (`verifyData.js`)

Verifies that the seeded data was created correctly and shows sample records.

**Usage:**

```bash
npm run verify-data
```

**What it shows:**

- Count of records in each collection
- Sample users with their loyalty tiers and spending
- Sample food items with ratings and prices
- Sample orders with status and ratings
- Sample pricing rules and weather data
- Sample forecasts with confidence levels

## User Accounts Created

| Name         | Email           | Password    | City      | Loyalty Tier | Orders | Total Spent |
| ------------ | --------------- | ----------- | --------- | ------------ | ------ | ----------- |
| John Doe     | john@gmail.com  | password123 | Kathmandu | Gold         | 15     | $2,500      |
| Jane Smith   | jane@gmail.com  | password123 | Pokhara   | Silver       | 8      | $1,200      |
| Mike Johnson | mike@gmail.com  | password123 | Chitwan   | Bronze       | 3      | $450        |
| Sarah Wilson | sarah@gmail.com | password123 | Lalitpur  | Bronze       | 0      | $0          |
| David Brown  | david@gmail.com | password123 | Bhaktapur | Platinum     | 25     | $5,000      |
| Admin User   | admin@gmail.com | admin123    | Kathmandu | Bronze       | 0      | $0          |

## Food Items Created

| Name             | Price   | Category    | Rating | Reviews |
| ---------------- | ------- | ----------- | ------ | ------- |
| Margherita Pizza | Rs. 450 | pizza       | 4.5⭐  | 120     |
| Chicken Burger   | Rs. 350 | burger      | 4.3⭐  | 85      |
| Momo (Chicken)   | Rs. 200 | momo        | 4.7⭐  | 200     |
| Cold Coffee      | Rs. 150 | cold_drinks | 4.2⭐  | 95      |
| Hot Soup         | Rs. 180 | soup        | 4.4⭐  | 75      |
| Fried Rice       | Rs. 280 | rice        | 4.1⭐  | 60      |
| Chocolate Cake   | Rs. 320 | dessert     | 4.6⭐  | 45      |
| Fresh Juice      | Rs. 120 | cold_drinks | 4.0⭐  | 30      |
| Veg Momo         | Rs. 180 | momo        | 4.3⭐  | 110     |
| Pepperoni Pizza  | Rs. 500 | pizza       | 4.4⭐  | 90      |

## Pricing Rules Created

1. **New User Discount** - 10% off for new users
2. **Bronze Loyalty Discount** - 5% off for bronze tier (5+ orders, $1000+ spent)
3. **Silver Loyalty Discount** - 7% off for silver tier (10+ orders, $2000+ spent)
4. **Gold Loyalty Discount** - 10% off for gold tier (20+ orders, $4000+ spent)
5. **Platinum Loyalty Discount** - 15% off for platinum tier (50+ orders, $10000+ spent)
6. **Low Demand Discount** - 15% off when demand is low
7. **Hot Weather Cold Drink Discount** - 10% off cold drinks on hot days
8. **Cold Weather Hot Food Discount** - 10% off hot food on cold days

## Weather Data Created

| City      | Temperature | Condition |
| --------- | ----------- | --------- |
| Kathmandu | 22°C        | normal    |
| Pokhara   | 25°C        | hot       |
| Chitwan   | 28°C        | hot       |
| Lalitpur  | 20°C        | normal    |
| Bhaktapur | 18°C        | cold      |

## Forecast Data Created

- **Historical Demand**: 7 days of hourly demand data for each food item
- **Sample Forecasts**: 24-hour forecasts for each food item with confidence intervals
- **Demand Patterns**: Realistic meal-time patterns (higher demand during breakfast, lunch, dinner)
- **Weather Integration**: Weather factors affecting demand predictions

## Order Patterns

The script creates realistic order patterns:

- **200 orders** distributed over the last 30 days
- **Random order times** throughout the day
- **1-4 items** per order
- **1-3 quantity** per item
- **Realistic statuses** (placed, confirmed, preparing, out_for_delivery, delivered)
- **Random ratings** for delivered orders (3-5 stars)

## Usage Examples

### Clear and Reseed Database

```bash
# This will clear all existing data and create fresh dummy data
npm run seed-data
```

### Verify Data After Seeding

```bash
# Check that all data was created correctly
npm run verify-data
```

## Notes

- The script automatically clears existing data before seeding
- All passwords are hashed using bcrypt
- Phone numbers follow the 10-digit format required by the model
- Email addresses use Gmail format as required by validation
- Addresses include required fields (street, city, state)
- Order addresses are properly formatted as objects
- All data follows the validation rules defined in the models

## Troubleshooting

If you encounter validation errors:

1. Check that all required fields are present
2. Verify data formats match model validation rules
3. Ensure email addresses use Gmail format
4. Make sure phone numbers are exactly 10 digits
5. Verify state values match the enum options

The verification script will help identify any issues with the seeded data.
