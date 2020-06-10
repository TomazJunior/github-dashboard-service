
const axios = require('axios');

class UserDataService {

  constructor(logger) {
      this.logger = logger;
  }

  async getToken(userId, token) {
    this.logger.debug('UserDataService.getToken', 'process started');
    const {userDataServiceEndpoint} = process.env;
    const { data } = await axios.get(
      `${userDataServiceEndpoint}/${userId}/token`, 
      {
        headers : {
          authorization: token
        },
      }
    );
    this.logger.debug('UserDataService.getToken', 'process completed');
    return data;
  }

}

module.exports = UserDataService;
