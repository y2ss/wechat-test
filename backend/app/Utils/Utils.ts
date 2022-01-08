export default class Utils {
    public static async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms)
        });
    }

    public static guid(): String {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
          .replace(/[xy]/g, 
          function(c) {
              var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
              return v.toString(16);
            });
    }
}