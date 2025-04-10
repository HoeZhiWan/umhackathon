// Dummy weather function implementation
export function dummy_getCurrentWeather(location: string, unit: string = 'Celsius') {
  return {
    location,
    temperature: unit === 'Celsius' ? 22 : 72,
    unit: unit || 'Celsius',
    description: 'Sunny',
    humidity: '65%'
  };
}

// Generate fake forecast data for the specified number of days
export function dummy_getWeatherForecast(location: string, days: number = 3, unit: string = 'Celsius') {
  const forecast = [];
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Thunderstorms'];
  const today = new Date();
  
  for (let i = 0; i < Math.min(days || 3, 7); i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i + 1);
    
    // Generate random temperature with some variance
    const baseTemp = unit === 'Celsius' ? 22 : 72;
    const variance = Math.floor(Math.random() * 10) - 5;
    const temperature = baseTemp + variance;
    
    // Pick a random condition
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      temperature,
      unit: unit || 'Celsius',
      condition
    });
  }
  
  return {
    location,
    forecast,
    unit: unit || 'Celsius'
  };
}
