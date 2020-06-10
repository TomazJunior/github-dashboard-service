'use strict';
const axios = require('axios');

const getHeaders = (accessToken) => ({headers: {'Authorization': `Bearer ${accessToken}`}});

const login = async (accessToken, userLoginData, user) => {
  console.log('userDataService.login', 'process started');
  const {expires_in, refresh_token, refresh_token_expires_in} = userLoginData;
  const { data: { data } } = await axios.post(`${process.env.userDataServiceEndpoint}/login`, {
    user, 
    userData: {
      expiresIn: expires_in,
      refreshToken: refresh_token,
      refreshTokenExpiresIn: refresh_token_expires_in
    }
  }, {...getHeaders(accessToken)});
  const { id, email, name, type, location, avatarUrl, dashboardId, token, installAppUrl } = data;
  console.log('userDataService.login', 'process completed');
  return { id, email, name, type, location, avatarUrl, dashboardId, access_token: token, installAppUrl };
};

const logout = async (headers) => 
  await axios.post(`${process.env.userDataServiceEndpoint}/logout`, undefined, {headers});

module.exports = {
  login,
  logout
}