'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

//step1
module.exports = () =>{
    passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
    }, async (email, password, done) =>{  //step2
        try {
            const exUser = await User.findOne({where : {email}});
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {
                    done(null, exUser);
                } else {
                    done(null, false, {message : '비밀번호가 일치하지 않습니다.'});
                }
            } else {
                done(null, false, {message : '가입되지 않은 회원입니다.'});
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};


// 로그인 전략을 구현했습니다. 
// passport-local 모듈에서 Strategy 생성자를 불러와 그안에 전략을 구현하면 됩니다.
// step1 
// : LocalStrategy 생성자의 첫 번째 인수로 주어진 객체는 전략에 관한 설정을 하는 곳입니다. 
// usernameField와 passwordField에는 일치하는 로그인 라우터의 req.body 속성명을 
// 적으면 됩니다. req.body.email에 이메일 주소가, req.body.password에 비밀번호가 담겨 
// 들어오므로 email과 password를 각각 넣습니다. 
// step2
// : 실제 전략을 수행하는 async 함수입니다. LocalStrategy 생성자의 두 번째 인수로 들어갑니다. 
// 첫 번째 인수에서 넣어준 eamil과 password는 각각 async 함수의 첫번째와 두번째 매개변수가 됩니다. 
// 세 번째 매개변수인 done함수가 passport.authenticate의 콜백함수입니다. 

// 전략의 내용은 다음과 같습니다. 먼저 사용자 데이터베이스에서 일치하는 이메일이 있는지 
// 찾은 후, 있다면 bcrypt의 compare 함수로 비밀번호를 비교합니다. 
// 비밀번호까지 일치한다면 done 함수의 두 번째 인수로 사용자 정보를 넣어 보냅니다. 
// 두번째 인수를 사용하지 않는 경우는 로그인에 실패했을 때뿐입니다. 
// done 함수의 첫 번째 인수를 사용하는 경우는 서버쪽에서 에러가 발생했을 때고,
// 세 번째 인수를 사용하는 경우는 로그인 처리 과정에서 비밀번호가 일치하지 않거나 
// 존재하지 않는 회원일 때와 같은 사용자 정의 에러가 발생했을 때 입니다. 

// done이 호출된 후에는 다시 passport.authenticate의 콜백함수에서 나머지 로직이 실행됩니다. 
// 로그인에 성공했다면 메인 페이지로 리다이렉트 되면서 로그인 폼 대신 회원 정보가 들 것입니다. 

