<template>
    <div>
        <div style="height: 100px">
            <el-button type="primary" size="large" @click="onShowSpuInputDialog(true)">
                添加
            </el-button>
            <el-dialog title="SPU详情" :visible.sync="spuInput" width="30%" center>
                <div>标题</div>
                <el-input v-model="spuTitle" placeholder=""></el-input>
                <div>介绍</div>
                <el-input v-model="spuInfo" placeholder=""></el-input>
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
                    <el-button @click="onShowSpuInputDialog(false)">取 消</el-button>
                    <el-button type="primary" @click="addNewSpu">
                        <div v-if="isEditSpu == true">编辑</div>
                        <div v-else>新增</div>
                    </el-button>
                </span>
            </el-dialog>
        </div>
        <div>
            <el-table :data="tableData" border style="width: 100%" v-loading="loading">
                <el-table-column prop="spu_number" label="编码" width="150"></el-table-column>
                <el-table-column prop="name" label="标题" width="120"></el-table-column>
                <el-table-column prop="intro" label="介绍" width="120"></el-table-column>
                <el-table-column prop="image" label="图片" width="200"></el-table-column>
                <el-table-column prop="updated_by" label="最后修改人" width="120"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="120"></el-table-column>
                <el-table-column prop="updated_at" label="更新时间" width="120"></el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button @click="handleClick(scope.row)" type="text" size="small">
                            编辑
                        </el-button>
                        <el-button
                            slot="reference"
                            size="small"
                            @click="delSpu(scope.row)"
                            type="text"
                        >
                            删除
                        </el-button>
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
        handleClick(row) {
            this.isEditSpu = true;
            this.spuNumber = row.spu_number;
            this.spuTitle = row.name;
            this.spuInfo = row.intro;
            this.imageUrl = row.image;
            this.spuInput = true;
        },
        onShowSpuInputDialog(flag) {
            this.isEditSpu = false;
            this.spuNumber = '';
            this.spuTitle = '';
            this.spuInfo = '';
            this.imageUrl = '';
            this.spuInput = flag;
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
                        this.loadSpu();
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
        addNewSpu() {
            if (this.isEditSpu) {
                this.$axios
                    .put(Constants.SERVER_PRE_URL + '/good/spu', {
                        spuNumber: this.spuNumber,
                        spuName: this.spuTitle,
                        intro: this.spuInfo,
                        image: this.imageUrl,
                    })
                    .then(res => {
                        if (res.status == 200) {
                            this.$message.success('编辑成功');
                            this.isEditSpu = false;
                            this.spuInput = false;
                            this.spuTitle = '';
                            this.spuInfo = '';
                            this.imageUrl = '';
                            this.spuNumber = '';
                            this.loadSpu();
                        } else {
                            this.$message.error('编辑失败');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                this.$axios
                    .post(Constants.SERVER_PRE_URL + '/good/spu', {
                        spuName: this.spuTitle,
                        intro: this.spuInfo,
                        image: this.imageUrl,
                    })
                    .then(res => {
                        if (res.status == 200) {
                            this.$message.success('添加成功');
                            this.spuInput = false;
                            this.spuTitle = '';
                            this.spuInfo = '';
                            this.imageUrl = '';
                            this.spuNumber = '';
                            this.loadSpu();
                        } else {
                            this.$message.error('添加失败');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            console.log('add new spu');
        },
        delSpu(row) {
            this.$axios
                .delete(Constants.SERVER_PRE_URL + '/good/spu', {
                    data: { spuNumber: row.spu_number },
                })
                .then(res => {
                    if (res.status == 200) {
                        if (res.data == '') {
                            this.$message.success('删除成功');
                            this.spuNumber = '';
                            this.loadSpu();
                        } else if (res.data.code == 10006) {
                            this.$message.error('该SPU还有关联的SKU');
                        } else if (res.data.code == 10001) {
                            this.$message.error('该SPU不存在');
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
        loadSpu() {
            this.loading = true;
            this.$axios
                .get(
                    Constants.SERVER_PRE_URL +
                        '/good/spu?page=' +
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
                        const spus = data.data;
                        this.total = pageInfo.total;
                        this.tableData = spus;
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
            this.loadSpu();
        },
    },
    data() {
        return {
            spuTitle: '',
            spuInfo: '',
            imageUrl: '',
            spuInput: false,
            tableData: [],
            loading: false,
            currentPage: 1,
            limit: 10,
            total: 0,
            editSpuDialog: false,
            isEditSpu: false,
            spuNumber: '',
        };
    },
    mounted() {
        this.loadSpu();
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
