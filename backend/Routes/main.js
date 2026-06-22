const express = require('express');
// importing router 
const modelRouter = require('./model.router');
const Authrouter = require('./Auth.router');
const githubrouter = require('./githubsocre');
const leetcoderouter = require('./Leetcode.router');

const MainRouter = express.Router();
MainRouter.use('/model',modelRouter);
MainRouter.use('/auth',Authrouter);
MainRouter.use('/github',githubrouter);
MainRouter.use('/leetcode',leetcoderouter);

module.exports = MainRouter;

