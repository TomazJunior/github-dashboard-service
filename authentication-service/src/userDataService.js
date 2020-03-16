'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});
const upsertUser = async (accessToken, user) => {
  const body = {
    ...user,
    currentToken: accessToken
  }
  const { data: { data } } = await axios.post(`${process.env.userDataServiceEndpoint}/info`, body, {...getHeaders(accessToken)});
  const { email, name, type, location, avatarUrl, currentToken } = data;
  return { email, name, type, location, avatarUrl, currentToken };
};

module.exports = {
  upsertUser
}