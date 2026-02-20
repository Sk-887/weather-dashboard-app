import { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import WeatherMap from "./components/WeatherMap";
import WeatherCard from "./components/WeatherCard";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [theme, setTheme] = useState("dark");
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_KEY = "636d8e27d01bbb44c213be8e48ffe58c";

  const weatherType = weather?.weather?.[0]?.main || "Default";

  // 🔥 Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ===============================
  // 🔥 IMPROVED CITY SEARCH (Geocoding)
  // ===============================
  const fetchWeather = async (city, customUnit = unit) => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      // Step 1: Get coordinates using Geocoding API
      const geoRes = await axios.get(
        "https://api.openweathermap.org/geo/1.0/direct",
        {
          params: {
            q: city,
            limit: 1,
            appid: API_KEY,
          },
        }
      );

      if (!geoRes.data.length) {
        setError("Location not found");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoRes.data[0];

      // Step 2: Fetch weather using coordinates
      const weatherRes = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: customUnit,
          },
        }
      );

      setWeather(weatherRes.data);
      await fetchExtraData(lat, lon, customUnit);

    } catch (err) {
      setError("City not found");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔥 Forecast + AQI
  // ===============================
  const fetchExtraData = async (lat, lon, customUnit = unit) => {
    const forecastRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      { params: { lat, lon, appid: API_KEY, units: customUnit } }
    );

    const dailyData = forecastRes.data.list.filter(
      (_, index) => index % 8 === 0
    );

    setForecast(dailyData);

    const aqiRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/air_pollution",
      { params: { lat, lon, appid: API_KEY } }
    );

    setAqi(aqiRes.data.list[0].main.aqi);
  };

  // ===============================
  // 🔥 Fetch By Coordinates
  // ===============================
  const fetchWeatherByCoords = async (lat, lon, customUnit = unit) => {
    try {
      setLocationLoading(true);
      setLoading(true);
      setError("");

      const weatherRes = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        { params: { lat, lon, appid: API_KEY, units: customUnit } }
      );

      setWeather(weatherRes.data);
      await fetchExtraData(lat, lon, customUnit);

    } catch (err) {
      setError("Unable to fetch location weather");
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  // ===============================
  // 🔥 Auto Detect Location
  // ===============================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        () => {
          fetchWeather("Bangalore");
        }
      );
    } else {
      fetchWeather("Bangalore");
    }
  }, []);

  const getAqiLabel = (value) => {
    switch (value) {
      case 1: return "🟢 Good";
      case 2: return "🟡 Fair";
      case 3: return "🟠 Moderate";
      case 4: return "🔴 Poor";
      case 5: return "🟣 Very Poor";
      default: return "Unknown";
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (weather) fetchWeather(weather.name, newUnit);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`dashboard ${theme} ${weatherType}`}>
      <div className="top-bar">
        <div>
          <h1 className="title">🌤 Weather Dashboard</h1>

          <div className="datetime">
            <p>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="controls">
          <SearchBar onSearch={fetchWeather} />

          <button className="unit-btn" onClick={toggleUnit}>
            {unit === "metric" ? "°C" : "°F"}
          </button>

          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            className="location-btn"
            onClick={() => {
              if (!navigator.geolocation) {
                setError("Geolocation not supported");
                return;
              }

              navigator.geolocation.getCurrentPosition(
                (position) => {
                  fetchWeatherByCoords(
                    position.coords.latitude,
                    position.coords.longitude
                  );
                },
                () => setError("Location permission denied")
              );
            }}
          >
            📍 Use My Location
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <>
          <div className="dashboard-grid">
            <div className="main-card">
              <WeatherCard weather={weather} unit={unit} />
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="forecast-section">
              <h2>5-Day Forecast</h2>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p>
                      {new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="icon"
                    />
                    <p>
                      {Math.round(day.main.temp)}°
                      {unit === "metric" ? "C" : "F"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <WeatherMap
            key={`${weather.coord.lat}-${weather.coord.lon}`}
            lat={weather.coord.lat}
            lon={weather.coord.lon}
            city={weather.name}
          />
        </>
      )}
    </div>
  );
}

export default App;
