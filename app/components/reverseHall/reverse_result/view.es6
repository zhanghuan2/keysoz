const Modal = require("pokeball/components/modal")

class reverseDetail {
    constructor() {
        let restitle=/结果/g;
        let titlechange=$(".title-result").html().replace(restitle,"信息");
        $(".title-result").html(titlechange);
    }
}

export default reverseDetail