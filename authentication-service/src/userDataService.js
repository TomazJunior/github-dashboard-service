'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});

const login = async (accessToken, user) => {
  const { data: { data } } = await axios.post(`${process.env.userDataServiceEndpoint}/${user.email}/login`, {...user}, {...getHeaders(accessToken)});
  const { email, name, type, location, avatarUrl } = data;
  return { email, name, type, location, avatarUrl };
};

const logout = async (headers) => 
  await axios.post(`${process.env.userDataServiceEndpoint}/logout`, undefined, {headers});

module.exports = {
  login,
  logout
}