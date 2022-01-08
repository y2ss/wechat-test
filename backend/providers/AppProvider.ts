import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import MQPool from 'App/Utils/MQPool'
import RedisUtils from 'App/Utils/RedisUtils'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    MQPool.instance
    RedisUtils.instance
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready
    const {
      DatabaseQueryBuilder
    } = this.app.container.use('Adonis/Lucid/Database')

    DatabaseQueryBuilder.macro('getCount', async function () {
      const result = await this.count('* as total')
      return BigInt(result[0].total)
    })
  }

  public async ready () {
    
    //await Redis.set('foo', 'bar')
  }

  public async shutdown () {
    MQPool.instance.close()
    // Cleanup, since app is going down
  }
}
