'uses strict'

const Controller = require('egg').Controller;


class UserRelationController extends Controller {

    async follow() {
        const { fromId, toId } = this.ctx.query;
        if(!fromId || !toId) {
            return Promise.reject('error: 缺少必要参数fromId或toId');
        }
        const fromUser = await this.service.userService.getUserDetail(fromId);
        if(!fromUser) {
            return Promise.reject('error: 没有找到执行关注操作的用户');
        }
        const toUser = await this.service.userService.getUserDetail(toId);
        if(!toUser) {
            return Promise.reject('error: 没有找到被关注的用户');
        }
        const res = await this.service.userRelationService.follow(fromId, toId);
        console.log('在关注控制器中', res);
    }
}

module.exports = UserRelationController;