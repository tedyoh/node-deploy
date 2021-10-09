'use strict';
// //case : 컨트롤러 분리 전 
// const express = require('express');

// const {isLoggedIn} = require('./middlewares');
// const User = require('../models/user');

// const router = express.Router();

// router.post('/:id/follow', isLoggedIn, async(req, res, next)=>{
//     try {
//         const user = await User.findOne({where: {id:req.user.id}});
//         if (user) {
//             await user.addFollowing(parseInt(req.params.id, 10));
//             res.send('success');
//         } else {
//             res.status(404).send('no user');
//         }
//     } catch (error) {
//         console.error(error);
//         next(error);
//     }
// });

// module.exports = router;


// case2 : 컨트롤러 분리 후 수정
const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { addFollowing } = require('../controllers/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, addFollowing);

module.exports = router;

//이제 addFollowing 컨트롤러를 테스트해야 하는데요. controllers/user.test.js를 작성합니다. 





// POST /user/:id/follow 라우터 입니다. :id 부분이 req.params.id 가 됩니다. 
// 먼저 팔로우할 사용자를 데이터베이스에서 조회한 후, 시퀄라이즈에서 추가한
// addFollowing 메서드로 현재 로그인한 사용자와의 관계를 지정합니다. 

// 팔로잉 관계가 생겼으므로 req.user에도 팔로워와 팔로잉 목록을 저장합니다. 
// 앞으로 사용자 정보를 불러 올때는 팔로워와 팔로잉 목록도 같이 불러오게 됩니다. 
// req.user를 바꾸려면 deserializeUser를 조작해야 합니다. 

// 노드 서비스 테스트
// POST /:id/follow 라우터의 async 함수 부분은 따로 분리할 수 있습니다.
// controllers 폴더를 만들고 그 안에 user.js를 만듭니다. 
// 라우터에서 응답을 보내는 미들웨어를 특별히 컨트롤러라고 부릅니다. 
