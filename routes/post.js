'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

// 게시글을 데이터베이스에 저장한 후 게시글 내용에서 해시태그를 정규표현식(/#[^\s#]+/g)으로
// 추출해냅니다. 추출한 해시태그는 데이터베이스에 저장하는데, 먼저 slice(1).toLowerCase()를
// 사용해 해시태크에서 #를 떼고 소문자로 바꿉니다. 
// 저장할 때는 findOrCreate 메서드를 사용했습니다. 
// 이 시퀄라이즈 메서드는 데이터베이스에 해시태그가 존재하면 가져오고, 존재하지 않으면 
// 생성한 후 가져옵니다. 결괏값으로 [모델, 생성 여부]를 반환하므로 
// result.map(r=>r[0])으로 모델만 추출해냈습니다. 
// 마지막으로 해시태그 모델들을 post.addHashtags 메서드로 게시글과 연결합니다.

// 실제 서버 운영시 
// 현재 multer 패키지는 이미지를 서버 디스크에 저장합니다. 디크크에 저장하면 간단하기는 하지만, 
// 서버에 문제가 생겼을 때 이미지가 제공되지 않거나 손실될 수도 있습니다. 
// 따라서 AWS S3나 클라우드 스토리지 (Cloud Storage) 같은 정적 파일 제공 서비스를 이용하여
// 이미지를 따로 저장하고 제공하는 것이 좋습니다. 