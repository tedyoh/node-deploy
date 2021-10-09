'use strict';

const request = require('supertest');
const {sequelize} = require('sequelize');
const app = require('../app');
const { describe } = require('../models/user');
// const { describe } = require('../models/user');

// //case1
// //step1
// beforeAll(async() => {
//     await sequelize.sync();
// });

// //step2
// describe('POST / login', ()=> {
//     test('로그인 수행', async(done)=>{
//         request(app)
//         .post('/auth/login')
//         .send({
//             email : 'topseung530@naver.com',
//             password : 'iverson',
//         })
//         .expect('Location', '/')
//         .expect(302, done);
//     });
// });

//case2
beforeAll(async() => {
    await sequelize.sync();
});

//step1
describe('POST /join', ()=>{
    test('로그인 안 했으면 가입', (done)=> {
        request(app)
        .post('/auth/join')
        .send({
            email : 'topseung530@naver.com',
            nick : '감사랑',
            password : 'iverson',
        })
        .expect('Location', '/')
        .expect(302, done);
    });
});

//step2
describe('POST /join', ()=>{
    //step3
    const agent = request.agent(app);
    beforeEach((done)=>{
        agent 
        .post('/auth/login')
        .send({
            email : 'topseung530@naver.com',
            password : 'iverson',
        })
        .end(done);
    });
//step4
    test('이미 로그인했으면 redirect /', (done)=>{
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent
        .post('/auth/join')
        .send({
            email : 'topseung530@naver.com',
            nick : '감사랑',
            password : 'iverson',
        })
        .expect('Location', `/?error=${message}`)
        .expect(302, done);
    });
    //추가
    afterAll(async()=>{
        await sequelize.sync({force:true});
    });
});

describe('POST /login', ()=>{
    test('가입되지 않은 회원', async(done)=>{
        const message = encodeURIComponent('가입되지 않은 회원입니다.')
        request(app)
        .post('/auth/login')
        .send({
            email : 'topseung530@naver.com',
            password : 'iverson',
        })
        .expect('Location', `/?loginError=${message}`)
        .expect(302, done);
    });

    test('로그인 수행', async(done) => {
        const messgae = encodeURIComponent('비밀번호가 일치하지 않습니다.');
        request(app)
        .post('/auth/login')
        .send({
            email : 'topseung530@naver.com',
            password : 'wrong',
        })
        .expect('Location', `/?loginError=${message}`)
        .expect(302, done);
    });
});

describe('GET / logout', ()=> {
    test('로그인되어 있지 않으면 403', async(done)=>{
        request(app)
        .get('/auth/logout')
        .expect(403, done);
    });
    const agent = requset.agent(app);
    beforeEach((done)=>{
        agent
        .post('/auth/login')
        .send({
            email : 'topseung530@naver.com',
            password : 'iverson',
        })
        .end(done);
    });

    test('로그아웃 수행', async(done)=>{
        const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
        agent
        .post('/auth/logout')
        .expect('Location', '/')
        .expect(302, done);
    });

    afterAll(async()=>{
        await sequelize.sync({force:true});
    });
});
