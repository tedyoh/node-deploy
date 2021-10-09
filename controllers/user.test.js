'use strict';

jest.mock('../models/user');
const User = require('../models/user');
const { addFollowing} = require('./user');


describe('addFollowing', ()=> {
    const req = {
        user : { id : 1 },
        params : { id : 2 },
    };
    const res = {
        status : jest.fn(()=>res),
        send : jest.fn(),
    };
    const next = jest.fn();

    test('사용자를 찾아 팔로잉을 추가하고 sucess를 응답해야 함.', async() => {
        User.findOne.mockReturnValue(Promise.resolve({
            addFollowing(id) {
                return Promise.resolve(true);
            }
        }));
        await addFollowing(req, res, next);
        expect(res.send).toBeCalledWith('success');
    });

    test('사용자를 못 찾으면 res.status(404).send(no user)를 호출함', async()=>{
        User.findOne.mockReturnValue(null);
        await addFollowing(req, res, next);
        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith('no user');
    });

    test('DB에서 에러가 발생하면 next(error) 호출함', async()=>{
        const error = '테스트용 에러';
        User.findOne.mockReturnValue(Promise.reject(error));
        await addFollowing(req, res, next);
        expect(next).toBeCalledWith(error);
    });
});


// addFollowing 컨트롤러가 async 함수이므로 await을 붙여야 컨트롤러가 실행 완료 된 후 
// expect 함수가 실행됩니다. 그런데 이 테스트는 실패입니다.
// 바로 User 모델 때문입니다. addFollowing 컨트롤러 안에는 User라는 모델이 들어 있습니다. 
// 이 모델은 실제 데이터베이스와 연결되어 있으므로 테스트 환경에서는 사용할 수 없습니다. 
// 따라서 User모델도 모킹해야 합니다. 

// jest에서는 모듈도 모킹할 수 있습니다. jset.mock 메서드를 사용합니다. 

// jest.mocl 메서드에 모킹할 모듈의 경로를 인수로 넣고 그 모듈을 불러 옵니다. 
// jset.mock에서 모킹할 메서드 (User.findOne)에 mockReturnValue라는 메서드를 넣습니다. 
// 이 메서드로 가짜 반환 값을 지정할 수 있습니다. 

// 첫 번째 테스트에서는 mockReturnValue 메서드를 통해 User.findOne이 {addFollowing()} 객체를
// 반환하도록 했습니다. 사용자를 찾아서 팔로잉을 추가하는 상황을 테스트하기 위해서입니다. 
// 프로미스를 반환해야 다음에 await user.addFollowing 메서드를 호출할 수 있습니다. 
// 두 번째 테스트에서는 null을 반환하여 사용자를 찾지 못한 상황을 테스트합니다. 
// 세 번째 테스트에서는 Promise.reject로 에러가 발생하도록 했습니다. 
// DB 연결에 에러가 발생한 상황을 모킹한 것입니다. 

// 이제 테스트를 통과합니다. 
// 실제 데이터베이스에 팔로잉을 등록하는 것이 아니므로 제대로 테스트되는 것인지 걱정할 수도 있습니다. 
// 이처럼 테스트를 해도 실제 서비스의 실제 데이터베이스에서는 문제가 발생할 수 있습니다. 
// 그럴때는 유닛 테스트 말고 다른 종류의 테스트를 진행해야 합니다.
// 이를 점검하기 위해 통합 테스트나 시스템 테스트를 하곤 합니다. 

// 유닛 테스트가 얼마나 진행되었는지 확인하는 => 테스트 커버리지
// 유닛 테스트를 작성하다보면, 전체 코드 중에서 어떤 부분이 테스트되고 
// 어떤 부분이 테스트되지 않는지 궁금해집니다. 
// 어떤 부분이 테스트되지 않는지를 알아야 나중에 그 부분의 테스트 코드를 작성할 수 있습니다. 
// 전체 코드 중에서 테스트되고 있는 코드의 비율과 테스트되고 있지 않은 코드의 위치를 알려주는
// jest의 기능이 있습니다. 바로 커버리지(coverage) 기능입니다. 

// 커버리지 기능을 사용하기 위해 package.json에 test 설정을 입력합니다. 

