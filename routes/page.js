'use strict';

const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

//팔로잉/팔로워 숫자와 팔로우 버튼을 표시
router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
  });
  
  router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird' });
  });
  
  router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: '회원가입 - NodeBird' });
  });
  
  router.get('/', async (req, res, next) => {
    try {
      const posts = await Post.findAll({
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
      });
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
  
  router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
      return res.redirect('/');
    }
    try {
      const hashtag = await Hashtag.findOne({ where: { title: query } });
      let posts = [];
      if (hashtag) {
        posts = await hashtag.getPosts({ include: [{ model: User }] });
      }
  
      return res.render('main', {
        title: `${query} | NodeBird`,
        twits: posts,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
  
  module.exports = router;

// 로그인한 경우에는 req.user가 존재하므로 팔로잉/팔로워 수와 팔로워 아이디 리스틀 넣습니다. 
// 팔로워 아이디 리스트를 넣는 이유는 팔로워 아이디 리스트에 게시글 작성자의 아이디가 존재 하지 않으면
// 팔로우 버튼을 보여주기 위해서 입니다.  

// 해시 태그로 조회하는 GET /hashtag 라우터 입니다. 
// 쿼리 스트링으로 해시태그 이름을 받고 해시태그 값이 없는 경우 메인 페이지로 돌려보냅니다. 
// 데이터베이스에서 해당 해시태그를 검색한 후, 해시태그가 있다면 
// 시퀄라이즈에서 제공하는 getPosts 메서드로 모든 게시글을 가져옵니다. 
// 가져올때는 작성자 정보를 합칩니다. 조회 후 메인 페이지를 렌더링하면서 전체 게시글 대신 
// 조회된 게시글만 twits에 넣어 렌더링 합니다. 