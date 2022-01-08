<template>
    <div class="main-view">
        <div class="main-header">
            <el-button style="margin-right: 10px" @click="onClickAction(1)">登录</el-button>
            <el-button style="margin-left: 10px" @click="onClickAction(2)">注册</el-button>
        </div>
        <div class="main-body">
            <div v-if="showLogin == true" id="login-page">
                <el-input placeholder="用户名" v-model="userName" clearable></el-input>
                <el-input placeholder="密码" v-model="password" clearable show-password></el-input>
                <el-button
                    type="primary"
                    size="large"
                    class="login-button"
                    @click="onLoginAction"
                >
                    登录
                </el-button>
            </div>
            <div v-else id="register-page">
                <el-input placeholder="用户名" v-model="registerUserName" clearable></el-input>
                <el-input placeholder="密码" v-model="registerPwd" clearable show-password></el-input>
                <el-button
                    type="primary"
                    size="large"
                    class="register-login-button"
                    @click="onRegisterAction"
                >
                    注册
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from '../components/Constants.vue'
export default {
    data() {
        return {
            showLogin: true,
            userName: '',
            password: '',
            registerUserName: '',
            registerPwd: '',
        };
    },
    methods: {
        onRegisterAction() {
            if (this.registerPwd.length < 6) {
                this.$message.error('密码长度至少6位');
                return;
            }
            if (this.registerUserName.length < 4) {
                this.$message.error('用户名长度至少4位');
                return;
            }
            this.$axios
                .post(Constants.SERVER_PRE_URL + '/user/', {
                    account: this.registerUserName,
                    pwd: this.$md5(this.registerPwd),
                    source: 1
                })
                .then(res => {
                    if (res.data.code == 0) {
                        let data = res.data.data;
                        this.$store.commit('setToken', data);
                        this.$router.back(-1);
                        this.$message.success('注册成功');
                    } else {
                        this.$message.error('注册失败');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        onClickAction(tag) {
            if (tag == 1) {
                this.showLogin = true;
            } else {
                this.showLogin = false
            }
        },
        onLoginAction() {
            this.$axios
                .post(Constants.SERVER_PRE_URL + '/user/login', {
                    account: this.userName,
                    pwd: this.$md5(this.password)
                })
                .then(res => {
                    console.log(res)
                    if (res.data.code == 0) {
                        let data = res.data.data;
                        this.$store.commit('setToken', data)
                        this.$router.push('home');
                        this.$message.success('登录成功');
                    } else {
                        this.$message.error('账号密码错误');
                    }
                })
                .catch(err => {
                    console.log(err);
               });
        },
    },
    mounted() {
    },
};
</script>

<style lang="scss">
.ant-button {
    border: 0px;
    font-size: 20px;
    height: 50px;
    width: 70px;
    border-radius: 0;
    outline: none;
    background-color: white;
    cursor: pointer;
}

.main-view {
    width: 500px;
    height: 420px;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -180px 0 0 -250px;
    box-shadow: 1px 5px 10px rgba(0, 0, 0, 0.651);
}

.main-header {
    width: 100%;
    height: 80px;
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    align-items: center;
}

.main-body {
    width: 100%;
    height: 200px;
}

.user-input {
    width: 50%;
    left: 20%;
    top: 0px;
}

.register-user-input:extend(.user-input) {
    top: 90px;
}

.pwd-input {
    width: 60%;
    position: absolute;
    left: 20%;
    top: 170px;
}

.register-pwd-input {
    top: 150px;
    width: 60%;
    position: absolute;
    left: 20%;
    top: 170px;
}

.register-repeat-pwd-input {
    top: 210px;
    width: 60%;
    position: absolute;
    left: 20%;
    top: 170px;
}

.register-login-button, .login-button {
    width: 50%;
    background-color: rgb(11, 215, 241);
    border: 0px;
    position: absolute;
    left: 25%;
    top: 200px;
    transition: none;
}

.register-login-button {
    background-color: red
}
</style>
