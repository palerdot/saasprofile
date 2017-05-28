var APP={init:function(){var t=this,n=$.ajax({url:"/data/tags-info.json",method:"get",contentType:"application/json"}),s=$.ajax({url:"/data/saas-need-list.json",method:"get",contentType:"application/json"}),e=$.ajax({url:"/data/saas-list.json",method:"get",contentType:"application/json"});$.when(n,s,e).done(function(n,s,e){t.tagsInfo=_.sortBy(n[0],function(t){return-t.weight}),t.needInfo=_.sortBy(s[0],function(t){return-t.weight}),t.saasInfo=_.sortBy(e[0],function(t){return-t.weight}),t.start()})},start:function(){console.log("starting app ",this.tagsInfo,this.needInfo),this.init_vues(),this.init_DOM_events(),this.update_saas_list=_.debounce(this.update_saas_list_from_tags,1),this.source=""},init_DOM_events:function(){var t=this;$("#clear-filters").click(function(){console.log("porumai! clearing all filters "),$("#tag-list-dropdown").dropdown("set exactly","")}),$("#saas-need-dropdown").dropdown({onChange:_.debounce(function(){t.source="saas-need";var n=$(this).dropdown("get value");if(console.log("saas need dropdown on change ",n),!n)return void console.log("SAAS need cleared !!");var s=_.find(t.needInfo,function(t){return t.id==n});$("#tag-list-dropdown").dropdown("set exactly",_.map(s.tags,function(t){return t+""}))},1)}),$("#tag-list-dropdown").dropdown({onChange:function(){}}),$("#saas-count").sticky({context:"#saas-grid"})},get_tag_icons:function(t){return DEFAULT_ICON_CLASS="tag",t.icon_class?t.icon_class+" icon":DEFAULT_ICON_CLASS+" icon"},init_vues:function(){var t=this;this.saas_need_vue=new Vue({el:"#saas-need-vue",data:{saasNeed:_.cloneDeep(this.needInfo)},methods:{get_tags_for_need:function(n){return _.filter(t.tagsInfo,function(t){return _.includes(n.tags,t.id)})},get_tag_icons:t.get_tag_icons}}),this.tags_list_vue=new Vue({el:"#tags-list-vue",data:{selected_tags:"",tags:_.cloneDeep(this.tagsInfo)},methods:{handleChange:_.debounce(function(n){var s=_.map(n.target.value.split(","),function(t){return _.trim(t)});console.log("tag list dropdown handling change ",s,t.source),"saas-need"==t.source?console.log("Porumai! trigger by SAAS NEED"):t.source="tags-list",t.update_saas_list(s)},1),get_tag_icons:t.get_tag_icons}}),this.saas_list_vue=new Vue({el:"#saas-list-vue",data:{saas_list:_.cloneDeep(this.saasInfo)},computed:{count:function(){return _.size(this.saas_list)}},methods:{get_tags_for_saas_list:function(n){return _.filter(t.tagsInfo,function(t){return _.includes(n.tags,t.id)})},count_msg:function(){return"Showing "+this.count+" "+(this.count>1?"softwares":"software")},get_saas_logo:function(t){return"/logos/"+t.logo},get_tag_icons:t.get_tag_icons}})},update_saas_list_from_tags:function(t){var n=[],s=_.map(_.compact(t),function(t){return parseInt(t,10)});"tags-list"==this.source&&$("#saas-need-dropdown").dropdown("restore defaults"),this.source="",n=_.isEmpty(s)?_.cloneDeep(this.saasInfo):_(this.saasInfo).chain().filter(function(t){return _.size(_.intersection(s,t.tags))>0}).sortBy(function(t){return-_.size(_.intersection(s,t.tags))}).value(),console.log("Porumai! updating saas list based on tags - ",this.source,t,n),this.saas_list_vue.saas_list=n}};$(document).ready(function(){console.log("porumai! doc ready!"),APP.init()});
//# sourceMappingURL=main.js.map
