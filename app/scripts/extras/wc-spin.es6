/** 
 * 网超loading动画
 * Usage:  jqueryObj.wcSpin('large/middle/small')  
 *         jqueryObj.wcSpin('hide')
 * **/
(function($){
	let methods = {
        init: function(size){
            if( size == 'small' || size == 'middle' || size == 'large' || size === 'undefined' || size === 'null' ){
                if(size === 'undefined' || size === 'null') { // size为空时，defaultSize默认是large
                    size = 'large';
                }
                let elems = `
                        <div class="wc-spin spin-${size}" style="display:block;">
                            <div class="wc-spin-circle-bg"></div>
                            <div class="wc-spin-circle">
                                <div class="wc-spin-circle-mask"></div>
                            </div>
                            <div class="wc-spin-icon">
                                <i class="icon-zcy icon-zcy-logo"></i>
                            </div>
                        </div>
                    `;
                if(this.find('.wc-spin').length > 0){
                    this.find('.wc-spin').remove();
                }
                this.append(elems);
            }

		    return this;  // 返回this对象本身，以便后续可以链式调用
       	},
        hide: function(){
            if(this.find('.wc-spin')){
                this.find('.wc-spin').hide();
            }
        	return this;
      	}
    };

	$.fn.wcSpin = function(method){
        if(methods[method]){    // 传入参数为已有的方法名，则调用相应的方法
        	return methods[method].apply( this, Array.prototype.slice.call(arguments, 1) )
        }
        else if( typeof method === 'string' || !method ){ // 传入参数为空或者字符串，则应调用init方法
        	return methods.init.apply( this, arguments );
        }  
        else {
        	$.error('Method ' + method + ' dose not exist on jQuery.wcSpin');
        }
	};
})(jQuery);





