<template>
    <div>
        <div style="height: 100px">
            <el-button type="primary" size="large" @click="onShowSkuInputDialog(true)">
                添加
            </el-button>
            <el-dialog title="SKU详情" :visible.sync="skuInput" width="30%" center>
                <div>标题</div>
                <el-input v-model="skuTitle" placeholder=""></el-input>
                <div>SPU</div>
                <el-select v-model="spuNumber" placeholder="请选择" :disabled="isEditSku">
                    <el-option
                        v-for="item in spuInfos"
                        :key="item.spu_number"
                        :label="item.spu_number + '-' + item.name"
                        :value="item.spu_number"
                    ></el-option>
                </el-select>
                <div>数量</div>
                <el-input
                    v-model="skuNum"
                    onkeyup="this.value = this.value.replace(/[^\d]/g,'');"
                ></el-input>
                <div>单价(元)</div>
                <el-input
                    v-model="skuPrice"
                    onkeyup="this.value = this.value.replace(/[^\d]/g,'');"
                ></el-input>
                <div>图片</div>
                <el-upload
                    :auto-upload="false"
                    action="https://www.y2ss.online/uploader/api/upload/file"
                    class="avatar-uploader"
                    :show-file-list="true"
                    :on-change="handleChange"
                    :before-upload="beforeAvatarUpload"
                    :limit="1"
                >
                    <i class="el-icon-upload" style="margin-top: 20px"></i>
                    <div class="el-upload__text">将文件拖到此处</div>
                </el-upload>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="onShowSkuInputDialog(false)">取 消</el-button>
                    <el-button type="primary" @click="addNewSku">
                        <div v-if="isEditSku == true">编辑</div>
                        <div v-else>新增</div>
                    </el-button>
                </span>
            </el-dialog>
        </div>
        <div>
            <el-table
                :data="tableData"
                border
                style="width: 100%"
                v-loading="loading"
                sort-by="sku_number"
            >
                <el-table-column prop="sku_number" label="编码" width="150"></el-table-column>
                <el-table-column prop="spu_number" label="SPU编码" width="150"></el-table-column>
                <el-table-column prop="title" label="标题" width="120"></el-table-column>
                <el-table-column prop="num" label="数量" width="120"></el-table-column>
                <el-table-column
                    prop="price"
                    label="单价（元）"
                    :formatter="priceFormatter"
                    width="120"
                ></el-table-column>
                <el-table-column prop="image" label="图片" width="200"></el-table-column>
                <el-table-column
                    prop="is_sale"
                    label="售卖中"
                    :formatter="saleFormatter"
                    width="80"
                ></el-table-column>
                <el-table-column
                    prop="is_hot"
                    label="热点商品"
                    :formatter="hotFormatter"
                    width="80"
                ></el-table-column>
                <el-table-column prop="updated_by" label="最后修改人" width="120"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="120"></el-table-column>
                <el-table-column prop="updated_at" label="更新时间" width="120"></el-table-column>
                <el-table-column fixed="right" label="操作" width="200">
                    <template slot-scope="scope">
                        <div style="margin: 5px">
                            <el-button @click="handleClick(scope.row)" type="text" size="small">
                                编辑
                            </el-button>
                            <el-dropdown>
                                <el-button v-if="scope.row.is_sale == 1" type="text" size="small">
                                    下架
                                </el-button>
                                <el-button v-else type="text" size="small">上架</el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        @click.native="onSkuSaleOrNot(true, scope.row)"
                                    >
                                        上架
                                    </el-dropdown-item>
                                    <el-dropdown-item
                                        @click.native="onSkuSaleOrNot(false, scope.row)"
                                    >
                                        下架
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <el-button size="small" @click="delSku(scope.row)" type="text">
                                删除
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
        fetchSpuInfo() {
            this.$axios
                .get(Constants.SERVER_PRE_URL + '/good/spu/tiny')
                .then(res => {
                    console.log(res);
                    if (res.status == 200 && res.data.code == 0) {
                        this.spuInfos = res.data.data;
                    } else {
                        this.$message.error('加载SPU列表失败');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        onSkuSaleOrNot(flag, row) {
            console.log(flag);
            console.log(row);
            this.$axios
                .put(Constants.SERVER_PRE_URL + '/good/sku/sale', {
                    skuNumber: row.sku_number,
                    onSale: flag ? 1 : 0,
                    num: 0,
                    price: 0,
                })
                .then(res => {
                    if (res.status == 200) {
                        this.$message.success(flag ? '上架成功' : '下架成功');
                        this.loadSku();
                    } else {
                        this.$message.error('更新失败');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        handleClick(row) {
            this.isEditSku = true;
            this.skuNumber = row.sku_number;
            this.spuNumber = row.spu_number;
            this.skuTitle = row.title;
            this.imageUrl = row.image;
            this.skuPrice = row.price / 100;
            this.skuNum = row.num;
            this.skuInput = true;
        },
        onShowSkuInputDialog(flag) {
            this.isEditSku = false;
            this.skuNumber = '';
            this.skuTitle = '';
            this.skuInfo = '';
            this.skuPrice = 0;
            this.skuNum = 0;
            this.imageUrl = '';
            this.skuInput = flag;
        },
        handleChange(file) {
            console.log('handleChange', file);
            console.log(file);
            const formData = new FormData();
            formData.append('file', file.raw);
            formData.append('tag', 'feedback');
            this.uploading = true;
            let config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: this.$store.state.token,
                },
            };
            this.$axios
                .post('https://www.y2ss.online/uploader/api/upload/file', formData, config)
                .then(res => {
                    console.log(res);
                    if (res.status == 200 && res.data.code == 0) {
                        this.$message.success('上传成功');
                        this.imageUrl = res.data.url;
                    } else {
                        console.log(res);
                        this.$message.error('上传失败, error:' + res.data.message);
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.$message.error('上传失败');
                });
        },
        addNewSku() {
            if (this.isEditSku) {
                this.$axios
                    .put(Constants.SERVER_PRE_URL + '/good/sku', {
                        spuNumber: this.spuNumber,
                        title: this.skuTitle,
                        num: Number(this.skuNum),
                        price: this.skuPrice * 100,
                        image: this.imageUrl,
                        skuNumber: this.skuNumber,
                    })
                    .then(res => {
                        console.log(res)
                        if (res.status == 200) {
                            if (res.data == '') {
                                this.$message.success('编辑成功');
                                this.isEditSku = false;
                                this.skuInput = false;
                                this.skuTitle = '';
                                this.skuInfo = '';
                                this.imageUrl = '';
                                this.skuNumber = '';
                                this.loadSku();
                            } else if (res.data.code == 10003) {
                                this.$message.error('商品正在销售中');
                            } else if (res.data.code == 10002) {
                                this.$message.error('该sku不存在');
                            }
                        } else {
                            this.$message.error('编辑失败');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                if (this.spuNumber == '' || this.skuTitle == '') {
                    this.$message.error('请填写完整');
                    return;
                }
                this.$axios
                    .post(Constants.SERVER_PRE_URL + '/good/sku', {
                        spuNumber: this.spuNumber,
                        title: this.skuTitle,
                        num: Number(this.skuNum),
                        price: this.skuPrice * 100,
                        image: this.imageUrl,
                    })
                    .then(res => {
                        if (res.status == 200) {
                            this.$message.success('添加成功');
                            this.skuInput = false;
                            this.skuTitle = '';
                            this.spuNumber = '';
                            this.skuInfo = '';
                            this.skuPrice = 0;
                            this.skuNum = 0;
                            this.imageUrl = '';
                            this.skuNumber = '';
                            this.loadSku();
                        } else {
                            this.$message.error('添加失败');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        if (err.status == 422) {
                            this.$message.error('缺少参数');
                        }
                    });
            }
            console.log('add new sku');
        },
        delSku(row) {
            this.$axios
                .delete(Constants.SERVER_PRE_URL + '/good/sku', {
                    data: { number: row.sku_number },
                })
                .then(res => {
                    console.log(res);
                    if (res.status == 200) {
                        if (res.data == '') {
                            this.$message.success('删除成功');
                            this.loadSku();
                        } else if (res.data.code == 10002) {
                            this.$message.error('该SKU不存在');
                            this.loadSku();
                        } else if (res.data.code == 10003) {
                            this.$message.error('该SKU正在销售中');
                        }
                    } else {
                        this.$message.error('删除失败');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        beforeAvatarUpload(file) {
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!');
            }
            return isLt2M;
        },
        loadSku() {
            this.loading = true;
            this.$axios
                .get(
                    Constants.SERVER_PRE_URL +
                        '/good/sku?page=' +
                        this.currentPage +
                        '&limit=' +
                        this.limit
                )
                .then(res => {
                    console.log(res);
                    this.loading = false;
                    if (res.status == 200 && res.data.code == 0) {
                        const data = res.data.data;
                        const pageInfo = data.meta;
                        const skus = data.data;
                        this.total = pageInfo.total;
                        this.tableData = skus;
                    } else {
                        this.$message.error('加载失败');
                    }
                })
                .catch(err => {
                    this.loading = false;
                    console.log(err);
                });
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.currentPage = val;
            this.fetchSpuInfo();
        },
        hotFormatter(row, column) {
            return row.is_hot ? '是' : '否';
        },
        saleFormatter(row, column) {
            return row.is_sale ? '是' : '否';
        },
        priceFormatter(row, column) {
            return row.price / 100;
        },
    },
    data() {
        return {
            skuPrice: 0,
            skuNum: 0,
            skuNumber: '',
            skuTitle: '',
            skuInfo: '',
            imageUrl: '',
            skuInput: false,
            tableData: [],
            loading: false,
            currentPage: 1,
            limit: 10,
            total: 0,
            editSkuDialog: false,
            isEditSku: false,
            spuNumber: '',
            spuInfos: [],
        };
    },
    mounted() {
        this.fetchSpuInfo();
        this.loadSku();
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
