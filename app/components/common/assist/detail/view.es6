
/** *
  * 用户帮助中心
  * @author maobeijun@cai-inc.com
  */
let currentPostion = 0;
let currentImage = 0;
let ul,liItems,imageNumber,imageWidth;
export const initSlider = (el)=>{
    //1. set ul width 
    //2. image when click prev/next button
    
    ul = document.getElementById(el);
    liItems = ul.children;
    imageNumber = liItems.length;
    imageWidth = liItems[0].children[0].clientWidth||'510';

    ul.style.width = parseInt(imageWidth * imageNumber) + 'px';
    ul.style.left = 0;

    generatePager(imageNumber);
}

const  animate = (opts)=>{
    var start = new Date;
    var id = setInterval(function(){
      var timePassed = new Date - start;
      var progress = timePassed / opts.duration;
      if (progress > 1){
        progress = 1;
      }
      var delta = opts.delta(progress);
      opts.step(delta);
      if (progress == 1){
        clearInterval(id);
        opts.callback();
      }
    }, opts.delay || 17);
    //return id;
  }

const  slideTo = (imageToGo)=>{
    var direction;
    var numOfImageToGo = Math.abs(imageToGo - currentImage);
    // slide toward left

    direction = currentImage > imageToGo ? 1 : -1;
    currentPostion = -1 * currentImage * imageWidth;
    var opts = {
      duration:1000,
      delta:function(p){return p;},
      step:function(delta){
        ul.style.left = parseInt(currentPostion + direction * delta * imageWidth * numOfImageToGo) + 'px';
      },
      callback:function(){currentImage = imageToGo;}  
    };
    animate(opts);
  }


const  generatePager = (imageNumber)=>{  
    var pageNumber;
    var pagerDiv = document.getElementById('pager');
    let _html = '<li class="active"></li>';
    pagerDiv.innerHTML = '';
    for (let i = 0; i < imageNumber-1; i++){
      _html += '<li></li>'
    }
    pagerDiv.innerHTML = _html;
    const $li = $('#pager>li');
    $li.on('click',(e)=>{
      $li.removeClass('active');
      $(e.target).addClass('active');
      slideTo($(e.target).index());
    })
  }
