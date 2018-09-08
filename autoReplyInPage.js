//--定时灌水回复 某一页的所有帖子

var topicIds=[],replyIds=[];

//遍历出第n页的20篇帖子
function getTopicIdsFromOnePage(){
    $.get("https://exp.newsmth.net/board/topics/d2f70a8101ae880cbc5d18a1be39ffeb/1",function(res){
        topicIds=res.match(/(?<=\/topic\/)\w+/g);
        if(topicIds.length<20) {
            alert("第二页20篇帖子未能正确遍历");
            return;
        }
        console.log(topicIds)
        pushReplyIdOneByOne(0);
    })
}

//是否要回复本贴 
function isNeedReply(res){
    let regArr=res.match(/<span>(\d+) 个回复</);
    let repliedCount=regArr?regArr[1] : 0;
    //暂只回复 0-沙发 >5的-有一定热度容易被回复避免太扎眼被封
    return repliedCount>5 || repliedCount==0;
}

//抽取回复id 压入数组
function pushReplyIdOneByOne(index){
    $.get("https://exp.newsmth.net/topic/"+topicIds[index],function(res){
        if(isNeedReply(res)) replyIds.push(res.match(/compose\/reply\/(\w+)/)[1]);
        index++;
        //replyId 抽取完毕
        if(index==topicIds.length){
            loopReply(0);
            return;
        }
        //搞个秒级随机延迟 不要请求太快
        setTimeout(()=>{
            pushReplyIdOneByOne(index);
        },Date.now().toString().slice(-4));
    })
}

// 循环发送回复
function loopReply(index) {
    var topicPageUrl='https://exp.newsmth.net/topic/';
    $.post("https://exp.newsmth.net/compose/save", {
        articleId:replyIds[index],
        body: "道阻且长 一起赚积分 加油～"
    },function (res) {
        console.log('send',index+1,topicPageUrl+topicIds[index],res);
        index++;
        if(index==replyIds.length){
            console.log("发送完毕，可以继续下一轮了");
            return;
        }
        //搞个分钟级延时 5-20分钟 不要太快
        const min=5,max=20;
        const delayMinute=Math.ceil(Math.random() * (max-min)+min);
        let timer = setTimeout(function () {
            loopReply(index);
            clearTimeout(timer);
        }, delayMinute *60* 1000)

    })
}

getTopicIdsFromOnePage();