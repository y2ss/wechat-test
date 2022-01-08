import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostNewAccountValidator from 'App/Validator/PostNewAccountValidator'
import { Snowflake } from 'App/Utils/SnowFlake'
import Env from '@ioc:Adonis/Core/Env'
import ErrorCode from 'App/Exceptions/ErrorCode'
import ResultBuild from 'App/Utils/Result'
import Account from 'App/Models/Account'
import TokenGenerator from 'App/Utils/TokenGenerator'
import LoginValidator from 'App/Validator/LoginValidator'
import RedisUtils from 'App/Utils/RedisUtils'

export default class UserController {
    public async index() {
        return "<p>Hello</p>"
    }

    /**
     * TODO
     * 登陆态失效
     */

    /**
     * 注册账户
     */
    public async add(ctx: HttpContextContract) {
        await ctx.request.validate(PostNewAccountValidator)
        try {
            let gen = new Snowflake({ workerId: Number.parseInt(Env.get('PROCESS_ID')), seqBitLength: 5 })
            const account = new Account()
            account.account = ctx.request.input('account')
            account.pwd = ctx.request.input('pwd')
            account.source = ctx.request.input('source')
            account.uid = gen.NextNumber()
            account.token = TokenGenerator.get(account.account)
            await account.save()
            await RedisUtils.instance.client.set(RedisUtils.TOKEN_KEY + account.token, account.uid, "EX", 60 * 60)
            return ResultBuild.build(ErrorCode.SUCCESS, account.token)
        } catch(error) {
            console.log(error)
            return ResultBuild.build(ErrorCode.CREATE_USER_ERROR )
        }
    }

    /**
     * 登陆
     */
    public async login(ctx: HttpContextContract) {
        await ctx.request.validate(LoginValidator)
        const account = await Account.query()
            .where('account', ctx.request.input('account'))
            .where('pwd', ctx.request.input('pwd')).first()
        if (account == null) {
            return ResultBuild.build(ErrorCode.USER_PWD_NOT_CORRENT)
        }
        account.token = TokenGenerator.get(account.account)
        await account.save()
        await RedisUtils.instance.client.set(RedisUtils.TOKEN_KEY + account.token, account.uid, "EX", 60 * 60)
        return ResultBuild.build(ErrorCode.SUCCESS, account.token)
    }

}