
/**
 * @param options 确认框
 * title:标题
 * content：内容(可html标签)
 * speed:速度
 * bj:显示背景
 * opacity:背景透明度
 * bjclick：点击背景关闭
 * ok:点击成功按钮事件(默认关闭)
 * closed:点击关闭按钮事件(默认关闭)
 * okName:确认按钮名称
 * cancelName:取消按钮名称
 * closeShow: 右上关闭按钮显示
 * closeName:关闭按钮名称
 * buttonClass:按钮样式
 * fullClass:提示框层样式
 * lock:是否锁定屏幕
 */
$.fn.confirm = function(options,fun){
    var defaults = {
        title:"确认",
        content:"",
        speed:200,
        bj:true,
        opacity:0.7,
        bjclick:false,
        lock:false,
        ok:function(){$(document).confirm.close();},
        closed:function(){$(document).confirm.close();},
        okName:"确定",
        cancelName:"取消",
        closeShow:true,
        closeName:"×",
        buttonClass:false,
        fullClass:false
    }
    var options = $.extend(defaults, options);
    this.each(function(){
        var _this=$(this);
        $("#tempConfirmShade").remove();
        $("#tempConfirm").remove();
        $("#tempConfirmShade").remove();
        $("#tempConfirm").remove();
        if(options.bj){
            var bjStr='<div id="tempConfirmShade"></div>';
        }
        var cou = '';
        cou += '<div id="tempConfirm" class="tempConfirm ';
        if(options.fullClass){
            cou+=options.fullClass;
        }
        cou+='">';
        
        if(options.title!=false){
            cou += '<div class="title"><strong class="titleCount">'+options.title+'</strong>';
            if(options.closeShow){
                cou+='<span class="tempConfirmCloes">'+options.closeName+'</span>';
            }
            cou+='</div>';
        }
        cou += '<div class="tempConfirmContents">';
        cou += options.content;
        cou +='</div>';
        cou += '<div class="tempConfirmButtonBox ';
        if(options.buttonClass){
            cou+=options.buttonClass;
        }
        cou+='">';
        if(options.cancelName){
            cou += '<span class="tempConfirmCloes">'+options.cancelName+'</span> ';
        }
        if(options.okName){
        cou += '<span class="tempConfirmOk">'+options.okName+'</span> ';
        }
        cou +='</div>';
        cou +='</div>';
        var dlg=$(cou).appendTo("body");
        if(options.bj){
            var bj=$(bjStr).appendTo("body");
            bj.fadeTo(options.speed,options.opacity,function(){
            	if(options.fullClass){
            			
            	}else{
            		 dlg.css({"top":($(window).height()-dlg.outerHeight(true))/2+$(window).scrollTop(),"left":($(window).width()-dlg.outerWidth(true))/2+$(window).scrollLeft()});
            	}

                dlg.fadeIn(options.speed,function(){
                    if(options.bjclick){
                    	$(bj).click(function(){
	                    	 $(document).confirm.close();
	                    });
                    }
                    $('.tempConfirmCloes').click(function(){
                    	options.closed();
                    });
                    $('.tempConfirmOk').click(function(){
                    	options.ok();
                   	});
                    if($.isFunction(fun)){
                        fun();
                    }
                });

            });
        }else{
            dlg.css({"top":($(window).height()-dlg.outerHeight(true))/2+$(window).scrollTop(),"left":($(window).width()-dlg.outerWidth(true))/2+$(window).scrollLeft()}).fadeIn(options.speed,function(){
            	$('.tempConfirmCloes').click(function(){
                    options.closed();
                });
                $('.tempConfirmOk').click(function(){
                    options.ok();
                });
                if($.isFunction(fun)){
                    fun();
                }
            });
        }
        var isDialogShow=true;
        if(options.lock){
        	document.body.addEventListener('touchmove', moveoff , false);
            var scrollTop=$(window).scrollTop();
            $(window).scroll(function(){
                if(isDialogShow){
                    $(window).scrollTop(scrollTop);
                }
            });
        }
        $.fn.confirm.close=function(fn){
            bj.fadeOut(options.speed);
            dlg.fadeOut(options.speed,function(){
                if($.isFunction(fn)){
                    fn();
                }
                isDialogShow=false;
                document.body.removeEventListener('touchmove', moveoff , false);
                $(bj).remove();
                $(dlg).remove();
            });
        }
        function moveoff(event) {
		    event.preventDefault(); 
		};
    });
};
/*
 *   分享提示
*/
function sharewechat(){
	var html='';
 		html+='<div class="share-box">';
 		html+='<p class="p1"><img src="img/wechat_share1.png"/></p>';
 		html+='<p class=pbut><a href="javascript:$(document).confirm.close();" class="ws_knows_but"><img src="img/wechat_but.png" /></a></p>';
 		html+='</div>';
 		$(document).confirm({
	        title: false,
	        content: html,
	        closeShow: false,
	        okName:false,
	        cancelName:false,
	        fullClass:'sharefullBox'
        });
}
/*
 *   JS对象转字符串
*/	
	function jQstringify(obj) {
		var arr = [];
		$.each( obj, function( key, val ) {
		var next = key + '":"';
		next += $.isPlainObject( val ) ? printObj( val ) : val;
		arr.push( next );
		});
		return '{"' + arr.join( '","'  ) + '"}';
	};
