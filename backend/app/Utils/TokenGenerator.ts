import Md5 from "./MD5";

export default class TokenGenerator {

    public static get(key: String): String {
        let md5 = new Md5()
        let rand = Math.random()
        return md5.hexMD5(key + Math.round(rand * 1000).toString() + new Date().getTime().toString())
    }
}