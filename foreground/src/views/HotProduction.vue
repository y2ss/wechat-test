<template>
    <div id="content">
        <el-row>
            <el-col
                :span="8"
                v-for="(o, index) in tableData"
                :key="index"
                :offset="index > 0 ? 2 : 0"
            >
                <el-card :body-style="{ padding: '0px' }">
                    <div v-if="o.image">
                        <el-image :src="o.image">
                            <div slot="placeholder" class="image-slot"></div>
                        </el-image>
                    </div>
                    <div v-else>
                        <div class="image-slot"><span>暂无图片</span></div>
                    </div>
                    <div style="padding: 14px">
                        <span>{{ o.title }}</span>
                        <div>
                            <div>库存：{{ o.num }}</div>
                            <div>价格：{{ o.price / 100 }} 元</div>
                        </div>
                        <div class="bottom clearfix">
                            <el-button type="text" class="button" @click="wannaBuySomething(o)">
                                购买
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <div>
            <el-dialog title="商品详情" :visible.sync="buyDialog" width="40%" center>
                <div v-if="production.image">
                    <el-image :src="production.image">
                        <div slot="placeholder" class="image-slot"></div>
                    </el-image>
                </div>
                <div v-else>
                    <div class="image-slot"><span>暂无图片</span></div>
                </div>
                <span>{{ production.title }}</span>
                <div>
                    <div>库存：{{ production.num }}</div>
                    <div>价格：{{ production.price / 100 }} 元</div>
                </div>
                <el-input-number v-model="num" :min="1" :max="9999999" label="购买数量"></el-input-number>
                <br />
                <el-button type="text" class="button" @click="buyAction">购买</el-button>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import Constants from '../components/Constants.vue';
export default {
    methods: {
        buyAction() {
            if (this.num > this.production.num) {
                this.$message.error('没有那么多货品');
                return
            }
            this.$axios
                .post(Constants.SERVER_PRE_URL + '/sale/hot', {
                    skuNumber: this.production.sku_number,
                    num: Number(this.num),
                })
                .then(res => {
                    if (res.status == 200) {
                        if (res.data.code == 0) {
                            this.$message.success('下单成功，请去购物车中支付');
                            this.buyDialog = false;
                            this.skuNumber = '';
                            this.num = 0;
                            this.loadProduction();
                        } else if (res.data.code == 10004) {
                            this.$message.error('商品已下架');
                        } else if (res.data.code == 10005) {
                            this.$message.error('商品已售罄');
                        } else {
                            this.$message.error('网络异常请稍后再试');
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    if (err.status == 422) {
                        this.$message.error('缺少参数');
                    }
                });
        },
        wannaBuySomething(data) {
            console.log(data);
            this.production = data;
            this.buyDialog = true;
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.currentPage = val;
            this.loadOrder();
        },
        loadProduction() {
            this.loading = true;
            this.$axios
                .get(
                    Constants.SERVER_PRE_URL +
                        '/product/hot?page=' +
                        this.currentPage +
                        '&limit=' +
                        this.limit
                )
                .then(res => {
                    this.loading = false;
                    if (res.status == 200 && res.data.code == 0) {
                        const data = res.data;
                        const orders = [data.data];
                        console.log(orders)
                        this.tableData = orders;
                    } else {
                        this.$message.error('加载失败');
                    }
                })
                .catch(err => {
                    this.loading = false;
                    console.log(err);
                });
        },
    },
    data() {
        return {
            tableData: [],
            loading: false,
            currentPage: 1,
            limit: 10,
            buyDialog: false,
            production: {},
            num: 0,
        };
    },
    mounted() {
        this.loadProduction();
    },
};
</script>

<style>
.image-slot {
    width: 200px;
    height: 200px;
    background-color: wheat;
}
</style>
