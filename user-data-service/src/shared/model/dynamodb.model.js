const dynogels = require('dynogels');
const joi = require('joi');
const { GITHUB_SOURCE_ID } = require('../sources');
const { DEFAULT_CONTACT_EMAIL } = require('../constants');

const DashboardSchema = {
  id: dynogels.types.uuid(),
  userId: joi.string().required(),
  title: joi.string().default('dashboard #1')
};

const Dashboard = dynogels.define(process.env.dashboardsTableName, {
  hashKey: 'userId',
  rangeKey: 'id',
  timestamps: true,
  schema: DashboardSchema,
  tableName: process.env.dashboardsTableName
});

const CardSchema = {
  id: dynogels.types.uuid(),
  position: joi.number(),
  dashboardId: joi.string().required(),
  title: joi.string().allow(''),
  userId: joi.string().required(),
  type: joi.object().required(),
  repository: joi.object().required(),
  filter: joi.object().unknown(),
};

const Card = dynogels.define(process.env.cardsTableName, {
  hashKey: 'dashboardId',
  rangeKey: 'id',
  timestamps: true,
  schema: CardSchema,
  tableName: process.env.cardsTableName
});

const ContactSchema = {
  id: dynogels.types.uuid(),
  email: joi.string().allow('', null).empty(['', null]).default(DEFAULT_CONTACT_EMAIL),
  name: joi.string().allow(null),
  subject: joi.string().allow(null),
  message: joi.string().allow(null),
  userId: joi.string().allow(null),
  resolved: joi.boolean().default(false),
  authenticated: joi.boolean().default(false)
};

const Contact = dynogels.define(process.env.contactsTableName, {
  hashKey: 'email',
  rangeKey: 'id',
  timestamps: true,
  schema: ContactSchema,
  tableName: process.env.contactsTableName
});

const TokenSchema = {
  token: joi.string().required(),
  userId: joi.string().required(),
  externalToken: joi.string().required(),
  expiresIn: joi.string().allow(null),
  refreshToken: joi.string().allow(null),
  refreshTokenExpiresIn: joi.string().allow(null),
  sourceId: joi.string().default(GITHUB_SOURCE_ID),
  destroyedAt: joi.date()
}

const Token = dynogels.define(process.env.tokensTableName, {
  hashKey: 'token',
  rangeKey: 'userId',
  timestamps: true,
  schema: TokenSchema,
  tableName: process.env.tokensTableName,
  indexes: [
    { hashKey: 'externalToken', name: 'ExternalTokenIndex', type: 'global' }
  ]
});

const UserSourceSchema = {
  id: joi.string().required(),
  sourceId: joi.string().default(GITHUB_SOURCE_ID),
  userId: joi.string().required(),
  installationId: joi.string().allow(null),
};

const UserSource = dynogels.define(process.env.userSourcesTableName, {
  hashKey: 'id',
  rangeKey: 'sourceId',
  timestamps: true,
  schema: UserSourceSchema,
  tableName: process.env.userSourcesTableName,
  indexes: [
    { hashKey: 'userId', name: 'UserIdIndex', type: 'global' }
  ]
});

const UserSchema = {
  id: dynogels.types.uuid(),
  email: joi.string().allow(null),
  name: joi.string().allow(null),
  type: joi.string(),
  location: joi.string().allow(null),
  avatarUrl: joi.string().allow(null),
  dashboardId: joi.string().allow(null),
};

const User = dynogels.define(process.env.usersTableName, {
  hashKey: 'id',
  timestamps: true,
  schema: UserSchema,
  tableName: process.env.usersTableName,
  indexes: [
    { hashKey: 'email', name: 'EmailIndex', type: 'global' }
]
});

module.exports = {
  Card,
  Contact,
  Dashboard,
  Token,
  User,
  UserSource
};