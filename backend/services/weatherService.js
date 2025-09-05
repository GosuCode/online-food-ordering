import { weatherDataModel } from "../models/pricingModel.js";

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "your_api_key_here";
    this.baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  async getWeatherData(city) {
    try {
      // Check cache first
      const cachedData = await this.getCachedWeatherData(city);
      if (cachedData) {
        return cachedData;
      }

      // Fetch from API
      const weatherData = await this.fetchWeatherFromAPI(city);

      // Cache the data
      await this.cacheWeatherData(city, weatherData);

      return weatherData;
    } catch (error) {
      console.error("Error getting weather data:", error);
      // Return default weather data if API fails
      return {
        temperature: 20,
        condition: "normal",
        city: city,
      };
    }
  }

  async getCachedWeatherData(city) {
    try {
      const cached = await weatherDataModel.findOne({
        city: city.toLowerCase(),
        expiresAt: { $gt: new Date() },
      });

      if (cached) {
        return {
          temperature: cached.temperature,
          condition: cached.condition,
          city: cached.city,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting cached weather data:", error);
      return null;
    }
  }

  async fetchWeatherFromAPI(city) {
    const url = `${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherData = {
      temperature: data.main.temp,
      condition: this.categorizeWeather(data.weather[0].main, data.main.temp),
      city: city,
    };

    console.log(`\n🌤️ WEATHER DATA for ${city}:`);
    console.log(`   Temperature: ${weatherData.temperature}°C`);
    console.log(`   Condition: ${weatherData.condition}`);
    console.log(`   Weather Main: ${data.weather[0].main}`);

    return weatherData;
  }

  categorizeWeather(weatherMain, temperature) {
    // Categorize weather for pricing decisions
    if (temperature < 10) return "cold";
    if (temperature > 30) return "hot";
    return "normal";
  }

  async cacheWeatherData(city, weatherData) {
    try {
      const expiresAt = new Date(Date.now() + this.cacheExpiry);

      await weatherDataModel.findOneAndUpdate(
        { city: city.toLowerCase() },
        {
          city: city.toLowerCase(),
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          lastUpdated: new Date(),
          expiresAt: expiresAt,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error caching weather data:", error);
    }
  }

  // Get weather-based discount for food category
  getWeatherDiscount(weatherCondition, foodCategory) {
    const discounts = {
      cold: {
        soup: 15,
        hot_drinks: 15,
        dessert: 10,
      },
      hot: {
        cold_drinks: 10,
        ice_cream: 15,
        salad: 10,
      },
      normal: {},
    };

    return discounts[weatherCondition]?.[foodCategory] || 0;
  }
}

export default new WeatherService();
