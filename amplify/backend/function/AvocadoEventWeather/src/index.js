const axios = require("axios");
const isBefore = require("date-fns/isBefore");
const addDays = require("date-fns/addDays");
const getMilliseconds = require("date-fns/getMilliseconds");
const parse = require("date-fns/parse");
const startOfDay = require("date-fns/startOfDay");
const eachDayOfInterval = require("date-fns/eachDayOfInterval");

const buildDarkSkyUrl = (lat, lng, date) =>
  `https://api.darksky.net/forecast/a3931117869060163bdfb0e713d6531f/${lat},${lng},${date}`;

const ICON_MAP = {
  rain: "RAINY",
  sleet: "SNOWY",
  "clear-day": "SUNNY",
  "clear-night": "SUNNY",
  snow: "SNOWY",
  wind: "WINDY",
  fog: "CLOUDY",
  cloudy: "CLOUDY",
  "partly-cloudy-day": "SUNNY",
  "partly-cloudy-night": "SUNNY",
  hail: "SNOWY",
  thunderstorm: "RAINY",
  tornado: "WINDY"
};

const getDatesForForecast = startDate => {
  const today = startOfDay(new Date());
  const eventStartDate = startOfDay(parse(startDate, "yyyy-MM-dd", new Date()));
  const start = isBefore(today, eventStartDate) ? eventStartDate : today;
  const end = addDays(start, 6);

  const allDates = eachDayOfInterval({ start, end });

  return allDates.map(date => getMilliseconds(date));
};

const getForecast = async options => {
  const dates = getDatesForForecast(options.start);

  const darkSkyData = await Promise.all(
    dates.map(async date => {
      const url = buildDarkSkyUrl(options.lat, options.lng, date);
      const { data } = await axios.get(url);
      return data;
    })
  );

  const weather = darkSkyData[0].daily
    ? darkSkyData.map(day => {
        const data = day.daily.data[0];

        return {
          temp: Math.round(data.temperatureHigh),
          icon: ICON_MAP[data.icon]
        };
      })
    : [];

  return weather;
};

exports.handler = async function(event, context) {
  try {
    const {
      venue: {
        location: { lat, lng }
      },
      dates: { start }
    } = event.source;

    const response = await getForecast({ lat, lng, start });

    context.done(null, response);
  } catch (error) {
    context.done(error.message);
  }
};
