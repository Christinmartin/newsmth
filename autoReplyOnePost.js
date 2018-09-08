// 循环发送回复-单个帖子
var COUNT=20,REPLY_ID='f7db11ce9b6dced28f2d55a78c50bd8a';
function loopReply(index) {
    var topicPageUrl='https://exp.newsmth.net/topic/';
    $.post("https://exp.newsmth.net/compose/save", {
        articleId:REPLY_ID,
        body: "加油~~ 每天顶你20贴 "+index
    },function (res) {
        console.log('send',index,res);
        index++;
        if(index==COUNT){
            console.log("发送完毕，可以继续下一轮了");
            return;
        }
        //搞个分钟级延时 1-5分钟 不要太快
        let  min = Math.ceil(Math.random() * 4);
        let timer = setTimeout(function () {
            loopReply(index);
            clearTimeout(timer);
        }, min *60* 1000)

    })
}

loopReply(1);