'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});

const login = async (accessToken, user) => {
  console.log('userDataService.login', 'process started');
  const { data: { data } } = await axios.post(`${process.env.userDataServiceEndpoint}/login`, {...user}, {...getHeaders(accessToken)});
  const { id, email, name, type, location, avatarUrl, dashboardId } = data;
  console.log('userDataService.login', 'process completed');
  return { id, email, name, type, location, avatarUrl, dashboardId };
};

const logout = async (headers) => 
  await axios.post(`${process.env.userDataServiceEndpoint}/logout`, undefined, {headers});

module.exports = {
  login,
  logout
}