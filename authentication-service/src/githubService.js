'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});
const getAuthenticatedUser = async (accessToken) => {
  const { data } = await axios.get(`${process.env.githubServiceEndpoint}/user`, {...getHeaders(accessToken)});
  return data;
};

module.exports = {
  getAuthenticatedUser
}