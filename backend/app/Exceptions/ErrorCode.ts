export default class ErrorCode {
    public static SUCCESS = 0
    public static EMPTY = 1
    public static NETWORK_ERROR = 10000 //网络错误
    // spu/sku
    public static SPU_NOT_EXIST = 10001   // spu不存在
    public static SKU_NOT_EXIST = 10002   // sku不存在
    public static SKU_IN_SALEING = 10003  // 商品正在售卖中
    public static SKU_NOT_IN_SALE = 10004 // 商品下架
    public static SKU_NOT_ENOUGH = 10005 // 库存不足
    public static SKU_STILL_EXIST = 10006 // 关联的sku存在
    // order
    public static OREDER_STATUS_ERROR = 10200 // 订单状态错误

    // 鉴权
    public static USER_PWD_NOT_CORRENT = 20001  // 账号或密码错误
    public static CREATE_USER_ERROR = 20002
}