import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import PostNewGoodValidator from "App/Validator/PostNewGoodValidator";
import PostNewSkuValidator from "App/Validator/PostNewSkuValidator";
import PageValidator from "App/Validator/PageValidator";
import UpdateSpuValidator from "App/Validator/UpdateSpuValidator";
import UpdateSkuValidator from "App/Validator/UpdateSkuValidator";
import Spu from "App/Models/Spu";
import SpuHistory from "App/Models/SpuHistory";
import SkuHistory from "App/Models/SkuHistory";
import { Snowflake } from "App/Utils/SnowFlake";
import Env from "@ioc:Adonis/Core/Env";
import Sku from "App/Models/Sku";
import ErrorCode from "App/Exceptions/ErrorCode";
import ResultBuild from "App/Utils/Result";
import RedisUtils from "App/Utils/RedisUtils";
import IdValidator from "App/Validator/IdValidator";

export default class GoodsController {
  public async index() {
    return "<p>Hello</p>";
  }

  /**
   * 添加spu
   */
  public async add(ctx: HttpContextContract) {
    await ctx.request.validate(PostNewGoodValidator);
    const spu = new Spu();

    // todo: 可以优化因时钟回滚导致重复的id
    let gen = new Snowflake({
      workerId: Number.parseInt(Env.get("PROCESS_ID")),
      seqBitLength: 6,
    });
    spu.spuNumber = "P" + gen.NextNumber().toString();
    spu.name = ctx.request.input("spuName");
    spu.intro = ctx.request.input("intro");
    spu.image = ctx.request.input("image");
    spu.updatedBy = ctx.request.input("uid");
    await spu.save();

    return ResultBuild.build(ErrorCode.SUCCESS, { spu: spu.spuNumber });
  }

  /**
   * 修改spu
   */
  public async updateSpu(ctx: HttpContextContract) {
    await ctx.request.validate(UpdateSpuValidator);
    const spu = await Spu.findBy("spu_number", ctx.request.input("spuNumber"));
    if (spu == null) {
      return ResultBuild.build(ErrorCode.SPU_NOT_EXIST);
    }
    await Database.transaction(async (trx) => {
      const history = new SpuHistory();
      history.spuNumber = spu.spuNumber;
      history.updatedBy = ctx.request.input("uid");

      history.entity = String(spu.toString());
      history.useTransaction(trx);
      await history.save();

      spu.useTransaction(trx);
      spu.name = ctx.request.input("spuName");
      spu.intro = ctx.request.input("intro");
      spu.image = ctx.request.input("image");
      spu.updatedBy = ctx.request.input("uid");
      await spu.save();
    });
  }

  /**
   * 删除spu
   */
  public async deleteSpu(ctx: HttpContextContract) {
    await ctx.request.validate(UpdateSpuValidator);
    const spu = await Spu.findBy("spu_number", ctx.request.input("spuNumber"));
    if (spu == null) {
      return ResultBuild.build(ErrorCode.SPU_NOT_EXIST);
    }
    const count = await Database.query()
      .where('spu_number', ctx.request.input("spuNumber"))
      .where('is_deleted', 0)
      .from('sku').getCount()
    if (Number(count) > 0) {
      return ResultBuild.build(ErrorCode.SKU_STILL_EXIST);
    }
    spu.isDeleted = 1;
    await spu.save();
  }

  /**
   * spu列表
   */
  public async fetchSpus(ctx: HttpContextContract) {
    await ctx.request.validate(PageValidator);
    const spus = await Spu.query()
      .where("is_deleted", 0)
      .orderBy('spu_number', 'desc')
      .paginate(ctx.request.input("page"), ctx.request.input("limit"));
    return ResultBuild.build(ErrorCode.SUCCESS, spus.toJSON());
  }

  /**
   * SPU tiny
   */
  public async fetchSpusTiny() {
    const spus = await Spu.query()
      .where("is_deleted", 0).select("spu_number", "name")
    return ResultBuild.build(ErrorCode.SUCCESS, spus);
  }

  /**
   * 添加sku
   */
  public async setSku(ctx: HttpContextContract) {
    await ctx.request.validate(PostNewSkuValidator);
    const spu = await Spu.findBy("spu_number", ctx.request.input("spuNumber"));
    if (spu == null) {
      return ResultBuild.build(ErrorCode.SPU_NOT_EXIST);
    }

    let gen = new Snowflake({
      workerId: Number.parseInt(Env.get("PROCESS_ID")),
      seqBitLength: 5,
    });
    const sku = new Sku();
    sku.skuNumber = "K" + gen.NextNumber().toString();
    sku.spuNumber = spu.spuNumber;
    sku.title = ctx.request.input("title");
    sku.image = ctx.request.input("image");
    sku.num = ctx.request.input("num");
    sku.price = ctx.request.input("price");
    sku.updatedBy = ctx.request.input("uid");
    await sku.save();
  }

  /**
   * 修改sku
   */
  public async updateSku(ctx: HttpContextContract) {
    await ctx.request.validate(UpdateSkuValidator);
    const sku = await Sku.findBy("sku_number", ctx.request.input("skuNumber"));
    if (sku == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_EXIST);
    }
    if (sku.isSale == 1) {
      // 正在售卖
      return ResultBuild.build(ErrorCode.SKU_IN_SALEING);
    }
    await Database.transaction(async (trx) => {
      const history = new SkuHistory();
      history.spuNumber = sku.spuNumber;
      history.skuNumber = sku.skuNumber;
      history.bundle = sku.toString();
      history.updatedBy = ctx.request.input("uid");
      history.useTransaction(trx);
      await history.save();

      sku.useTransaction(trx);
      sku.title = ctx.request.input("title");
      sku.num = ctx.request.input("num");
      sku.image = ctx.request.input("image");
      sku.price = ctx.request.input("price");
      sku.updatedBy = ctx.request.input("uid");
      if (sku.isHot) {
        // 热点商品库存redis备份一下
        RedisUtils.instance.client.set(
          RedisUtils.PRODUCT_REMAIN_KEY + sku.skuNumber,
          sku.num
        );
      }
      await sku.save();
    });
  }

  /**
   * 删除sku
   */
  public async deleteSku(ctx: HttpContextContract) {
    await ctx.request.validate(IdValidator);
    const sku = await Sku.findBy("sku_number", ctx.request.input("number"));
    if (sku == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_EXIST);
    }
    if (sku.isSale == 1) {
      // 正在售卖
      return ResultBuild.build(ErrorCode.SKU_IN_SALEING);
    }
    sku.isDeleted = 1;
    await sku.save();
  }

  /**
   * 上下架sku
   */
  public async skuSale(ctx: HttpContextContract) {
    await ctx.request.validate(UpdateSkuValidator);
    const sku = await Sku.findBy("sku_number", ctx.request.input("skuNumber"));
    if (sku == null) {
      return ResultBuild.build(ErrorCode.SKU_NOT_EXIST);
    }
    sku.isSale = ctx.request.input("onSale") ?? 0;
    await sku.save();
  }

  /**
   * sku列表
   */
  public async fetchSkus(ctx: HttpContextContract) {
    await ctx.request.validate(PageValidator);
    const skus = await Sku.query()
      .where("is_deleted", 0)
      .orderBy('sku_number', 'desc')
      .paginate(ctx.request.input("page"), ctx.request.input("limit"));
    return ResultBuild.build(ErrorCode.SUCCESS, skus.toJSON());
  }
}
