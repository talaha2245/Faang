import express from 'express';
// importing router 
import modelRouter from './model.router.js';
import Authrouter from './Auth.router.js';
import githubrouter from './githubsocre.js';
import leetcoderouter from './Leetcode.router.js';

const MainRouter = express.Router();
MainRouter.use('/model',modelRouter);
MainRouter.use('/auth',Authrouter);
MainRouter.use('/github',githubrouter);
MainRouter.use('/leetcode',leetcoderouter);

export default MainRouter;

