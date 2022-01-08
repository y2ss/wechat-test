interface Result {
    code: number
    data: Object | null
}

export default class ResultBuild {
    constructor () {}

    public static build(code: number, data: Object | null = null): Result  {
        return {
            code: code,
            data: data
        }
    }
}