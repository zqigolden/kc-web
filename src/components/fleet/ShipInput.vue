<template>
  <v-card
    class="ma-1 ship-input"
    :class="{ disabled: !ship.isActive && !ship.isTray, 'py-1': !ship.isEmpty && !ship.isTray }"
    @mousedown="setDraggable"
    @mouseup="resetDraggable"
    @dragstart="dragStart($event)"
    @dragend="dragEnd($event)"
    @dragenter="dragEnter($event)"
    @dragleave="dragLeave($event)"
    @drop.stop="dropShip($event)"
    @dragover.prevent
  >
    <template v-if="ship.isEmpty && !ship.isTray">
      <div class="empty-ship d-flex align-center" v-ripple="{ class: 'info--text' }" @click.stop="showShipList($event)" @keypress.enter="showShipList($event)">
        <v-icon small class="mr-1">mdi-plus</v-icon>
        <div>{{ shipName }}</div>
        <div class="empty-temp-list" v-if="handleShowTempShipList || handleCreateTray">
          <v-tooltip bottom color="black" v-if="handleCreateTray">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="light-blue" v-bind="attrs" v-on="on" @click.stop="createTray()">
                <v-icon>mdi-tray-plus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.装備置き場生成") }}</span>
          </v-tooltip>
          <v-tooltip bottom color="black" v-if="handleShowTempShipList">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="orange lighten-2" v-bind="attrs" v-on="on" @click.stop="showTempShip()">
                <v-icon>mdi-clipboard-arrow-down</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.艦娘クリップボード") }}</span>
          </v-tooltip>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex px-2">
        <div
          class="align-self-center ship-img-container"
          v-if="!isNoShip"
          v-ripple="{ class: 'info--text' }"
          @click.stop="showShipList($event)"
          @keypress.enter="showShipList($event)"
        >
          <div class="ship-img" @mouseenter="bootShipTooltip($event)" @mouseleave="clearTooltip" @focus="bootShipTooltip($event)" @blur="clearTooltip">
            <v-img :src="`./img/ship/banner/${ship.data.id}.png`" height="30" width="120" />
          </div>
          <div class="area-banner" v-if="ship.area > 0 && ship.area <= maxAreas">
            <v-img :src="`./img/tags/area${ship.area}.webp`" height="40" width="29" />
          </div>
          <div class="ship-sp-item-img" v-if="ship.spEffectItemId">
            <v-img :src="`./img/util/${ship.spEffectItemId === 1 ? 'miiro' : 'tasuki'}.png`" height="30" width="12" />
          </div>
        </div>
        <template v-if="ship.isTray">
          <div class="align-self-center">
            <v-img :src="`./img/util/mushi.png`" height="24" width="24" />
          </div>
          <div class="mt-1 ml-3 align-self-center caption flex-grow-1">{{ $t("Fleet.装備を自由に置くスペースです。") }}</div>
        </template>
        <div class="flex-grow-1" v-if="!ship.isTray">
          <div class="caption">
            <v-menu
              v-model="editStatusMenu"
              :close-on-content-click="false"
              transition="slide-y-transition"
              max-width="360"
              min-width="360"
              bottom
              right
              @input="onEditStatusMenuToggle"
            >
              <template v-slot:activator="{ on, attrs }">
                <div class="pr-2 clickable-status level-area" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                  <div class="pl-1 pr-1 primary--text">
                    Lv<span class="font-weight-bold">{{ ship.level }}</span>
                  </div>
                  <div class="pl-1 text--secondary">{{ $t("Common.運") }}</div>
                  <div class="pl-1 pr-1 font-weight-medium">{{ ship.luck }}</div>
                  <div class="pl-1 text--secondary">{{ $t("Common.対空") }}</div>
                  <div class="pl-1 font-weight-medium">{{ ship.antiAir }}</div>
                </div>
              </template>
              <v-card class="px-5 pt-5 pb-3">
                <div class="d-flex justify-space-between">
                  <v-btn small outlined @click.stop="level = 1" color="grey">Lv1</v-btn>
                  <v-btn small outlined @click.stop="level = 50" color="primary">Lv50</v-btn>
                  <v-btn small outlined @click.stop="level = 80" color="teal">Lv80</v-btn>
                  <v-btn small outlined @click.stop="level = 99" color="teal">Lv99</v-btn>
                  <v-btn small outlined @click.stop="level = maxLevel" color="red lighten-2">Lv{{ maxLevel }}</v-btn>
                </div>
                <div class="d-flex mt-4 align-center">
                  <div class="edit-status-menu-text">
                    <v-text-field label="Lv" v-model.number="level" class="pt-0 mt-0" :max="maxLevel" min="1" hide-details type="number" />
                  </div>
                  <div class="flex-grow-1">
                    <v-slider :max="maxLevel" min="1" v-model="level" hide-details></v-slider>
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="edit-status-container">
                  <v-text-field :label="$t('Common.耐久')" v-model.number="hp" :max="value.data.maxHp" :min="minHP" hide-details type="number" />
                  <v-text-field :label="$t('Common.対潜')" v-model.number="asw" :max="maxAsw" :min="minAsw" hide-details type="number" />
                  <v-text-field :label="$t('Common.運')" v-model.number="luck" :max="ship.data.maxLuck" :min="ship.data.luck" hide-details type="number" />
                  <v-text-field :label="$t('Common.対空')" v-model.number="antiAir" :max="ship.data.antiAir" min="0" hide-details type="number" />
                </div>
                <v-divider class="my-3" />
                <div class="d-flex">
                  <v-spacer />
                  <v-btn @click="closeEditStatusMenu()" color="secondary">{{ $t("Common.閉じる") }}</v-btn>
                </div>
              </v-card>
            </v-menu>
          </div>
          <div class="d-flex pl-1 clickable-status" v-ripple="{ class: 'info--text' }" @click.stop="showShipList($event)" @keypress.enter="showShipList($event)">
            <div class="ship-name text-truncate" :class="{ 'no-stock': ship.noStock }">{{ shipName }}</div>
          </div>
        </div>
        <!-- 艦娘解除 -->
        <div class="ship-remove">
          <v-btn icon @click.stop="removeShip">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <!-- ステータス欄(上段 pbは消すな) -->
      <div class="ship-status-container caption pl-2" v-if="!ship.isTray">
        <span class="text--secondary">{{ $t("Fleet.撃墜") }}</span>
        <span class="ml-1 font-weight-medium mr-2">{{ rateDownValue }}%,{{ fixDown }}{{ isNotJapanese ? "" : "機" }}</span>
        <template v-if="ship.hunshinRate">
          <span class="text--secondary text-no-wrap">{{ $t("Fleet.噴進") }}</span>
          <span class="ml-1 font-weight-medium mr-2">{{ ship.hunshinRate.toFixed(1) }}%</span>
        </template>
        <span class="text--secondary">{{ $t("Common.射程") }}</span>
        <span class="ml-1 font-weight-medium">{{ $t(`Common.${rangeText[ship.displayStatus.range]}`) }}</span>
        <template v-if="ship.data.maxAsw || ship.enabledTSBK">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <span class="cursor-help" v-bind="attrs" v-on="on">
                <span class="ml-2 text--secondary mr-1">{{ $t("Fleet.先制対潜") }}</span>
                <span v-if="ship.enabledTSBK">
                  <template v-if="!isNotJapanese">{{ $t("Fleet.可") }}</template>
                  <template v-else>&#10004;</template>
                </span>
                <span v-else>&times;</span>
              </span>
            </template>
            <table class="asw-table">
              <tr>
                <td class="body-2">{{ $t("Fleet.対潜先制爆雷攻撃") }}</td>
                <td class="text-right pl-2">
                  <span v-if="ship.enabledTSBK" class="blue--text text--lighten-2">
                    <template v-if="!isNotJapanese">
                      {{ $t("Fleet.可") }}
                    </template>
                    <template v-else>&#10004;</template>
                  </span>
                  <span v-else-if="!isNotJapanese" class="red--text text--lighten-1">
                    {{ $t("Fleet.不可") }}
                  </span>
                  <span v-else class="red--text text--lighten-1">&times;</span>
                </td>
              </tr>
              <tr>
                <td class="body-2 grey--text text--lighten-2">
                  {{ $t("Common.対潜") }}<span class="ml-2 caption">{{ $t("Fleet.艦娘") }}</span>
                </td>
                <td class="text-right">{{ ship.asw - ship.improveAsw }}</td>
              </tr>
              <tr v-if="ship.improveAsw">
                <td class="body-2 grey--text text--lighten-2">
                  {{ $t("Common.対潜") }}<span class="ml-2 caption">{{ $t("Common.改修") }}</span>
                </td>
                <td class="text-right">{{ ship.improveAsw }}</td>
              </tr>
              <tr>
                <td class="body-2 grey--text text--lighten-2">
                  {{ $t("Common.対潜") }}<span class="ml-2 caption">{{ $t("Fleet.装備") }}</span>
                </td>
                <td class="text-right">{{ ship.itemAsw }}</td>
              </tr>
              <tr v-if="ship.itemBonusStatus.asw">
                <td class="body-2 grey--text text--lighten-2">
                  {{ $t("Common.対潜") }}<span class="ml-2 caption">{{ $t("Fleet.装備ボーナス") }}</span>
                </td>
                <td class="text-right">{{ ship.itemBonusStatus.asw }}</td>
              </tr>
              <tr class="border">
                <td colspan="3"></td>
              </tr>
              <tr>
                <td class="body-2 grey--text text--lighten-2 pb-1">
                  {{ $t("Common.対潜") }}<span class="ml-2 caption">{{ $t("Common.合計") }}</span>
                </td>
                <td class="text-right pb-1">{{ ship.displayStatus.asw }}</td>
              </tr>
              <tr v-if="!ship.enabledTSBK && ship.missingAsw">
                <td class="caption grey--text text--lighten-2">{{ $t("Fleet.不足対潜値") }}</td>
                <td class="text-right">{{ ship.missingAsw }}</td>
              </tr>
              <tr v-if="!ship.enabledTSBK && ship.needTSBKLevel">
                <td class="caption grey--text text--lighten-2">{{ $t("Fleet.必要艦娘Lv") }}</td>
                <td class="text-right">{{ ship.needTSBKLevel }}</td>
              </tr>
            </table>
          </v-tooltip>
        </template>
      </div>
      <!-- ステータス欄(下段) -->
      <div class="ship-sub-status-container px-1" v-if="!ship.isTray">
        <v-btn v-if="!isNoShip && noItem" small @click.stop="showBatchItemList()" text class="btn-batch-deploy">
          {{ $t("ItemList.一括配備") }}
        </v-btn>
        <div v-else-if="ship.fullAirPower" class="align-self-center caption ml-1">
          <span class="text--secondary">{{ $t("Common.制空") }}</span>
          <span class="ml-1 font-weight-medium">{{ ship.fullAirPower }}</span>
          <span class="ml-1 text--secondary">{{ airPowerDetail }}</span>
        </div>
        <div
          v-else
          class="align-self-center caption cursor-help ml-1"
          @mouseenter="bootShipTooltip($event)"
          @mouseleave="clearTooltip"
          @focus="bootShipTooltip($event)"
          @blur="clearTooltip"
        >
          <!-- 制空以外のステータス せいぜい3つくらいまで -->
          <span class="text--secondary">{{ $t("Common.火力") }}</span>
          <span class="ml-1 font-weight-medium">{{ ship.displayStatus.firePower }}</span>
          <template v-if="ship.data.torpedo">
            <span class="ml-2 text--secondary">{{ $t("Common.雷装") }}</span>
            <span class="ml-1 font-weight-medium">{{ ship.displayStatus.torpedo }}</span>
          </template>
          <template v-else>
            <span class="ml-2 text--secondary">{{ $t("Common.装甲") }}</span>
            <span class="ml-1 font-weight-medium">{{ ship.displayStatus.armor }}</span>
          </template>
          <template v-if="ship.data.maxAsw">
            <span class="ml-2 text--secondary">{{ $t("Common.対潜") }}</span>
            <span class="ml-1 font-weight-medium">{{ ship.displayStatus.asw }}</span>
          </template>
          <template v-else>
            <span class="ml-2 text--secondary">{{ $t("Common.回避") }}</span>
            <span class="ml-1 font-weight-medium">{{ ship.displayStatus.avoid }}</span>
          </template>
        </div>
        <div class="ml-auto ship-buttons">
          <v-tooltip bottom color="black" v-if="enabledConvert">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="blue lighten-1" v-bind="attrs" v-on="on" @click.stop="toggleVersion()">
                <v-icon>mdi-sync</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.コンバート改造") }}</span>
          </v-tooltip>
          <v-tooltip bottom color="black" v-if="handleShowTempShipList">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="orange lighten-2" v-bind="attrs" v-on="on" @click.stop="showTempShip()">
                <v-icon>mdi-clipboard-arrow-up</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.艦娘クリップボード") }}</span>
          </v-tooltip>
          <v-tooltip bottom color="black" v-if="handleShowItemPreset">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="deep-orange lighten-1" v-bind="attrs" v-on="on" @click.stop="showItemPresets()">
                <v-icon>mdi-briefcase-variant</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.装備プリセット展開") }}</span>
          </v-tooltip>
          <v-tooltip bottom color="black" v-if="!hideActiveButton">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-show="ship.isActive" v-bind="attrs" v-on="on" @click.stop="changeActive(false)">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.計算対象から省く") }}</span>
          </v-tooltip>
          <v-btn icon small v-show="!ship.isActive && !hideActiveButton" @click.stop="changeActive(true)">
            <v-icon>mdi-eye-off</v-icon>
          </v-btn>
          <div class="btn-item-reset">
            <v-tooltip bottom color="black">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" @click.stop="resetItems()">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Fleet.装備一括解除") }}</span>
            </v-tooltip>
            <div class="close-bar" :class="`item-count-${ship.items.length + 1}`"></div>
          </div>
        </div>
      </div>
      <v-divider class="mx-1 item-input-divider" v-if="!ship.isTray" />
      <!-- 装備一覧 -->
      <div class="px-1" v-if="!ship.isEmpty && !ship.isTray">
        <div
          @mouseenter="bootTooltip(item, j, $event)"
          @mouseleave="clearTooltip"
          @focus="bootTooltip(item, j, $event)"
          @blur="clearTooltip"
          v-for="(item, j) in ship.items"
          :key="j"
        >
          <item-input
            v-model="ship.items[j]"
            :index="j"
            :max="99"
            :drag-slot="false"
            :init="ship.data.slots[j]"
            :handle-show-item-list="showItemList"
            :item-parent="ship"
            :handle-drag-start="clearTooltip"
            @input="updateItem"
          />
        </div>
        <!-- 補強増設枠 -->
        <div @mouseenter="bootTooltip(ship.exItem, -1, $event)" @mouseleave="clearTooltip" @focus="bootTooltip(ship.exItem, -1, $event)" @blur="clearTooltip">
          <item-input
            v-model="ship.exItem"
            :index="99"
            :max="0"
            :init="0"
            :drag-slot="false"
            :handle-show-item-list="showItemList"
            :item-parent="ship"
            :handle-drag-start="clearTooltip"
            :is-released="ship.releaseExpand"
            @input="updateItem"
          />
        </div>
      </div>
      <div class="pa-1" v-else-if="ship.isTray">
        <v-divider class="item-input-divider" />
        <div class="tray-items">
          <div
            @mouseenter="bootTooltip(item, j, $event)"
            @mouseleave="clearTooltip"
            @focus="bootTooltip(item, j, $event)"
            @blur="clearTooltip"
            v-for="(item, j) in ship.items"
            :key="j"
          >
            <item-input
              v-model="ship.items[j]"
              :index="j"
              :max="99"
              :drag-slot="false"
              :init="ship.data.slots[j]"
              :handle-show-item-list="showItemList"
              :item-parent="ship"
              :handle-drag-start="clearTooltip"
              :dense="true"
              @input="updateItem"
            />
          </div>
        </div>
      </div>
    </template>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" :bonus="tooltipBonus" />
    </v-tooltip>
    <v-tooltip v-model="enabledShipTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip v-model="value" :fleet-ros-corr="fleetRosCorr" :is-flagship="index === 0" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.disabled {
  opacity: 0.5 !important;
}

.ship-input.dragging * {
  pointer-events: none;
}
.ship-input {
  cursor: move;
}
.ship-img-container {
  cursor: pointer;
  position: relative;
}

.empty-ship {
  height: 100%;
  min-height: 80px;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  font-size: 12px;
  transition: 0.3s;
  position: relative;
}
.empty-ship:hover {
  opacity: 1;
  box-shadow: inset 0 0 12px rgba(0, 168, 255, 0.4);
}
.empty-temp-list {
  position: absolute;
  top: 6px;
  right: 6px;
}

.ship-remove {
  opacity: 0.6;
  position: absolute;
  right: 1px;
  top: 0px;
  z-index: 1;
}

.clickable-status {
  border-radius: 0.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.clickable-status:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.level-area {
  display: flex;
  flex-wrap: wrap;
}

.edit-status-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1rem;
  row-gap: 1rem;
}
.edit-status-menu-text {
  width: 80px;
}

.ship-img {
  position: relative;
}
.area-banner {
  position: absolute;
  top: -6px;
  left: 22px;
}
.ship-sp-item-img {
  position: absolute;
  top: 0;
  right: 5px;
}

.ship-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
  transition: 0.2s;
  cursor: pointer;
}
.ship-status-container {
  height: 16px;
}
.ship-name.no-stock {
  color: rgb(255, 100, 100);
}

.btn-item-reset {
  position: relative;
  right: -2px;
}
.btn-item-reset .close-bar {
  left: 44%;
  margin-top: 3px;
  pointer-events: none;
  position: absolute;
  height: 24px;
  width: 3px;
  opacity: 0;
  transform: scale(1, 0);
  transform-origin: top;
  transition: 0.1s;
  background-color: rgb(128, 200, 255);
  box-shadow: 0px 0px 4px rgb(128, 200, 255);
  z-index: 0;
}
.btn-item-reset:hover .close-bar {
  transform: scale(1, 1);
  z-index: 1;
  opacity: 0.6;
}
.btn-item-reset:active .close-bar {
  box-shadow: 0px 0px 10px rgb(128, 200, 255);
  opacity: 1;
}
.close-bar.item-count-2 {
  height: 53px;
}
.close-bar.item-count-3 {
  height: 82px;
}
.close-bar.item-count-4 {
  height: 111px;
}
.close-bar.item-count-5 {
  height: 140px;
}
.close-bar.item-count-6 {
  height: 169px;
}

.captured .ship-input {
  box-shadow: none;
  border: 1px solid #bbb;
}
.theme--dark .captured .ship-input {
  border: 1px solid #444;
}
.captured .ship-remove {
  display: none;
}

.ship-sub-status-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 28px;
}
.captured .btn-batch-deploy {
  display: none;
}

.cursor-help {
  cursor: help;
}
.asw-table {
  font-size: 0.9em;
}
.asw-table tr.border td {
  border-top: 1px solid #444;
}

.ship-buttons {
  display: flex;
  align-self: center;
}
.captured .ship-buttons {
  display: none;
}
.ship-buttons .v-icon {
  font-size: 18px !important;
}

body.item-ui-border .item-input-divider {
  display: none !important;
}
.tray-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';
import ShipValidation from '@/classes/fleet/shipValidation';
import Const from '@/classes/const';

export default Vue.extend({
  components: { ItemInput, ItemTooltip, ShipTooltip },
  name: 'ShipInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowBatchItemList: {
      type: Function,
    },
    handleShowShipList: {
      type: Function,
      required: true,
    },
    handleCloseShip: {
      type: Function,
      required: true,
    },
    handleShowTempShipList: {
      type: Function,
    },
    handleShowItemPreset: {
      type: Function,
    },
    handleCreateTray: {
      type: Function,
    },
    value: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fixDown: {
      type: Number,
      default: 0,
    },
    rateDown: {
      type: Number,
      default: 0,
    },
    fleetRosCorr: {
      type: Number,
      default: 0,
    },
    isLine2: {
      type: Boolean,
      default: false,
    },
    hideActiveButton: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    level: 99,
    luck: 0,
    antiAir: 0,
    asw: 0,
    hp: 1,
    editStatusMenu: false,
    enabledTooltip: false,
    enabledShipTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipBonus: '',
    tooltipX: 0,
    tooltipY: 0,
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
    maxLevel: Const.MAX_LEVEL,
  }),
  computed: {
    ship(): Ship {
      return this.value;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return !setting.nameIsNotTranslate;
    },
    shipName() {
      if (this.isNotJapanese) {
        if (!this.value.data.name) {
          return this.$t('Fleet.艦娘選択');
        }
        if (this.needTrans) {
          const shipName = ShipMaster.getSuffix(this.value.data);
          const trans = (v: string) => (v ? `${this.$t(v)}` : '');
          return shipName.map((v) => trans(v)).join('');
        }
      }
      return this.value.data.name ? this.value.data.name : '艦娘選択';
    },
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => (v.fullAirPower && !v.data.isRecon ? v.fullAirPower : 0));
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    isNoShip(): boolean {
      return this.value.data.id === 0;
    },
    noItem(): boolean {
      return this.value.items.concat(this.value.exItem).every((v) => !v.data.id);
    },
    rateDownValue(): number {
      return Math.floor(this.rateDown * 100);
    },
    enabledConvert(): boolean {
      const ships = this.$store.state.ships as ShipMaster[];
      const master = this.value.data;
      if (master.name === '宗谷') {
        return true;
      }
      return this.value.data.isFinal && ships.filter((v) => v.originalId === master.originalId && v.isFinal && v.version > 1).length >= 2;
    },
    maxAreas(): number {
      return this.$store.state.areaCount as number;
    },
    minHP(): number {
      return this.level > 99 ? this.value.data.hp2 : this.value.data.hp;
    },
    minAsw(): number {
      // 未設定(まだわかってない)なら0
      if (!this.value.data.minAsw || !this.value.data.maxAsw) return 0;
      const asw = Ship.getStatusFromLevel(this.level, this.value.data.maxAsw, this.value.data.minAsw);
      return asw;
    },
    maxAsw(): number {
      // 未設定(まだわかってない)なら青天井
      if (!this.value.data.minAsw || !this.value.data.maxAsw) return 200;
      return this.minAsw + 9;
    },
  },
  watch: {
    level(v: number) {
      // 未改修時の対潜値
      const asw = Ship.getStatusFromLevel(v, this.ship.data.maxAsw, this.value.data.minAsw);
      // セットされている対潜改修値を加算
      this.asw = asw + this.value.improveAsw;
      // HP最小値を変更
      this.hp = Math.max(this.hp, v > 99 ? this.value.data.hp2 : this.value.data.hp);
      this.hp = Math.min(this.hp, v <= 99 ? this.value.data.hp : 999);
    },
  },
  methods: {
    updateItem() {
      this.setShip();
    },
    setShip(value?: Ship) {
      this.clearTooltip();
      if (value === undefined) {
        this.$emit('input', new Ship({ ship: this.ship }));
      } else {
        this.$emit('input', value);
      }
    },
    onEditStatusMenuToggle() {
      if (this.editStatusMenu) {
        this.hp = this.ship.hp;
        this.level = this.ship.level;
        this.luck = this.ship.luck;
        this.asw = this.ship.asw;
        this.antiAir = this.ship.antiAir;
      } else {
        // 閉じられる際にステータス反映
        const builder: ShipBuilder = {
          ship: this.ship,
          level: this.level,
          hp: this.hp,
          luck: this.luck,
          antiAir: this.antiAir,
          asw: this.asw,
        };

        this.setShip(new Ship(builder));
      }
    },
    closeEditStatusMenu() {
      this.editStatusMenu = false;
      this.onEditStatusMenuToggle();
    },
    changeActive(value: boolean) {
      this.setShip(new Ship({ ship: this.ship, isActive: value }));
    },
    resetItems() {
      this.setShip(new Ship({ ship: this.value, items: [], exItem: new Item() }));
    },
    removeShip() {
      this.handleCloseShip(this.index);
    },
    showItemList(slotIndex: number): void {
      this.clearTooltip();
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowItemList(this.index, slotIndex);
    },
    showBatchItemList() {
      if (this.handleShowBatchItemList) {
        this.handleShowBatchItemList(this.index);
      }
    },
    showShipList(event: MouseEvent): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.clearTooltip();
      this.handleShowShipList(this.index, event);
    },
    showTempShip() {
      // 一時保存領域の展開
      this.handleShowTempShipList(this.index);
    },
    createTray() {
      // 装備置き場の生成
      this.handleCreateTray(this.index);
    },
    showItemPresets() {
      // 装備プリセット画面
      this.handleShowItemPreset(this.index);
    },
    toggleVersion() {
      const ships = this.$store.state.ships as ShipMaster[];
      const master = this.value.data;
      // コンバート候補取得
      let versions = ships.filter((v) => v.originalId === master.originalId && v.isFinal && v.version > 1).sort((a, b) => a.version - b.version);
      if (master.name === '宗谷') {
        versions = ships.filter((v) => v.name === '宗谷');
      }
      // 現在のver
      const index = versions.findIndex((v) => v.id === master.id);
      let newVersion: ShipMaster;
      if (index < versions.length - 1) {
        // 一段階改装を進めたバージョンを設置
        newVersion = versions[index + 1];
      } else {
        // コンバート最初期状態へ
        newVersion = versions[index - index];
      }

      // 装備検証
      const { items, exItem } = this.value;
      const newItems = [];
      let newExItem: Item;
      for (let i = 0; i < newVersion.slots.length; i += 1) {
        const item = items[i];
        if (item && ShipValidation.isValidItem(newVersion, item.data, i)) {
          newItems.push(new Item({ item, slot: newVersion.slots[i] }));
        } else {
          newItems.push(new Item());
        }
      }
      if (ShipValidation.isValidItem(newVersion, exItem.data, Const.EXPAND_SLOT_INDEX, exItem.remodel)) {
        newExItem = new Item({ item: exItem });
      } else {
        newExItem = new Item();
      }

      // コンバート時に対潜/耐久改修分を引き継ぐ
      const bonusHP = this.value.hp - (this.value.level > 99 ? this.value.data.hp2 : this.value.data.hp);
      const newHP = (this.value.level > 99 ? newVersion.hp2 : newVersion.hp) + bonusHP;
      const newAsw = Ship.getStatusFromLevel(this.value.level, newVersion.maxAsw, newVersion.minAsw) + this.value.improveAsw;

      let { luck } = this.value;
      const originalLuck = master.luck;
      const improvementLuck = luck - originalLuck;
      if (!improvementLuck) {
        // 運改修なしなら次改装の運に合わせる
        luck = newVersion.luck;
      } else {
        // ありなら次改装の運に、改修分を加算
        luck = newVersion.luck + improvementLuck;
      }
      this.setShip(
        new Ship({
          master: newVersion,
          level: this.value.level,
          hp: newHP,
          luck,
          asw: newAsw,
          items: newItems,
          exItem: newExItem,
        }),
      );
    },
    setDraggable(e: MouseEvent) {
      const target = e.target as HTMLDivElement;
      if (target.closest('.item-input')) {
        // 装備上である場合はキャンセル
        return;
      }
      const parent = target.closest('.ship-input') as HTMLDivElement;
      parent.setAttribute('draggable', 'true');
    },
    resetDraggable(e: MouseEvent) {
      const target = e.target as HTMLDivElement;
      const parent = target.closest('.ship-input') as HTMLDivElement;
      parent.setAttribute('draggable', 'false');
    },
    dragStart(e: DragEvent) {
      // 子要素(item)のドラッグイベントが先におこっているならキャンセル
      const draggingDiv = document.getElementById('dragging-item');
      if (draggingDiv) {
        return;
      }
      const target = e.target as HTMLDivElement;
      if ((this.value.isEmpty && !this.value.isTray) || !target || !target.classList || !target.classList.contains('ship-input') || !target.draggable) {
        return;
      }
      target.style.opacity = '0.6';
      target.id = 'dragging-item';

      // ドラッグ中セーブデータを一時保持
      this.$store.dispatch('setDraggingShipData', this.value);

      // 一時的に全てのship-inputの子要素マウスイベントを消す
      const shipInputList = document.getElementsByClassName('ship-input');
      for (let i = 0; i < shipInputList.length; i += 1) {
        shipInputList[i].classList.add('dragging');
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.boxShadow = '';
    },
    dragEnter(e: DragEvent): void {
      const d = document.getElementById('dragging-item');
      const t = e.target as HTMLDivElement;
      if (!d || !d.classList.contains('ship-input') || !t || !t.classList.contains('ship-input')) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      t.style.boxShadow = 'inset 0 0 80px rgba(20, 160, 255, 0.6)';
    },
    dropShip(e: DragEvent) {
      e.preventDefault();
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv || !draggingDiv.classList.contains('ship-input')) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.boxShadow = '';
      if (target.id) {
        // 自身へのドロップ禁止
        return;
      }
      // 一時退避していたデータをセット
      const moveData = this.$store.state.draggingShipData as Ship;
      // 自身をドラッグ元に受け渡すためセット
      this.$store.dispatch('setDraggingShipData', this.value);

      // インスタンスにセット
      this.setShip(moveData);

      draggingDiv.classList.add('move-ok');
    },
    dragEnd(e: DragEvent) {
      // まずは一時的に消していた全てのship-inputの子要素マウスイベントを復活
      const shipInputList = document.getElementsByClassName('ship-input');
      for (let i = 0; i < shipInputList.length; i += 1) {
        shipInputList[i].classList.remove('dragging');
      }

      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      if (!draggingDiv || !draggingDiv.draggable || !draggingDiv.classList.contains('ship-input')) {
        // ドラッグ不可だったり、そもそもship-inputじゃなかったら以降受け入れない

        // Firefox なんかおかしくなるので再チェック
        const target = e.target as HTMLDivElement;
        if (target && target.classList.contains('ship-input')) {
          target.style.opacity = '1';
          target.id = '';
          target.draggable = false;
        }

        return;
      }
      const target = e.target as HTMLDivElement;
      target.style.opacity = '1';
      target.id = '';
      target.draggable = false;
      if (target.classList.contains('move-ok')) {
        target.classList.remove('move-ok');
      } else {
        return;
      }

      // 受け渡された対象の装備データと交換！
      const moveData = this.$store.state.draggingShipData as Ship;
      if (moveData) {
        // インスタンスにセット
        this.setShip(moveData);
      }
    },
    bootTooltip(item: Item, index: number, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip || window.innerWidth < 600) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;

        this.tooltipBonus = JSON.stringify(this.value.getItemBonusDiff(index));
      }, Math.max(setting.popUpCount, 10));
    },
    bootShipTooltip(e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip) {
        return;
      }
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;
        this.enabledShipTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      this.enabledShipTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
