'use strict';

const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();
  kakao();
};


// 모듈 내부를 보면 passport.serializeUser와 passport.deserializeUser가 있습니다. 
// 이부분이 Passport 를 이해하는 핵심입니다. 
// serializeUser는 로그인시 실행되며, req.session(세션) 객체에 어떤 데이터를 저장할지 정하는 메서드 입니다. 
// 매개변수로 user를 받고 나서, done 함수에 두번째 인수로 user.id를 넘기고 있습니다. 
// 매개 변수 user가 어디서 오는지는 나중에 설명합니다. 지금은 그냥 사용자 정보가 들어 있다고 
// 생각하면 됩니다. 
// done 함수의 첫번째 인수는 에러 발생시 사용하는 것이고, 두 번째 인수에는 저장하고 싶은 데이터를 넣습니다. 
// 로그인시 데이터를 세션에 저장하는데 세션에 사용자 정보를 모두 저장하면 세션의 용량이 커지고
// 데이터 일관성에 문제가 발생하므로 사용자의 아이디만 저장하라고 명령한 것입니다. 
// serializeUser가 로그인 시에만 실행된다면 deseriallizeUser는 매 요청 시 실행됩니다. 
// passport.session 미들웨어가 이 메서드를 호출합니다. 
// serializeUser의 done의 두번째 인수로 넣었던 데이터가 deserializeUser에서 세션에 저장했던 아이디를 받아
// 데이터베이스에서 사용자 정보를 조회합니다. 
// 조회한 정보를 req.user에 저장하므로 앞으로 req.user를 통해 로그인한 사용자의 정보를 가져올 수 있습니다. 

// 즉 serializeUser는 사용자 정보 객체를 세션에 아이디로 저장하는 것이고,
// deserializeUser는 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러오는 것입니다. 
// 세션에 불필요한 데이터를 담아두지 않기 위한 과정입니다. 

// 전체 과정은 다음과 같습니다. 
// 1. 라우터를 통해 로그인 요청이 들어옴
// 2. 라우터에서 passport.authenticate 메서드 호출
// 3. 로그인 전략 수행
// 4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
// 5. req.login 메서드가 passport.serializeUser 호출
// 6. req.session에 사용자 아이디만 저장
// 7. 로그인 완료

// 로그인 이후의 과정은 다음과 같습니다. 
// 1. 요청이 들어옴
// 2. 라우터에 요청이 도달하기 전에 passport.session 미들웨어가 passport.deserializeUser 메서드 호출
// 3. req.session에 저장된 아이디로 데이터베이스에서 사용자 조회
// 4. 조회된 사용자 정보를 req.user에 저장
// 5. 라우터에서 req.user 객체 사용 가능

// 세션에 저장된 아이디로 사용자 정보를 조회할 때 팔로잉 목록과 팔로워 목록도 같이 조회합니다. 
// include에서 계속 attributes를 지정하고 있는데, 이는 실수로 비밀번호를 조회하는 것을 
// 방지하기 위해서입니다. 

// deserializeUser 캐싱하기
// : 라우터가 실행되기 전에 deserializeUser가 먼저 실행됩니다. 
// 따라서 모든 요청이 들어올 때마다 매번 사용자 정보를 조회하게 됩니다. 
// 서비스의 규모가 커질수록 더 많은 요청이 들어오게 되고, 그로 인해 데이터베이스도 
// 더큰 부담이 주어집니다. 따라서 사용자 정보가 빈번하게 바뀌는 것이 아니라면
// 캐싱을 해두는 것이 좋습니다. 다만, 캐싱이 유지되는 동안 팔로워와 팔로잉 정보가 갱신되지
// 않는 단점이 있으므로 캐싱 시간은 서비스 정책에 따라 조절해야 합니다. 
// 실제 서비스에서는 메모리에 캐싱하기보다는 레디스 같은 데이터베이스에 사용자 정보를 캐싱합니다. 
