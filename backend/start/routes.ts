/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ }) => {
  return { hello: 'world' }
})
// account
Route
  .group(() => {
    Route.get('/index', 'UserController.index'),
      Route.post('/', 'UserController.add'),
      Route.post('/login', 'UserController.login')
  })
  .prefix('/user')
  .namespace('App/Controllers/Http')
  .middleware('logger')
// sku/spu
Route
  .group(() => {
    Route.get('/index', 'GoodsController.index'),
      Route.post('/spu', 'GoodsController.add'),
      Route.put('/spu', 'GoodsController.updateSpu'),
      Route.get('/spu', 'GoodsController.fetchSpus'),
      Route.delete('/spu', 'GoodsController.deleteSpu'),
      Route.get('/spu/tiny', 'GoodsController.fetchSpusTiny')
    Route.post('/sku', 'GoodsController.setSku'),
      Route.put('/sku', 'GoodsController.updateSku'),
      Route.get('/sku', 'GoodsController.fetchSkus'),
      Route.delete('/sku', 'GoodsController.deleteSku'),
      Route.put('/sku/sale', 'GoodsController.skuSale')
  })
  .prefix('/good')
  .namespace('App/Controllers/Http')
  .middleware('auth')
  .middleware('logger')

// sale
Route
  .group(() => {
    Route.get('/index', 'SaleController.index'),
      Route.post('/', 'SaleController.purchaseProduct'),
      Route.post('/payment', 'SaleController.payment'),
      Route.post('/hot', 'SaleController.hotPurchase')
  })
  .prefix('/sale')
  .namespace('App/Controllers/Http')
  .middleware('auth')
  .middleware('logger')

Route
  .group(() => {
    Route.get('/', 'SaleController.fetchProducts'),
      Route.get('/hot', 'SaleController.fetchHotProduct')
  })
  .prefix('/product')
  .namespace('App/Controllers/Http')
  .middleware('logger')
// file
Route
  .group(() => {
    Route.post('/', 'FileController.uploadImage')
  })
  .prefix("/upload")
  .namespace('App/Controllers/Http')
  .middleware('auth')
  .middleware('logger')
// order
Route
  .group(() => {
    Route.get('/', 'OrderController.fetchOrders')
  })
  .prefix("/order")
  .namespace('App/Controllers/Http')
  .middleware('auth')
  .middleware('logger')