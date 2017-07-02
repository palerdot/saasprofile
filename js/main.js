var APP={init:function(){var t=this;this.initProgressBar();var s=$.ajax({url:"/data/tags-info.json",method:"get",contentType:"application/json"}),e=$.ajax({url:"/data/saas-need-list.json",method:"get",contentType:"application/json"}),n=$.ajax({url:"/data/saas-list.json",method:"get",contentType:"application/json"});$.when(s,e,n).done(function(s,e,n){t.tagsInfo=_.sortBy(s[0],function(t){return-t.weight}),t.needInfo=_.sortBy(e[0],function(t){return-t.weight}),t.saasInfo=_.orderBy(n[0],["interesting","weight"],["asc","desc"]),t.start()}).fail(function(){t.sp_error_vue.error=!0,t.sp_error_vue.error_msg="Fetching SaaS list failed. Please <a href=''>refresh</a>!"}).always(function(){t.sp_error_vue.loading=!1,$("#progress-bar").progress("set percent",100),$("#saas-grid").dimmer("hide"),window.clearInterval(t.progressTimer),_.delay(function(){$("#progress-bar").hide()},777)})},start:function(){this.init_vues(),this.init_DOM_events(),this.update_saas_list=_.debounce(this.update_saas_list_from_tags,1),this.source=""},initProgressBar:function(){$("#progress-bar").progress(),$("#saas-grid").dimmer("show");var t=33;this.progressTimer=window.setInterval(function(){var s=Math.floor(t+.33*(100-t));$("#progress-bar").progress("set percent",s),t=s},750)},init_DOM_events:function(){var t=this;$("#clear-filters").click(function(){$("#tag-list-dropdown").dropdown("set exactly",""),$("#tags-search").val("").trigger("input")}),$("#saas-need-dropdown").dropdown({onChange:_.debounce(function(){t.source="saas-need";var s=$(this).dropdown("get value");if(s){var e=_.find(t.needInfo,function(t){return t.id==s});$("#tag-list-dropdown").dropdown("set exactly",_.map(e.tags,function(t){return t+""}))}},1)}),$("#tag-list-dropdown").dropdown({onChange:function(){}}),$("#saas-count").sticky({context:"#saas-grid"}),$(".interesting").popup()},get_tag_icons:function(t){return DEFAULT_ICON_CLASS="tag",t.icon_class?t.icon_class+" icon":DEFAULT_ICON_CLASS+" icon"},init_vues:function(){var t=this;this.sp_error_vue=new Vue({el:"#sp-error-vue",data:{error:!1,error_msg:""}}),this.saas_need_vue=new Vue({el:"#saas-need-vue",data:{saasNeed:_.cloneDeep(this.needInfo)},methods:{get_tags_for_need:function(s){return _.filter(t.tagsInfo,function(t){return _.includes(s.tags,t.id)})},get_tag_icons:t.get_tag_icons}}),this.tags_list_vue=new Vue({el:"#tags-list-vue",data:{selected_tags:"",tags:_.cloneDeep(this.tagsInfo)},computed:{count:function(){return _.isEmpty(this.selected_tags)?_.size(this.tags):_.size(this.selected_tags)}},methods:{handleChange:_.debounce(function(s){var e=_.map(s.target.value.split(","),function(t){return _.trim(t)});"saas-need"==t.source||(t.source="tags-list"),t.update_saas_list(e)},1),get_tag_icons:t.get_tag_icons,count_msg:function(){return"Showing "+this.count+" "+(this.count>1?"tags":"tag")}}}),this.saas_list_vue=new Vue({el:"#saas-list-vue",data:{saas_list:_.cloneDeep(this.saasInfo)},computed:{count:function(){return _.size(this.saas_list)}},methods:{get_tags_for_saas_list:function(s){var e=_.filter(t.tagsInfo,function(t){return _.includes(s.tags,t.id)});return e=_.sortBy(e,function(s){return!_.includes(t.tags_list_vue.selected_tags,s.id)})},get_tag_class:function(s){return _.includes(t.tags_list_vue.selected_tags,s.id)?"ui sp-red label selected":"ui sp-red label"},count_msg:function(){return"Showing "+this.count+" "+(this.count>1?"softwares":"software")},get_saas_logo:function(t){return"/logos/"+(t.logo||"no-image.png")},get_tag_icons:t.get_tag_icons}})},update_saas_list_from_tags:function(t){var s=[],e=_.map(_.compact(t),function(t){return parseInt(t,10)});this.tags_list_vue.selected_tags=e,"tags-list"==this.source&&$("#saas-need-dropdown").dropdown("restore defaults"),this.source="",s=_.isEmpty(e)?_.cloneDeep(this.saasInfo):_(this.saasInfo).chain().filter(function(t){return _.size(_.intersection(e,t.tags))>0}).orderBy(["interesting","weight"],["asc","desc"]).sortBy(function(t){return-_.size(_.intersection(e,t.tags))}).value(),this.saas_list_vue.saas_list=s}};$(document).ready(function(){APP.init()});
//# sourceMappingURL=main.js.map
