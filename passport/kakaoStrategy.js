'use strict';

const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

//step1
module.exports = () => {
    passport.use(new KakaoStrategy ({
        clientID : process.env.KAKAO_ID,
        callbackURL : '/auth/kakao/callback',
    }, //step2
    async(accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
            const exUser = await User.findOne({
                where : {snsId : profile.id, provider:'kakao'},
            });
            if(exUser) {
                done(null, exUser);
            } //step3 
            else {
                const newUser = await User.create({
                    email : profile._json && profile._json.kakao_account_email,
                    nick : profile.displayName,
                    snsId : profile.id,
                    provider : 'kakao',
                });
                done(null, newUser);
            }
        } catch(error) {
            console.error(error);
            done(error);
        }   
    }));
};

// passport-kakao 모듈로부터 Strategy 생성자를 불러와 전략을 구현합니다. 
// step1:
// 로컬 로그인과 마찬가지로 카카오 로그인에 대한 설정을 합니다. 
// clientID는 카카오에서 발급해주는 아이디입니다. 
// 노출되지 않아야 하므로 process.env.KAKAO_ID로 설정했습니다. 
// 나중에 아이디를 발급받아 .env 파일에 넣을 것입니다. 
// callbackURL은 카카오로부터 인증결과를 받을 라우터 주소입니다. 
// 아래에서 라우터를 작성할 때 이 주소를 사용합니다. 

// step2 :
// 먼저 기존에 카카오를 통해 회원가입한 사용자가 있는지 조회합니다. 
// 있다면 이미 회원가입 되어 있는 경우이므로 사용자 정보와 함께 done 함수를 호출하고
// 전략을 종료합니다. 

// step3 :
// 카카오를 통해 회원 가입한 사용자가 없다면 회원 가입을 진행합니다. 
// 카카오에서는 인증 후 callbackURL에 적힌 주소로 accessToken, refreshToken과 profile을 보냅니다. 
// profile에는 사용자 정보들이 들어있습니다.  카카오에서 보내주는 것이므로 데이터는 
// console.log 메서드로 확인해보는 것이 좋습니다. 
// profile 객체에서 원하는 정보를 꺼내와 회원가입을 하면 됩니다. 
// 사용자를 생성한 뒤 done 함수를 호출합니다. 
