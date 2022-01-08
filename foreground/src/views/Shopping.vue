<template>
    <div>
        <div>
            <el-table :data="tableData" border style="width: 100%" v-loading="loading">
                <el-table-column prop="order_number" label="订单号" width="160"></el-table-column>
                <el-table-column prop="sku_number" label="SKU编码" width="160"></el-table-column>
                <el-table-column prop="uid" label="购买用户" width="120"></el-table-column>
                <el-table-column
                    prop="buy_time"
                    label="购买时间"
                    width="120"
                    :formatter="buyTimeFormatter"
                ></el-table-column>
                <el-table-column prop="num" label="数量" width="120"></el-table-column>
                <el-table-column
                    prop="price"
                    label="总价"
                    width="120"
                    :formatter="priceFormatter"
                ></el-table-column>
                <el-table-column
                    prop="status"
                    label="订单状态"
                    width="120"
                    :formatter="statusFormatter"
                ></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="120"></el-table-column>
                <el-table-column fixed="right" label="操作" width="200">
                    <template slot-scope="scope">
                        <div v-if="scope.row.status == 0" style="margin: 5px">
                            <el-button @click="payment(scope.row)" type="text" size="small">
                                付款
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="limit"
                layout="total, prev, pager, next"
                :total="total"
            ></el-pagination>
        </div>
    </div>
</template>

<script>
import Constants from '../components/Constants.vue';
export default {
    methods: {
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.currentPage = val;
            this.loadOrder();
        },
        loadOrder() {
            this.loading = true;
            this.$axios
                .get(
                    Constants.SERVER_PRE_URL +
                        '/order/?page=' +
                        this.currentPage +
                        '&limit=' +
                        this.limit +
                        '&flag=1'
                )
                .then(res => {
                    console.log(res);
                    this.loading = false;
                    if (res.status == 200 && res.data.code == 0) {
                        const data = res.data.data;
                        const pageInfo = data.meta;
                        const orders = data.data;
                        this.total = pageInfo.total;
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
        priceFormatter(row, column) {
            return row.price / 100;
        },
        buyTimeFormatter(row, column) {
            return new Date(parseInt(row.buy_time)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        },
        statusFormatter(row, column) {
            return row.status == 0 ? '待支付' : row.status == 1 ? '支付成功' : '订单超时';
        },
        payment(row) {
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)',
            });
            this.$axios
                .post(
                    Constants.SERVER_PRE_URL +
                        '/sale/payment', {
                            orderNumber: row.order_number
                        }
                )
                .then(res => {
                    console.log(res);
                    loading.close();
                    if (res.status == 200) {
                        if (res.data == '') {
                            this.$message.success('支付成功');
                            this.loadOrder()
                        } else if (res.data.code == 10200) {
                            this.$message.error('订单超时');
                        }
                    } else {
                        this.$message.error('加载失败');
                    }
                })
                .catch(err => {
                    loading.close();
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
            total: 0,
        };
    },
    mounted() {
        this.loadOrder();
    },
};
</script>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 270px;
    height: 100px;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
