"use strict";(self["webpackChunkkc_web"]=self["webpackChunkkc_web"]||[]).push([[89],{5089:function(e,t,s){s.r(t),s.d(t,{default:function(){return w}});var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"mb-5"},[s("div",{staticClass:"general-container"},[s("v-card",{staticClass:"pa-3"},[s("div",{staticClass:"mt-2 search-inputs"},[s("div",{staticClass:"world-select-all"},[s("v-select",{attrs:{dense:"","hide-details":"",items:e.areaItems,label:e.$t("Enemies.海域"),"menu-props":{maxHeight:"600px"}},on:{change:function(t){return e.changedWorld()}},model:{value:e.selectedArea,callback:function(t){e.selectedArea=t},expression:"selectedArea"}})],1),s("div",{directives:[{name:"show",rawName:"v-show",value:e.isEvent,expression:"isEvent"}]},[s("v-select",{attrs:{dense:"","hide-details":"",items:e.levelItems,label:e.$t("Difficulty.難易度")},on:{change:function(t){return e.changedWorld()}},model:{value:e.level,callback:function(t){e.level=t},expression:"level"}})],1),s("div",{staticClass:"ml-3"},[s("v-btn",{attrs:{color:"success",disabled:e.isLoading||e.isSameSearchCondition},on:{click:function(t){return e.searchPreset()}}},[e._v(e._s(e.$t("Common.検索")))])],1),e.saveData&&e.saveData.length?s("div",{staticClass:"ml-auto align-self-end caption"},[e._v(e._s(e.saveData.length)+e._s(e.$t("Common.件")))]):e._e()])]),s("div",e._l(e.saveData,(function(t,a){return s("v-card",{key:"data_"+a,staticClass:"preset-item"},[s("div",{staticClass:"d-flex"},[s("div",{staticClass:"align-self-end"},[e._v(e._s(t.name))]),s("v-spacer"),s("v-btn",{attrs:{icon:""},on:{click:function(s){return e.expandPreset(t)}}},[s("v-icon",[e._v("mdi-download")])],1)],1),s("v-divider"),s("div",{staticClass:"d-flex flex-wrap my-1"},e._l(t.ships,(function(t,i){return s("div",{key:"ship"+a+"_"+i},[t.data.id&&t.isActive?s("v-img",{attrs:{src:"./img/ship/"+t.data.id+".png",height:"30",width:"120"}}):e._e()],1)})),0),t.ships2&&t.ships2.length?s("div",{staticClass:"d-flex flex-wrap my-1"},e._l(t.ships2,(function(e,t){return s("div",{key:"ship"+a+"_"+t},[s("v-img",{attrs:{src:"./img/ship/"+e.data.id+".png",height:"30",width:"120"}})],1)})),0):e._e(),t.memo?s("div",{staticClass:"preset-memo"},[e._v(e._s(t.memo))]):e._e(),s("div",{staticClass:"d-flex flex-wrap justify-end"},[s("div",{staticClass:"d-flex mx-2"},[s("div",[s("v-icon",{attrs:{small:""}},[e._v("mdi-account")])],1),s("div",{staticClass:"caption align-self-center"},[e._v(e._s(t.user))])]),s("div",{staticClass:"d-flex mx-2"},[s("div",[s("v-icon",{attrs:{small:""}},[e._v("mdi-clock-time-four-outline")])],1),s("div",{staticClass:"caption align-self-center"},[e._v(e._s(t.createdAt))])])])],1)})),1),e.enabledMoreLoad&&!e.isLoading?s("div",{staticClass:"mt-3"},[s("v-btn",{attrs:{color:"primary",block:""},on:{click:function(t){return e.searchPreset()}}},[e._v(e._s(e.$t("Common.さらに読み込む")))])],1):e._e(),e.isLoading?s("div",{staticClass:"py-5"},[s("div",{staticClass:"d-flex justify-center"},[s("v-progress-circular",{attrs:{size:"70",color:"secondary",indeterminate:""}})],1)]):e._e()],1),s("div",{staticClass:"info-area"},[s("v-divider",{staticClass:"mb-2"}),s("div",{staticClass:"caption"},[e._v(" "+e._s(e.$t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。"))+" ")]),s("div",{staticClass:"caption"},[e._v(" "+e._s(e.$t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。"))+" ")])],1)])},i=[],l=s(144),n=s(6141),r=s(7350),o=s(6770),c=s(4045),d=s(6961),h=s.n(d);const v=20;var m=l.Z.extend({name:"SaveDataList",components:{},data:()=>({areaItems:[],selectedArea:11,level:n.xh.HARD,saveData:[],isLoading:!1,lastMap:0,lastLevel:0,lastDocument:void 0}),mounted(){const e=this.$store.state.saveData;e.disabledMain(),this.initWorlds();const t=this.$store.state.searchedList;t&&t.length&&(this.saveData=t)},computed:{needTrans(){return"ja"!==this.$i18n.locale},levelItems(){if(this.needTrans){const e=[];for(let t=0;t<n.ZP.DIFFICULTY_LEVELS.length;t+=1){const{text:s,value:a}=n.ZP.DIFFICULTY_LEVELS[t];e.push({text:`${this.$t(`Difficulty.${s}`)}`,value:a})}return e}return n.ZP.DIFFICULTY_LEVELS},getCompletedAll(){return this.$store.getters.getCompletedAll},isEvent(){return Math.floor(this.selectedArea/10)>40},isSameSearchCondition(){return this.lastMap===this.selectedArea&&this.lastLevel===this.level},enabledMoreLoad(){return!!this.lastDocument&&this.isSameSearchCondition}},watch:{getCompletedAll(e){e&&this.initWorlds()}},methods:{initWorlds(){const e=[],t=this.$store.state.worlds,s=this.$store.state.maps;if(t&&s)for(let a=0;a<t.length;a+=1){const i=t[a],l=s.filter((e=>Math.floor(e.area/10)===i.world));if(l.length){a>0&&e.push({divider:!0}),e.push({header:i.name});for(let t=0;t<l.length;t+=1){const s=l[t],a=i.world>40?"E":`${i.world}`;e.push({value:s.area,text:`${a}-${s.area%10}：${s.name}`,group:i.name})}}}this.areaItems=e},changedWorld(){this.isLoading=!1},async searchPreset(){this.isLoading=!0,this.enabledMoreLoad||(this.saveData=[]);try{const e=(0,r.ad)(),t=4-this.level;let s;s=this.isEvent?this.lastDocument?(0,r.IO)((0,r.hJ)(e,"presets"),(0,r.ar)("map","==",this.selectedArea),(0,r.ar)("level","==",t),(0,r.Xo)("createdAt","desc"),(0,r.TQ)(this.lastDocument),(0,r.b9)(v)):(0,r.IO)((0,r.hJ)(e,"presets"),(0,r.ar)("map","==",this.selectedArea),(0,r.ar)("level","==",t),(0,r.Xo)("createdAt","desc"),(0,r.b9)(v)):this.lastDocument?(0,r.IO)((0,r.hJ)(e,"presets"),(0,r.ar)("map","==",this.selectedArea),(0,r.ar)("level","==",0),(0,r.Xo)("createdAt","desc"),(0,r.TQ)(this.lastDocument),(0,r.b9)(v)):(0,r.IO)((0,r.hJ)(e,"presets"),(0,r.ar)("map","==",this.selectedArea),(0,r.ar)("level","==",0),(0,r.Xo)("createdAt","desc"),(0,r.b9)(v)),this.lastMap=this.selectedArea,this.lastLevel=this.level;const a=await(0,r.PL)(s),i=[],l=this.$store.state.items,n=this.$store.state.ships,d=this.$store.state.defaultEnemies,m=new o.Z(l,n,d);a.forEach((e=>{const t=e.data();if(2===t.ver){const s=h().decompressFromBase64(e.data().data)||"",a=c.Z.loadSaveDataManagerString(s,l,n,d,!0);a&&(t.ships=a.fleetInfo.fleets[0].ships,a.fleetInfo.isUnion&&(t.ships2=a.fleetInfo.fleets[1].ships.filter((e=>e.data.id))),t.manager=a,t.createdAt=o.Z.formatDate(e.data().createdAt.toDate(),"yyyy/MM/dd HH:mm:ss"),i.push(t))}else{const s=m.restoreOldSaveData(e.data().data);s&&(t.ships=s.fleetInfo.fleets[0].ships,s.fleetInfo.isUnion&&(t.ships2=s.fleetInfo.fleets[1].ships.filter((e=>e.data.id))),t.manager=s,t.createdAt=o.Z.formatDate(e.data().createdAt.toDate(),"yyyy/MM/dd HH:mm:ss"),i.push(t))}})),this.lastDocument&&this.saveData?this.saveData=this.saveData.concat(i):this.saveData=i,a&&a.docs.length>=v?this.lastDocument=a.docs[a.docs.length-1]:this.lastDocument=void 0,this.$store.dispatch("setSearchedList",this.saveData)}catch(e){console.error(e),this.saveData=[],this.$emit("inform","編成データ読み込み中にエラーが発生しました。",!0)}this.isLoading=!1},expandPreset(e){const t=this.$store.state.saveData;t.disabledMain();const s=new c.Z;s.name=e.name,s.remarks=e.memo,s.tempData=[e.manager],s.tempIndex=0,s.isActive=!0,s.isMain=!0,t.childItems.push(s),this.$store.dispatch("updateSaveData",t),this.$store.dispatch("setMainSaveData",s),this.$router.push("aircalc")}}}),p=m,u=s(1001),f=s(3453),g=s.n(f),C=s(4562),D=s(9582),_=s(9223),$=s(4324),x=s(5495),A=s(3305),L=s(9481),I=s(3687),b=(0,u.Z)(p,a,i,!1,null,"1450a95c",null),w=b.exports;g()(b,{VBtn:C.Z,VCard:D.Z,VDivider:_.Z,VIcon:$.Z,VImg:x.Z,VProgressCircular:A.Z,VSelect:L.Z,VSpacer:I.Z})}}]);
//# sourceMappingURL=89.245e3811.js.map