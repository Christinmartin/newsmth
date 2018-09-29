//--定时灌水回复 某一页的所有帖子

const _NO_REPLY_MANS=['shen','VampireJax'];//不要回复的楼主列表（低调 不能回复管理员）

let topicIds=[],replyIds=[];

//遍历出第n页的20篇帖子
function getTopicIdsFromOnePage(){
    $.get("https://exp.newsmth.net/board/topics/d2f70a8101ae880cbc5d18a1be39ffeb/1",function(res){
        let trs=$(res).find('table.table.table-striped tbody tr');
        if(!trs) {
            console.log('当前页 res 出错了');
            return;
        }
        trs.each(function(i){
            let tds=$(this).find('td');
            let repliedCount=(tds.eq(4).text() || 0)-0;
            let author=tds.eq(3).text().trim();
            let topicId=tds.eq(1).find('a').attr('href').replace(/\/topic\//,'');
            // console.log(author,repliedCount)
            if(isNeedReply(repliedCount,author)) topicIds.push(topicId);
        })

        // topicIds=res.match(/(?<=\/topic\/)\w+/g);
        // if(topicIds.length<20) {
        //     alert("第二页20篇帖子未能正确遍历");
        //     return;
        // }
        console.log('topicIds',topicIds.length,topicIds)
        pushReplyIdOneByOne(0);
    })
}

//是否要回复本贴 
function isNeedReply(repliedCount,author){
    let bl=false;
    //暂只回复 0-沙发 >5的-有一定热度容易被回复避免太扎眼被封
    bl=!_NO_REPLY_MANS.includes(author)  && (repliedCount>4 || repliedCount==0)
    return bl;
}

//抽取回复id 压入数组
function pushReplyIdOneByOne(index){
    $.get("https://exp.newsmth.net/topic/"+topicIds[index],function(res){
        replyIds.push(res.match(/compose\/reply\/(\w+)/)[1]);
        index++;
        //replyId 抽取完毕
        if(index==topicIds.length){
            console.log('replyIds',replyIds.length,replyIds)
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
    const topicPageUrl='https://exp.newsmth.net/topic/';
    let form_articleId=replyIds[index];
    if(!form_articleId){
        console.log('form_articleId error');
        return false;
    }
    $.post("https://exp.newsmth.net/compose/save", {
        articleId:form_articleId,
        body: "一起赚积分 加油思密达"+"~~~~~~~~~~~~".slice(Date.now().toString().slice(-1))
    },function (res) {
        console.log('send',index+1,new Date().toLocaleTimeString(),topicPageUrl+topicIds[index],res);
        index++;
        if(index==replyIds.length){
            console.log(new Date().toLocaleTimeString(),"发送完毕，可以继续下一轮了");
            return;
        }
        //搞个分钟级延时 不要太快
        const min=1,max=10;
        const delayMinute=Math.ceil(Math.random() * (max-min)+min);
        let timer = setTimeout(function () {
            loopReply(index);
            clearTimeout(timer);
        }, delayMinute *60* 1000)

    })
}

getTopicIdsFromOnePage();