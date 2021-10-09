'use strict';

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//step1 : 회원가입 라우터
router.post('/join', isNotLoggedIn, async(req, res, next)=>{
    const {email, nick, password} = req.body;
    try {
        const exUser = await User.findOne({where : {email}});
        if(exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password,12);
        await User.create({
            email,
            nick, 
            password : hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

//step2 : 로그인 라우터
router.post('/login', isNotLoggedIn, (req, res, next)=> {
    passport.authenticate('local', (authError, user, info) =>{
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); //미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

//step3 : 로그아웃 라우터
router.get('/logout', isLoggedIn, (req, res)=>{
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

//step 4
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect : '/',
}), (req, res)=>{
    res.redirect('/');
});

module.exports = router;





// 나중에 app.js와 연결할때 /auth 접두사를 붙일 것이므로 라우터의 주소는 각각
// /auth/join, /suth/login, /auth/logout이 됩니다. 

// 1. 회원가입 라우터
// : 기존에 같은 이메일로 가입한 사용자가 있는지 조회한 뒤, 있다면 회원가입 페이지로 되돌려 보냅니다. 
// 단, 주소뒤에 에러를 쿼리스트링으로 표시합니다. 
// 같은 이메일로 가입한 사용자가 없다면 비밀번호를 암호화하고, 사용자 정보를 생성합니다. 
// 회원 가입시 비밀번호는 암호화해서 저장해야 합니다. 
// 이번에는 bcrypt 모듈을 사용했습니다. (crypt 모듈의 pbkdf2 메서드를 사용해서 암호화할 수도 있습니다.)
// bcrypt 모듈의 hash 메서드를 사용하면 손쉽게 비밀번호를 암호화 할 수 있습니다. 
// bcrypt의 두번째 인수는 pbkdf2의 반복 횟수와 비슷한 기능을 합니다.
// 숫자가 커질수록 비밀번호를 알아내기 어려워지지만 암호화 시간도 오래 걸립니다. 
// 12 이상을 추천하며, 31까지 사용할 수 있습니다. 
// 프로미스를 지원하는 함수이므로 await를 사용했습니다. 

// 2. 로그인 라우터 
// : 로그인 요청이 들어오면 passport.authenticate('local') 미들웨어가 로컬 로그인 전략을
// 수행합니다. 미들웨어인데 라우터 미들웨어 안에 들어있습니다. 미들웨어에 사용자 정의 기능을
// 추가하고 싶을 때 이렇게 할 수 있습니다. 이럴 때는 내부 미들웨어에 (req, res, next)를 
// 인수로 제공해서 호출하면 됩니다. 
// 전략 코드는 잠시 후에 작성합니다. 전략이 성공하거나 실패하면 authenticate 메서드의 콜백 함수가
// 실행됩니다. 콜백 함수의 첫 번째 매개변수 (authErr) 값이 있다면 실패한 것입니다. 
// 두 번째 매개변수 값이 있다면 성공한 것이고, req.login 메서드를 호출합니다. 
// Passport는 req 객체에 login과 logout 메서드를 추가합니다. 
// req.login은 passport.serializeUser를 호출합니다. req.login에 제공하는 user 객체가 
// serializeUser로 넘어가게 됩니다. 

// 3.로그아웃 라우터
// :req.logout 메서드는 req.user 객체를 제거하고 req.session.destroy는 req.session 
// 객체의 내용을 제거합니다.
// 세션 정보를 지운 후 메인 페이지로 되돌아갑니다.
// 로그인이 해제 되어 있을 것입니다. 

// 4. 카카오 로그인
// GET /auth/kakao로 접근하면 카카오 로그인 과정이 시작됩니다. 
// layout.html의 카카오톡 버튼에 /auth/kakao 링크가 붙어 있습니다. 
// GET /auth/kakao에서 로그인 전략을 수행하는데,
// 처음에는 카카오 로그인 창으로 리다이렉트합니다. 
// 그창에서 로그인 후 성공 여부 결과를 GET /auth/kakao/callback 으로 받습니다. 
// 이 라우터에서는 카카오 로그인 전략을 다시 수행합니다. 

// 로컬 로그인과 다른 점은 passport.authenticate 메서드에 콜백 함수를 제공하지 않는다는 점입니다. 
// 카카오 로그인은 로그인 성공시 내부적으로 req.login을 호출하므로 우리가 직접 호출할 
// 필요가 없습니다. 
// 콜백 함수 대신 로그인에 실패했을 때 어디로 이동할 지를 failureRedirect 속성에 적고, 
// 성공 시에도 어디로 이동할지를 다음 미들웨어에 적습니다.

// 추가한 auth 라우터를 app.js에 연결합니다. 