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



/* case1
step1
: beforeAll 이라는 함수가 추가되었습니다. 현재 테스트를 실행하기 전에 
수행되는 코드입니다. 여기에 sequelize.async()를 넣어 데이터베이스에 테이블을 생성하고 있습니다. 
비슷한 함수로 afterAll(모든 테스트가 끝난 후 ), befroreEach(가각의 테스트 수행 전), 
afterEach(각각의 테스트 수행 후)가 있습니다. 테스트를 위한 값이나 외부 환경을 
설정할 때 테스트 전 후로 수행할 수 있도록 사용하는 함수입니다. 

step2
:supertest 패키지로 부터 request 함수를 불러와서 app 객체를 인수로 넣습니다. 
여기에 get, post, put, patch, delete 등의 메서드로 원하는 라우터에 요청을 
보낼수 있습니다. 데이터는 send 메서드에 담아서 보냅니다. 
그 후 예상되는 응답의 결과를 expect 메서드의 인수로 제공하면 그 값이 일치하는지
테스트합니다. 
현재 테스트에서는 Location 헤더가 / 인지, 응답의 상태 코드가 302인지 테스트 하고 있습니다. 
done을 두번째 인수로 넣어서 테스트가 마무리되었음을 알려야 합니다. 

supertest를 사용하면 app.listen 을 수행하지 않고도 서버 라우터를 실행 할수 있습니다. 
통합 테스트를 할 때는 모킹을 최소한으로 하는 것이 좋지만, 
직접적인 테스트 대상이 아닌경우에는 모킹해도 됩니다.  
테스트를 하면 실패입니다 

테스트용 데이터베이스에는 현재 회원 정보가 없습니다. 
따라서 로그인 할 때 loginError가 발생하게 됩니다. 
로그인 라우터를 테스트하기 전에 회원가입 라우터부터 테스트해서 회원 정보를 넣어야 합니다. 
*/

/* case2
1.step1
:첫 번째 describe에서는 회원가입을 테스트합니다. 

2.step2
:두 번째 describe에서는 로그인한 상태에서 회원가입을 시도하는 경우를 테스트합니다. 
이때 코드의 순서가 매우 중요합니다. 로그인한 상태여야 회원가입을 테스트할 수 있으므로
로그인 요청과 회원가입 요청이 순서대로 이루어져야 합니다. 
이때 agent를 만들어서 하나이상의 요청에서 재사용할 수 있습니다. 

3.step3
:beforeEach는 각각의 테스트 실행에 앞서 먼저 실행되는 부분입니다. 
회원가입 테스트를 위해 아까 생성한 agent 객체로 로그인을 먼저 수행합니다. 
end(done)으로 beforeEach 함수가 마무리되었음을 알려야 합니다 

4.step4
: 로그인된 agent로 회원가입 테스트를 진행합니다. 로그인한 상태이므로 
'로그인한 상태입니다'라는 에러 메시지와 함께 리다이렉트 됩니다. 
*/

// 테스트를 수행하면 성공입니다. 
// 그런데 이전에 성공했던 테스트를 다시 수행하면 이번에는 실패입니다. 
// 테스트가 실패하는 이유는 이전 테스트에서 이미 topseung530@naver.com의 
// 계정을 생성했기 때문입니다. 
// 이처럼 테스트 후에 데이터베이스에 데이터가 남아있으면 
// 다음 테스트에 여향을 미칠수도 있습니다. 
// 따라서 테스트 종료 시 데이터를 정리하는 코드를 추가해야 합니다. 
// 보통 afterAll 에 정리하는 코드를 추가합니다. 

// 간단하게 sync 메서드에 force:true를 넣어 테이블을 다시 만들게 했습니다. 
// 시퀄라이즈를 쓰지 않더라도 afterAll에 데이터를 정리하는 코드를 넣으면 됩니다. 
// 테스트를 다시 수행하면 성공합니다. 



