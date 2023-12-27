import axios from "axios";

/**
 * Get coordinates per given address
 * @param {String} city required
 * @param {String} county required
 * @param {String} state required
 * @returns {String} coordinates
 */
export const getCoordinates = async ({ city, county, state }) => {
  let formattedAddress = `${city},${county},${state}`;

  return axios
    .get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        q: formattedAddress,
      },
    })
    .then((response) => {
      const data = response.data;
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
      }

      return null;
    })
    .catch((err) => {
      return null;
    });
};

/**
 * Get zip code per given address using getCoordinates
 * @param {String} city required
 * @param {String} county required
 * @param {String} state required
 * @returns {String} zipcode
 */
export const getZipcode = async ({ city, county, state }) => {
  const coordinates = await getCoordinates({
    city,
    county,
    state,
  });

  if (!coordinates) {
    return null;
  }

  const { latitude, longitude } = coordinates;

  const { data } = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  );

  if (data) {
    if (data.address && data.address.postcode) {
      return data.address.postcode;
    }
    return null;
  }

  return null;
};
