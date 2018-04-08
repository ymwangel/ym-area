(function ($,win,doc) {
  // body...
  var pluginName = 'Area'

  // 通用函数
  function parserUrl(url) {
    var r = {}
    var preqs = url.split('#')[0]
    var qs = preqs.split('?').slice(1).join('?')
    if(qs == ''){
      void null
    }else{
      var pairs = qs.split('&')
      for(var i=0;i<pairs.length;i++){
        var keyValue = pairs[i].split('=')
        var key = keyValue[0]
        r[key] = keyValue.slice(1).join('=')
      }
    }
    return r
  }
  function arrIsEmpty(xs) {
    return xs.length == 0
  }
  function mapIndex(fn,xs){
    var r = []
    for(var i=0;i<xs.length;i++){
      r.push(fn(xs[i],i))
    }
    return r
  }
  function filter(fn,xs){
    var r = []
    for(var i=0;i<xs.length;i++){
      if(fn(xs[i])){
        r.push(xs[i])
      }
    }
    return r
  }
  function uniq(fn,xs){
    function cons(a,arr){
      return [a].concat(arr)
    }
    return xs.length == 0 ? []
    : cons(xs[0],
      uniq(fn,
        xs.slice(1).filter(function(a){return fn(a,xs[0])==false})
        ))
  }
  function putData(name,value){
    try{
      localStorage.setItem(name,JSON.stringify(value))
    }catch(a){
      window.console&&window.console.log(a)
    }
  }
  function getData(name){
    try{
      return JSON.parse(localStorage.getItem(name)|| null)
    }catch(a){
      window.console&&window.console.log(a)
    }
  }
  function doUrl(qs){
    qs.page = null
    qs.psa = null
    return paramConcatUrl(PAGE_DATA.stateBase,qs)
  }
  function dopsa(url,psa){
    if(window.doPSAURL){
      return doPSAURL(url,psa)
    }else{
      return url
    }
  }
  function paramConcatUrl(originurl,params) {
    var urls = originurl.split('#')
    var url = urls[0]
    var rep = url.indexOf('?') == -1 ? '?' : '&'
    var pairs = []
    for(var key in params){
      if(params[key] != null){
        pairs.push(key + '=' + encodeURIComponent(params[key]))
      }else{
        void null
      }
    }
    if(pairs.length == 0){
      return tourl(url)
    }else{
      return tourl(url + rep + pairs.join('&'))
    }
    function tourl(url) {
      if(url.length>1){
        return url + '#' + urls.slice(1).join('#')
      }else{
        return url
      }
    }
  }

  function Plugin (element,options){
    this.element = element

    this.init()
  }

  Plugin.prototype = {
    init: function(){
      var _ = this
      var el = _.element
      var psa = $(el).attr("psa")
      var html = ['<div class="area" area>',
        '<span id="choosed-city" title="所有地区">所有地区</span>',
        '<i class="d-icon area-arrow"></i>',
        '<div class="area-content">',
          '<div class="area-holder"></div>',
          // '<div class="same-city" same-city>',
          //   '<label for="">同城：</label>',
          //   '<label for="" class="same-city-value">',
          //  ' </label>',
          // '</div>',
          '<div class="history-area" history-area>',
            '<label for="">历史选择：</label>',
            '<ul class="history-list" history-list>',
            '</ul>',
          '</div>',
          '<div class="area-seperate" area-seperate></div>',
          '<a target="_self" href="javascript:void(0)" id="all-area" class="area-head area-item">所有地区</a>',
          '<ul class="top-list clearfix" id="id-area-parent">',
            
          '</ul>',
        '</div>',
      '</div>'].join('')

      $(el).html(html)
      main()
    }
  }

  function main() {
    handlerArea($('[area]'),PAGE_DATA.stateData,$('#all-area'))
  }

// =========组件逻辑

  var CONST_HISTORY_CITY = 'HISTORY_CHOOSED_CITY'

  function doChoosedCity(){
    var qs = parserUrl(window.location.href)
    var qsname = decodeURIComponent(qs.province)
    var qscity = decodeURIComponent(qs.city)
    if(qscity != 'undefined' && qscity){
      $('#choosed-city').html(qscity)
      $('#choosed-city').attr('title',qscity)
    }else if(qsname != 'undefined' && qsname){
      $('#choosed-city').html(qsname)
      $('#choosed-city').attr('title',qsname)
    }else{
      $('#choosed-city').html('所有地区')
      $('#choosed-city').attr('title','所有地区')
      $('#all-area').addClass('all-area-choosed')
    }
  }

  function operateHistory(div){
    var h = div.find("[history-list]")
    var hObj = getData(CONST_HISTORY_CITY)
    if(hObj == null){
      div.find('[history-area]').hide()
      return
    }else{
      var hstr = renderItem(hObj,'history')
      h.html(hstr)
    }
  }

  function addCitiesOfProvince(div){
    var lis = div.find('#id-area-parent').find('[idx]')
    lis.each(function(item) {
      var s = ['<li class="city-part fl" city-idx=',
            Math.floor(item/5),
            '>',
            '<div class="d-icon trangle"></div>',
            '<div class="list-holder"></div>',
            '<ul class="down-list clearfix"></ul></li>'
            ].join('')
      if((item+1)%5==0 || item == lis.length-1){
        $(this).css("marginRight",'0')
        $(this).after($(s))
      }else{
        void null
      }
    })
  }

  function renderMunicipality(xs){
    if(arrIsEmpty(xs)){
      return []
    }else{
      return '<li class="municipality-list"><ul>'+mapIndex(_r,xs).join('')+'</ul></li>'
    }
    function _r(item,index){
      var qs = parserUrl(window.location.href)
      qs.province = item.provinceName
      qs.city = item.cityList[0]
      qs.selectSource = 1
      var url = doUrl(qs)
      return ['<li class="province-item fl" muni-idx="'+index+'">','<a href="'+url+'" target="_self">',item.provinceName,'</a>','</li>'].join('')
    }
  }
  function renderItem(xs,type,province){
    var qs = parserUrl(window.location.href)
    if(arrIsEmpty(xs)){
      return []
    }else{
      return mapIndex(_render,xs).join('')
    }
    function _render(a,index){
      if(type == 'province'){
        qs.province = a.provinceName
        return ['<li class="province-item fl" idx="',index,'">',a.provinceName,'</li>'].join('')
      }else if(type == 'city'){
        qs.province = province
        qs.city = a
        qs.selectSource = 1
        var url = doUrl(qs)
        return ['<li class="city-item fl city" title="',a,'"><a href="',url,'">',a,'</a></li>'].join('')
      }else if(type == 'localCity'){
        qs.province = a.province
        qs.city = a.city
        qs.selectSource = 1
        var url = doUrl(qs)
        return ['<a href="',url,'">',a.city,'</a>'].join('')
      }else{
        qs.province = a.province
        qs.city = a.city
        qs.selectSource = 1
        if(a.type == 'province'){
          qs.city = ''
          var url = doUrl(qs)
          return ['<li class="history-item" title="',a.province,'"><a href="',url,'">',a.province,'</a></li>'].join('')
        }else{
          var url = doUrl(qs)
          return ['<li class="history-item" title="',a.city,'"><a href="',url,'">',a.city,'</a></li>'].join('')
        }
      }
    }
  } 

  function putHistory(obj){
    var historyCitys = getData(CONST_HISTORY_CITY)
    historyCitys.unshift(obj)
    putData(CONST_HISTORY_CITY,uniq(_eq,historyCitys).slice(0,5))
    function _eq(a,b){
      return (a.type == b.type && a.province == b.province && a.city == b.city)||
      (a.province == a.city && a.province == b.province && b.province == b.city)
    }
  }

  function doClickArea(areaObj,div) {
    var qs = parserUrl(window.location.href)
    div.find("#id-area-parent").on('click','li[idx]',function(e) {
      var index = $(this).attr('idx')
      var cities = areaObj.PROVINCE[index].cityList
      qs.province = $(this).html()
      handler(div,qs.province,cities,index,'')
    })

    div.find('[city-idx]').find('.down-list').on('click','li',function (e) {
      var index = $(this).index()
      var city = $(this).find('a').html()
      if(index == 0){
        putHistory({
          type:'province',
          province:qs.province,
          city:qs.province
        })
      }else{
        putHistory({
          type:'city',
          province:qs.province,
          city:city
        })
      }
    })

    div.find('#id-area-parent').on('click','li[muni-idx]',function(e){
      var provinceName = $(this).find('a').html()
      putHistory({
        type:'province',
        province:provinceName,
        city:provinceName
      })
      qs.province = provinceName
      qs.city = provinceName
      qs.selectSource = 1
      var url = doUrl(qs)
      // window.location.href = dopsa(url,{psa:'j9',areaPSA:'a201'})
      window.location.href = url
    })

    div.find('#all-area').on('click',function(c){
     qs.province = null
     qs.city = null
     qs.selectSource = 1
     var url = doUrl(qs)
     // window.location.href = dopsa(url ,{psa:'j9',areaPSA:'a201'})
     window.location.href = url
    })

  }

  function handler(div,province,cities,index,city){
    var qs = parserUrl(window.location.href)
    var city = city || ''
    var po = $("[idx]").eq(index).get(0)
    qs.province = province
    qs.city = null
    qs.selectSource = 1
    var url = doUrl(qs)
    var res = ['<li class="city-item fl"><a href="',url,'" target="_self">全部</a></li>',renderItem(cities,'city',province)].join('')
    div.find('[city-idx='+Math.floor(index/5)+']').find('.down-list').html(res)
    div.find('[city-idx]').each(function(item){
      if(item == Math.floor(index/5)){
        $(this).show()
      }else{
        $(this).hide()
      }
    })
    var trangleStyle = {
      position:'relative',
      left:(po.offsetLeft-20)+'px',
      top:0
    }
    var holderStyle= {
      position:'relative',
      left:(po.offsetLeft-17)+'px',
      top:'-2px'
    }
    var downListStyle = {
      position:'relative',
      left:0,
      top:'-3px'
    }
    div.find('[city-idx='+Math.floor(index/5)+']').find('.trangle').css(trangleStyle)
    div.find('[city-idx='+Math.floor(index/5)+']').find('.list-holder').css(holderStyle)
    div.find('[city-idx='+Math.floor(index/5)+']').find('.down-list').css(downListStyle)
  }

  function handlerArea(div,areaObj,allarea){
    if(areaObj == null) return
    doChoosedCity()
    var pstr = renderMunicipality(areaObj.PROVINCE_LEVEL_MUNICIPALITY) + renderItem(areaObj.PROVINCE,'province')
    div.find("#id-area-parent").html(pstr)
    // getLocalCity()
    operateHistory(div)
    addCitiesOfProvince(div)
    var sub = div.find('[city-idx]')

    div.hover(function () {
      var qs = parserUrl(window.location.href)
      div.find(".area-content").show()
      if(div.find('[history-area]').css('display') == 'none'){
        div.find('[area-seperate]').hide()
      }else{
        div.find('[area-seperate]').show()
      }
      if(qs.city != undefined){
        qs.province = decodeURIComponent(qs.province)
        qs.city = decodeURIComponent(qs.city)
        if(qs.province == qs.city && qs.province != "吉林"){
          mapIndex(function(a,index){
            if(a.provinceName == qs.province){
              div.find('[muni-idx='+index+']').find('a').css({color:'#316ccb'})
            }
          },areaObj.PROVINCE_LEVEL_MUNICIPALITY)
        }else{
          var rc = filter(function(item){
            return item.provinceName == qs.province
          },areaObj.PROVINCE)
          var index = areaObj.PROVINCE.indexOf(rc[0])
          handler(div,qs.province,rc[0].cityList,index,qs.city)
          var i = rc[0].cityList.indexOf(qs.city)
          if(i != -1){
            sub.find(".city>a").eq(i).css({color:'#316ccb'})
          }else{
            void null
          }
        }
      }else if(qs.province != undefined && qs.city == undefined){
        qs.province = decodeURIComponent(qs.province)
        var rc = filter(function(item){
          return item.provinceName == qs.province
        },areaObj.PROVINCE)
        var index = areaObj.PROVINCE.indexOf(rc[0])
        handler(div,qs.province,rc[0].cityList,index,qs.city)
        sub.find(".city-item").eq(0).find('a').css({color:'#316ccb'})
      }else{
        sub.hide()
      }
    },function() {
      var qs = parserUrl(window.location.href)
    })
    doClickArea(areaObj,div)     
  }


  $.fn[ pluginName ] = function ( element,options) {   //向jQuery注册插件
    var e = this;
    e.each(function() {
      $.data( e, "plugin_" + pluginName, new Plugin( this, element, options ) );
    });
    return e;
  }

})(jQuery,window,document)