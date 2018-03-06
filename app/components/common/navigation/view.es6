let Cookie = require("common/cookie/view");

class navigation {
    constructor($) {
        this.$hrefElm = this.$el.find('a');
        this.defaultColor = this.$el.find('.nav-container').data('color');
        this.color = this.$el.find('.nav-container').data('hoverColor');
        this.$hrefElm.css('color', this.defaultColor);
        this.appTree = this.$el.find('.appTree').data('appTree');
        this.selectedCurrApp();
        this.bindEvent();
    }

    selectedCurrApp() {
        let location = window.location.hostname;
        let currApp;
        for(let i=0; i<this.appTree.length; i++){
            let node = this.appTree[i];
            if(node.navigationUrl.indexOf(location) > -1){
                currApp = node;
                break;
            }
            else {
                if(node.child && node.child.length > 0){
                    for(let j=0; j<node.child.length; j++){
                        if(node.child[j].navigationUrl.indexOf(location) > -1){
                            currApp = node;
                            break;
                        }
                    }
                }
            }
        }
        $(`.box[title=${currApp.navigationName}]`).addClass('underline');
    }   
    
    bindEvent() {
        let color = this.color;
        let defaultColor = this.defaultColor;
        this.$hrefElm.on('mouseenter',(e)=>{
            e.preventDefault();
            let $tar = $(e.target);
            $tar.css('color',color);
        }).on('mouseleave', (e)=>{
            e.preventDefault();
            let $tar = $(e.target);
            $tar.css('color',defaultColor);
        })
    }
}

module.exports = navigation;