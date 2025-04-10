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

// Function to display data visualization windows
export function display_data_window(visualization_type: 'chart' | 'graph' | 'stats', title?: string) {
  // This function returns a structured response with a client action
  const windowType = visualization_type as 'chart' | 'graph' | 'stats';
  
  // Create a descriptive response about what will be displayed
  const visualizationDescriptions = {
    chart: "bar chart showing sales by category",
    graph: "line graph showing performance trends over time",
    stats: "key metrics including total revenue, customers, average order value, and conversion rate"
  };
  
  // Generate a stable ID based on the window type and title
  const windowTitle = title || (windowType === 'chart' ? 'Sales Analysis' : 
                     windowType === 'graph' ? 'Performance Trends' : 'Key Statistics');
  
  // Create a stable unique ID by combining type and title (and timestamp as fallback)
  const resultId = `window-${windowType}-${windowTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  
  return {
    success: true,
    window_type: windowType,
    title: windowTitle,
    description: `A ${visualizationDescriptions[windowType]} has been displayed.`,
    id: resultId, // Add a stable ID here
    // Add a structured client action that the frontend can interpret
    clientAction: {
      type: "ADD_DATA_WINDOW",
      params: {
        visualization_type: windowType,
        title: windowTitle,
        id: resultId // Include the ID in the params as well
      }
    }
  };
}
