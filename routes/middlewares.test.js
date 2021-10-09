'use strict';

const { use } = require('passport');
// test('1+1은 2입니다.', ()=>{
//     expect(1+1).toEqual(2);
// });

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

//step1
describe('isLoggedIn', ()=> {
    const res = {
        status : jest.fn(()=>res),
        send : jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함.', ()=>{
        const req = {
            isAuthenticated : jest.fn(()=>true),
        };
        isLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });

    test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함.', ()=>{
        const req = {
            isAuthenticated : jest.fn(()=> false),
        };
        isLoggedIn(req, res, next);
        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith('로그인 필요');
    });
});

describe('isNotLoggedIn', ()=>{
    const res = {
        redirect : jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함.', ()=> {
        const req = {
            isAuthenticated : jest.fn(()=>true),
        };
        isNotLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인한 상태입니다.');
        expect(res.redirect).toBeCalledWith(`/?error=${message}`);
    });

    test('로그인 되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함.', ()=>{
        const req = {
            isAuthenticated : jest.fn(()=>false),
        };
        isNotLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });
});

// [middlewares.js]
// exports.isLoggedIn = (req, res, next) => {
//     if(req.isAuthenticated()) {
//         next();
//     } else {
//         res.status(403).send('로그인 필요');
//     }
// };

// exports.isNotLoggedIn = (req, res, next) => {
//     if(!req.isAuthenticated()) {
//         next();
//     } else {
//         const message = encodeURIComponent('로그인한 상태입니다.');
//         res.redirect(`/?error=${message}`);
//     }
// };

// 실제 코드에서는 익스프레스가 req, res객체와 next함수를 인수로 넣었기에 
// 사용할 수 있었지만, 테스트 환경에서는 어떻게 넣어야 할지 고민됩니다. 
// req 객체에는 isAuthencated 메서드가 존재하고 
// res 객체에도 status, send, redirect 메서드가 존재하는데 
// 코드가 성공적으로 실행하게 하려면, 이것들을 모두 구현해야 합니다. 
// 이럴 때에는 과감하게 가짜 객체와 함수를 만들어 넣으면 됩니다. 
// 테스트의 역할은 코드나 함수가 제대로 실행되는지를 검사하고 값이 일치하는지를 
// 검사하는 것이므로, 테스트 코드의 객체가 실제 익스프레스 객체가 아니어도 굅니다. 
// 이렇게 가짜 객체, 가짜 함수를 넣는 행위를 모킹(mocking)이라고 합니다. 

// step1
// : 먼저 isLoggedIn부터 테스트 해보겠습니다. 
// req, res, next를 모킹했습니다. 함수를 모킹할 때는 jest.fn 메서드를 사용합니다. 
// 함수의 반환값을 지정하고 싶다면 jest.fn(()=>반환값)을 사용하면 됩니다. 
// isAuthenticated는 로그인 여부를 알려주는 함수이므로 테스트 내용에 따라 
// true나 false를 반환하고, res.status(403).send('hello')처럼 메서드 체이닝이 
// 가능해야 하므로 res를 반환하고 있습니다. 

// 실제로는 req, res 객체에 많은 속성과 메서드가 들어 있겠지만, 지금 테스트에서는 
// isAuthenticated나 status, send만 사용하므로 나머지는 과감하게 제외하면 됩니다. 

// test 함수 내부에서는 모킹된 객체와 함수를 사용해 isLoggedIn 미들웨어를 호출한 후 
// expect로 원하는 내용대로 실행되었는지 체크하면 됩니다. 
// toBeCalledTimes(숫자)는 정확하게 몇 번 호출되었는지를 체크하는 메서드이고 
// toBeCalledWith(인수)는 특정인수와 함께 호출되었는지를 체크하는 메서드입니다. 

// 이렇게 작은 단위의 함수나 모듈이 의도된 대로 정확히 작동하는지 테스트 하는것을 
// 유닛테스트(unit test) 또는 단위 테스트라고 부릅니다. 
// 나중에 함수를 수정하면 기존에 작성해둔 테스트는 실패하게 됩니다. 
// 따라서 함수가 수정되었을 때 어떤 부분이 고장나는지를 테스트를 통해 알수가 있습니다. 
// 테스트 코드도 기존 코드가 변경된 것에 맞춰서 수정해야 합니다. 

// 라우터와 긴밀하게 연결되어 있는 미들웨어도 테스트 해보겠습니다. 
// 단 이때는 유닛 테스트를 위해 미들웨어를 분리해야 합니다. 
// routes/use.js 파일을 다시 한번 보겠습니다. 