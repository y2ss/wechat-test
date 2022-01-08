<template>
    <div>
        <el-container style="height: 500px; border: 1px solid #eee">
            <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
                <el-menu router @select="onSelectItem">
                    <el-submenu index="1">
                        <template slot="title">
                            <i class="el-icon-menu"></i>
                            商品配置
                        </template>
                        <el-menu-item index="spu">SPU管理</el-menu-item>
                        <el-menu-item index="sku">SKU管理</el-menu-item>
                        <el-menu-item index="order">订单管理</el-menu-item>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title">
                            <i class="el-icon-menu"></i>
                            商城
                        </template>
                        <el-menu-item index="production">商品</el-menu-item>
                        <el-menu-item index="hot">热门商品</el-menu-item>
                        <el-menu-item index="shopping">购物车</el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-container>
                <el-header style="text-align: right; font-size: 12px">
                    <div v-if="isLogin == false">
                        <el-button
                            @click="onLoginShowAction"
                            type="text"
                            style="color: white; cursor: pointer"
                        >
                            <router-link :to="{ name: 'login', params: { userId: 123 } }">
                                登录 / 注册
                            </router-link>
                        </el-button>
                    </div>
                    <div v-else>
                        <div @click="onHandlerExitAction" style="cursor: pointer">退出</div>
                    </div>
                </el-header>

                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style>
.el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
}

.el-aside {
    color: #333;
}
</style>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            isLogin: false,
            loginDialog: false,
        };
    },
    methods: {
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        onSelectItem(item) {
            console.log(item);
        },
        onLoginShowAction(flag) {
            console.log('onLoginShowAction');
        },
        onHandlerExitAction() {
            this.$store.commit('setToken', '');
        },
    },
    computed: {
        login() {
            return this.$store.state.token;
        },
    },
    watch: {
        login: {
            immediate: true,
            handler: function (newval) {
                this.isLogin = this.$store.state.token != '';
            },
        },
    },
    mounted() {
        let token = localStorage.getItem('token');
        if (token != null && token != '') {
            this.$store.commit('setToken', token);
        }
    },
};
</script>
