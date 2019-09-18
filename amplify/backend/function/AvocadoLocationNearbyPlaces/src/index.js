const axios = require("axios");

const buildPlacesUrl = (lat, lng) =>
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDOysoULo6R3hZIz_DqxZWHTd4CA3Pm6bY&type=restaurant&rankby=distance&location=${lat},${lng}`;

const buildGoogleMapsUrl = (name, address) =>
  encodeURIComponent(
    `https://www.google.com/maps/search/?query=${name} ${address},17z`
  );

const getNearbyPlaces = async (lat, lng) => {
  try {
    const { data } = await axios.get(buildPlacesUrl(lat, lng));

    return data.results.map(place => ({
      icon: place.icon,
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      googleMapsUrl: buildGoogleMapsUrl(place.name, place.vicinity)
    }));
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

exports.handler = async function(event, context) {
  try {
    const {
      location: { lat, lng }
    } = event.source;

    const response = await getNearbyPlaces(lat, lng);

    context.done(null, response);
  } catch (error) {
    context.done(error.message);
  }
};
