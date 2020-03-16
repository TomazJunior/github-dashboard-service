'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});
const upsertUser = async (accessToken, user) => {
  const { data: { data } } = await axios.post(`${process.env.userDataServiceEndpoint}/info`, {...user}, {...getHeaders(accessToken)});
  const { email, name, type, location, avatarUrl } = data;
  return { email, name, type, location, avatarUrl };
};

module.exports = {
  upsertUser
}