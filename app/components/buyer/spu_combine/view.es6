/*
   SPU聚合页： 商品详细信息 组件
 */

import Modal from "pokeball/components/modal"

const goodsInfo = Handlebars.templates["buyer/spu_combine/templates/goods_info"]
const moreOptionsModalTpl = Handlebars.templates["buyer/spu_combine/templates/more-options"]

class SPUGoodsInfo {
    constructor() {
        this._DATA_ = null;
        this.render();
    }

    render() {
        let self = this;
        //$('body').spin(false);
        //$('body').spin('large');
        //$('body').overlay({'backgroundColor':'#eee'});

        $.ajax({
            url: "/api/zcy/spu/info",
            type: "GET",
            data: {
                spuId: $.query.keys.spuId
            },
            error: ()=>{
            }
        }).done((data)=>{
            //$('body').spin(false);
            let limit = 9;
            let totalAttrs = [];
            Array.prototype.push.apply(totalAttrs, data.zcySpuSnapshot.keyProperties);
            Array.prototype.push.apply(totalAttrs, data.zcySpuSnapshot.affectProperties);
            if(totalAttrs.length > limit){
                data.zcySpuSnapshot.totalAttrs = totalAttrs.slice(0, limit);  // data.zcySpuSnapshot.totalAttrs 限制在 limit
                $('.ZCY-eevee-page-SPU-combine').empty().append(goodsInfo(data));
                $('.more-params').removeClass('hide');
            }
            else {
                data.zcySpuSnapshot.totalAttrs = totalAttrs;
                $('.ZCY-eevee-page-SPU-combine').empty().append(goodsInfo(data));
            }

            $('.more-params a').on('click', (evt) => this.showMoreOptionsModal(evt));
            self._DATA_ = data.zcySpuSnapshot;
        });
    }

    showMoreOptionsModal(){
        let moreOptionsHtml = moreOptionsModalTpl(this._DATA_);
        new Modal(moreOptionsHtml).show();
    }
}

module.exports = SPUGoodsInfo