function WeatherCard({ weather, unit }) {
  return (
    <div className="card">
      <h2>{weather.name}</h2>

      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt="icon"
      />

      <h1 className="temp">
        {Math.round(weather.main.temp)}°
        {unit === "metric" ? "C" : "F"}
      </h1>

      <p>{weather.weather[0].description}</p>
      <p>Humidity: {weather.main.humidity}%</p>
      <p>
        Wind: {weather.wind.speed}{" "}
        {unit === "metric" ? "m/s" : "mph"}
      </p>
    </div>
  );
}

export default WeatherCard;
