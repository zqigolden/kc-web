<template>
  <div class="mt-sm-8">
    <div class="d-sm-flex my-3 mx-1">
      <div class="align-self-center mr-5 mb-2 mb-sm-0">{{ $t("Database.集計対象Lv") }}</div>
      <div class="d-flex align-center flex-grow-1">
        <div class="range-input">
          <v-text-field
            :label="$t('Database.Lv下限')"
            type="number"
            :max="levelRange[1]"
            min="1"
            dense
            v-model.trim="levelRange[0]"
            hide-details
            @input="analyze()"
          />
        </div>
        <v-range-slider v-model="levelRange" dense thumb-label min="1" :max="maxLevel" hide-details class="pt-2 align-center mx-2" @change="analyze()">
        </v-range-slider>
        <div class="range-input">
          <v-text-field
            :label="$t('Database.Lv上限')"
            type="number"
            :max="maxLevel"
            :min="levelRange[0]"
            dense
            v-model.trim="levelRange[1]"
            hide-details
            @input="analyze()"
          />
        </div>
      </div>
    </div>
    <v-card class="pa-1">
      <v-divider />
      <v-simple-table dense v-if="isMobile">
        <template v-slot:default>
          <tbody>
            <tr>
              <th>{{ $t("Database.合計艦娘数") }}</th>
              <td class="text-right">{{ allShipCount.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.ケッコン艦") }}</th>
              <td class="text-right">{{ allMarriageCount.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.補強増設艦") }}</th>
              <td class="text-right">{{ allExSlotCount.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.耐久改修合計") }}</th>
              <td class="text-right">{{ totalHPImprovement.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.対潜改修合計") }}</th>
              <td class="text-right">{{ totalASWImprovement.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.運改修合計") }}</th>
              <td class="text-right">{{ totalLuckImprovement.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>{{ $t("Database.まるゆ指数") }}</th>
              <td class="text-right">{{ maruyuRank.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showBlueprintPlanDialog()" :disabled="!totalBluePrintsPlan">
                  {{ $t("Database.改装設計図必要数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalBluePrintsPlan.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showActionReportPlanDialog()" :disabled="!totalActionReportsPlan">
                  {{ $t("Database.戦闘詳報必要数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalActionReportsPlan.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showCatapultPlanDialog()" :disabled="!totalCatapultsPlan">
                  {{ $t("Database.カタパルト必要数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalCatapultsPlan.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showBlueprintUseDialog()" :disabled="!totalCatapultsPlan">
                  {{ $t("Database.改装設計図消費数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalBluePrints.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showActionReportUseDialog()" :disabled="!totalCatapultsPlan">
                  {{ $t("Database.戦闘詳報消費数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalActionReports.toLocaleString() }}</td>
            </tr>
            <tr>
              <th>
                <v-btn small text class="pl-0" @click.stop="showCatapultUseDialog()" :disabled="!totalCatapultsPlan">
                  {{ $t("Database.カタパルト消費数") }}
                  <v-icon small>mdi-magnify</v-icon>
                </v-btn>
              </th>
              <td class="text-right">{{ totalCatapults.toLocaleString() }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-simple-table dense v-else>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">{{ $t("Database.合計艦娘数") }}</th>
              <th class="text-right">{{ $t("Database.ケッコン艦") }}</th>
              <th class="text-right">{{ $t("Database.補強増設艦") }}</th>
              <th class="text-right">{{ $t("Database.耐久改修合計") }}</th>
              <th class="text-right">{{ $t("Database.対潜改修合計") }}</th>
              <th class="text-right">{{ $t("Database.運改修合計") }}</th>
              <th class="text-right">
                {{ $t("Database.まるゆ指数") }}
                <v-tooltip top color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon class="ml-1" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
                  </template>
                  <div>
                    <s>{{ $t("Database.まるゆを近代化改修に使えば使うほど上昇します。") }}</s>
                  </div>
                  <div>{{ $t("Database.ケッコン以外の手段で運改修を進めていると上昇する指標です。") }}</div>
                </v-tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-right">{{ allShipCount.toLocaleString() }}</td>
              <td class="text-right">{{ allMarriageCount.toLocaleString() }}</td>
              <td class="text-right">{{ allExSlotCount.toLocaleString() }}</td>
              <td class="text-right">{{ totalHPImprovement.toLocaleString() }}</td>
              <td class="text-right">{{ totalASWImprovement.toLocaleString() }}</td>
              <td class="text-right">{{ totalLuckImprovement.toLocaleString() }}</td>
              <td class="text-right">{{ maruyuRank.toLocaleString() }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-divider />
      <v-simple-table dense v-if="!isMobile">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">
                <v-btn small text @click.stop="showBlueprintPlanDialog()" :disabled="!totalBluePrintsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.改装設計図必要数") }}
                </v-btn>
              </th>
              <th class="text-right">
                <v-btn small text @click.stop="showActionReportPlanDialog()" :disabled="!totalActionReportsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.戦闘詳報必要数") }}
                </v-btn>
              </th>
              <th class="text-right">
                <v-btn small text @click.stop="showCatapultPlanDialog()" :disabled="!totalCatapultsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.カタパルト必要数") }}
                </v-btn>
              </th>
              <th class="text-right">
                <v-btn small text @click.stop="showBlueprintUseDialog()" :disabled="!totalCatapultsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.改装設計図消費数") }}
                </v-btn>
              </th>
              <th class="text-right">
                <v-btn small text @click.stop="showActionReportUseDialog()" :disabled="!totalCatapultsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.戦闘詳報消費数") }}
                </v-btn>
              </th>
              <th class="text-right">
                <v-btn small text @click.stop="showCatapultUseDialog()" :disabled="!totalCatapultsPlan">
                  <v-icon class="ml-1" small>mdi-magnify</v-icon>
                  {{ $t("Database.カタパルト消費数") }}
                </v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-right pr-7">{{ totalBluePrintsPlan.toLocaleString() }}</td>
              <td class="text-right pr-7">{{ totalActionReportsPlan.toLocaleString() }}</td>
              <td class="text-right pr-7">{{ totalCatapultsPlan.toLocaleString() }}</td>
              <td class="text-right pr-7">{{ totalBluePrints.toLocaleString() }}</td>
              <td class="text-right pr-7">{{ totalActionReports.toLocaleString() }}</td>
              <td class="text-right pr-7">{{ totalCatapults.toLocaleString() }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
    <v-card class="my-3 pa-1 ship-type-analytics">
      <v-divider />
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">{{ $t("Database.艦種") }}</th>
              <th class="text-right">{{ $t("Database.隻数") }}</th>
              <th class="text-right">{{ $t("Database.最大Lv") }}</th>
              <th class="text-right">{{ $t("Database.最小Lv") }}</th>
              <th class="text-right">{{ $t("Database.中央Lv") }}</th>
              <th class="text-right">{{ $t("Database.平均Lv") }}</th>
              <th class="text-right">{{ $t("Database.総経験値") }}</th>
              <th class="text-right">{{ $t("Database.1隻平均") }}</th>
              <th class="text-right">{{ $t("Database.経験値割合") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in summaryTable" :key="`summary_row${i}`">
              <td class="text-left">{{ row.name }}</td>
              <td class="text-right">{{ row.data.count }}</td>
              <td class="text-right">{{ row.data.maxLevel }}</td>
              <td class="text-right">{{ row.data.minLevel }}</td>
              <td class="text-right">{{ row.data.midLevel }}</td>
              <td class="text-right">{{ row.data.avgLevel }}</td>
              <td class="text-right">{{ row.data.sumExp }}</td>
              <td class="text-right">{{ row.data.avgExp }}</td>
              <td class="text-right">{{ row.data.expRate }} %</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
    <div class="graph-area">
      <v-card class="pa-4">
        <div class="d-flex justify-center">
          <div class="body-2">{{ $t("Database.艦種別Lv帯分析") }}</div>
        </div>
        <radar-chart :data="radarGraphData" :options="radarOptions" />
      </v-card>
      <v-card class="pa-1">
        <v-divider />
        <v-simple-table fixed-header height="64vh">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-right">Rank</th>
                <th class="text-left">{{ $t("Common.艦娘名") }}</th>
                <th class="text-right">{{ $t("Database.総経験値") }}</th>
                <th class="text-right">{{ $t("Database.経験値割合") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in expRankTable" :key="`exp_rank_row${i}`">
                <td class="text-right">{{ row.rank }}</td>
                <td class="text-left">{{ needTrans ? $t(`${row.name}`) : row.name }}</td>
                <td class="text-right">{{ row.exp }}</td>
                <td class="text-right">{{ row.rate }} %</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </div>
    <v-card class="my-4 pa-4">
      <div class="d-flex justify-center">
        <div class="body-2">{{ $t("Database.Lv帯別艦娘数") }}</div>
      </div>
      <div>
        <stacked-bar :data="stackedBarData" :options="stackedBarOption" />
      </div>
    </v-card>
    <v-dialog v-model="detailDialog" width="720" :fullscreen="isMobile">
      <v-card class="detail-card">
        <div class="d-flex justify-end pa-2">
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mx-2" />
        <div class="detail-content pa-1 pa-sm-4">
          <v-expansion-panels v-for="(row, i) in reportPlans" :key="`row${i}`" class="mt-2" v-model="row.open">
            <v-expansion-panel>
              <v-expansion-panel-header hide-actions class="py-2 pl-2">
                <div class="d-flex align-center">
                  <div>
                    <v-img v-if="isMobile" :src="`./img/ship/banner/${row.master.id}.png`" height="30" width="120" />
                    <v-img v-else :src="`./img/ship/banner/${row.master.id}.png`" height="40" width="160" />
                  </div>
                  <div class="ml-1 flex-grow-1">
                    <div class="primary--text caption">Lv.{{ row.stock.level }}</div>
                    <div class="d-flex">
                      <div class="ship-name text-truncate">{{ getShipName(row.master) }}</div>
                    </div>
                  </div>
                  <v-slide-y-reverse-transition>
                    <div class="ml-auto d-flex" v-if="row.open !== 0 || isMobile">
                      <div class="d-sm-flex align-center" :class="{ 'opacity-10': !row.blueprints }">
                        <img :src="`./img/util/blueprint.png`" height="40" width="40" alt="blueprint" />
                        <div class="ml-1 text-right body-2">x {{ row.blueprints }}</div>
                      </div>
                      <div class="ml-1 ml-sm-3 d-sm-flex align-center" :class="{ 'opacity-10': !row.actionReports }">
                        <img :src="`./img/util/actionReport.png`" height="40" width="40" alt="actionReport" />
                        <div class="ml-1 text-right body-2">x {{ row.actionReports }}</div>
                      </div>
                      <div class="ml-1 ml-sm-3 d-sm-flex align-center" :class="{ 'opacity-10': !row.catapults }">
                        <img :src="`./img/util/catapult.png`" height="40" width="40" alt="catapult" />
                        <div class="ml-1 text-right body-2">x {{ row.catapults }}</div>
                      </div>
                    </div>
                  </v-slide-y-reverse-transition>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-divider />
                <div v-for="(detail, j) in row.details" :key="`row${i}_${j}`" class="d-sm-flex mt-2">
                  <div class="d-flex flex-grow-1">
                    <div class="next-arrow-container" v-if="!usedMode">
                      <div class="mr-3">
                        <v-icon v-if="detail.requireEXP" color="warning">mdi-arrow-right-bold</v-icon>
                        <v-icon v-else color="success">mdi-arrow-right-bold</v-icon>
                      </div>
                      <div class="next-level" :class="{ 'warning--text': detail.requireEXP, 'success--text': !detail.requireEXP }">
                        <span class="caption">Lv.</span><span class="body-2">{{ detail.base.nextLv }}</span>
                      </div>
                    </div>
                    <div class="align-self-center">
                      <v-img v-if="isMobile" :src="`./img/ship/banner/${detail.next.id}.png`" height="30" width="120" />
                      <v-img v-else :src="`./img/ship/banner/${detail.next.id}.png`" height="40" width="160" />
                    </div>
                    <div class="ml-1 flex-grow-1 align-self-center">
                      <template v-if="!usedMode">
                        <div class="caption warning--text" v-if="detail.requireEXP">{{ $t("Database.残exp") }} {{ detail.requireEXP.toLocaleString() }}</div>
                        <div class="caption success--text" v-else><v-icon color="success" small>mdi-check-circle-outline</v-icon></div>
                      </template>
                      <div class="d-flex">
                        <div class="ship-name text-truncate">{{ getShipName(detail.next) }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="ml-auto d-flex align-self-center justify-center">
                    <div class="d-flex align-center" :class="{ 'opacity-10': !detail.blueprints }">
                      <v-img :src="`./img/util/blueprint.png`" height="40" width="40" />
                      <div class="ml-1 body-2 text-right">x {{ detail.blueprints }}</div>
                    </div>
                    <div class="ml-3 d-flex align-center" :class="{ 'opacity-10': !detail.actionReports }">
                      <v-img :src="`./img/util/actionReport.png`" height="40" width="40" />
                      <div class="ml-1 body-2 text-right">x {{ detail.actionReports }}</div>
                    </div>
                    <div class="ml-3 d-flex align-center" :class="{ 'opacity-10': !detail.catapults }">
                      <v-img :src="`./img/util/catapult.png`" height="40" width="40" />
                      <div class="ml-1 body-2 text-right">x {{ detail.catapults }}</div>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="expandAll()">{{ $t("Database.全て展開") }}</v-btn>
          <v-btn color="secondary" @click="collapseAll()">{{ $t("Database.全て折りたたむ") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.range-input {
  width: 80px;
}

.graph-area {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}

@media (min-width: 1100px) {
  .graph-area {
    display: grid;
    margin-top: 1rem;
    column-gap: 1rem;
    row-gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }
}

.detail-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.detail-content {
  overflow-y: auto;
}
@media (min-width: 600px) {
  .detail-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }
  .detail-content {
    height: 70vh;
    overflow-y: auto;
  }
}

.ship-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  overflow: hidden;
  white-space: nowrap;
}
.opacity-10 {
  opacity: 0.3;
}
.next-arrow-container {
  position: relative;
}
.next-level {
  position: absolute;
  white-space: nowrap;
  left: -4px;
  bottom: -4px;
}

table th,
table td {
  white-space: nowrap;
}

table {
  overflow: auto;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import sum from 'lodash/sum';
import mean from 'lodash/mean';
import RadarChart from '@/components/graph/Radar.vue';
import StackedBar from '@/components/graph/StackedBar.vue';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';

const radarDatasetLabels = ['最大Lv', '最小Lv', '中央Lv', '平均Lv'];
type planeDetail = { base: ShipMaster; next: ShipMaster; requireEXP: number; blueprints: number; actionReports: number; catapults: number };

export default Vue.extend({
  name: 'AnalyticsComponent',
  components: { RadarChart, StackedBar },
  data: () => ({
    levelRange: [1, Const.MAX_LEVEL],
    summaryTable: [] as { name: string; data: unknown }[],
    expRankTable: [] as { rank: number; name: string; exp: string; rate: string }[],
    unsubscribe: undefined as unknown,
    readOnly: false,
    radarGraphData: {
      labels: [] as string[],
      datasets: [
        {
          label: radarDatasetLabels[0],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(64, 164, 255, 0.1)',
          borderColor: 'rgb(64, 164, 255)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
        {
          label: radarDatasetLabels[1],
          data: [] as number[],
          backgroundColor: 'rgba(255, 64, 64, 0.1)',
          borderColor: 'rgb(255, 64, 64)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
          hidden: true,
        },
        {
          label: radarDatasetLabels[2],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(255, 128, 64, 0.1)',
          borderColor: 'rgb(255, 128, 64)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
        {
          label: radarDatasetLabels[3],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(0, 200, 0, 0.1)',
          borderColor: 'rgb(0, 200, 0)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
      ],
    },
    radarOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: Const.MAX_LEVEL,
          ticks: {
            stepSize: 25,
            color: 'rgb(64, 64, 64)',
            backdropColor: 'rgba(255, 255, 255, 0.7)',
          },
          angleLines: {
            // 角度線
            color: 'rgba(128, 128, 128, 0.4)',
          },
          pointLabels: {
            // 外側のラベル
            color: 'rgb(64, 64, 64)',
          },
          grid: {
            // 目盛り線
            color: 'rgba(128, 128, 128, 0.4)',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: 'rgb(64, 64, 64)' },
        },
        title: { display: true },
      },
    },
    stackedBarData: {
      labels: [] as string[],
      datasets: [] as { label: string }[],
    },
    stackedBarOption: {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: true, text: '艦娘数[隻]' },
          ticks: { color: 'rgb(64, 64, 64)' },
        },
        y: {
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: false },
          ticks: { color: 'rgb(64, 64, 64)' },
        },
      },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: 'rgb(64, 64, 64)' } },
      },
    },
    allShipCount: 0,
    allMarriageCount: 0,
    allExSlotCount: 0,
    totalLuckImprovement: 0,
    totalHPImprovement: 0,
    totalASWImprovement: 0,
    maruyuRank: 0,
    totalBluePrintsPlan: 0,
    totalActionReportsPlan: 0,
    totalCatapultsPlan: 0,
    totalBluePrints: 0,
    totalActionReports: 0,
    totalCatapults: 0,
    detailDialog: false,
    isMobile: true,
    usedMode: false,
    onlyBlueprint: false,
    onlyActionReport: false,
    onlyCatapult: false,
    reportPlans: [] as {
      master: ShipMaster;
      stock: ShipStock;
      blueprints: number;
      actionReports: number;
      catapults: number;
      details: planeDetail[];
      open: number;
    }[],
    maxLevel: Const.MAX_LEVEL,
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }
    this.analyze();
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
        this.analyze();
      }
    });

    const iMax = Math.floor(this.maxLevel / 10);
    for (let i = iMax; i > 0; i -= 1) {
      this.stackedBarData.labels.push(`${i * 10}～`);
    }
    this.stackedBarData.labels.push('1～');
  },
  watch: {
    isTempStockMode(value) {
      this.readOnly = !!value;
      this.analyze();
    },
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    analyze() {
      this.isMobile = window.innerWidth < 600;
      const all = this.$store.state.ships as ShipMaster[];
      let shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      const types = Const.SHIP_TYPES_ALT2;
      // 艦種別経験値解析テーブル
      const expTable = [];
      let allExp = 0;
      let allLevels: number[] = [];

      let marriageCount = 0;
      let exSlotCount = 0;
      let totalHPImprovement = 0;
      let totalASWImprovement = 0;
      let totalLuckImprovement = 0;
      let maruyuCount = 0;
      let totalBluePrintsPlan = 0;
      let totalActionReportsPlan = 0;
      let totalCatapultsPlan = 0;
      let totalBluePrints = 0;
      let totalActionReports = 0;
      let totalCatapults = 0;

      // 経験値ランキング 初期艦毎
      let expRanks: { id: number; name: string; exp: number; rate: number }[] = [];

      this.radarGraphData.labels = [];
      this.stackedBarData.datasets = [];
      this.stackedBarOption.scales.x.title.text = `${this.$t('Database.艦娘数')}`;
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        const typeName = this.isNotJapanese ? `${this.$t(`SType.${type.text}`)}` : type.text;
        this.radarGraphData.labels.push(typeName);
        this.radarGraphData.datasets[0].label = `${this.$t('Database.最大Lv')}`;
        this.radarGraphData.datasets[1].label = `${this.$t('Database.最小Lv')}`;
        this.radarGraphData.datasets[2].label = `${this.$t('Database.中央Lv')}`;
        this.radarGraphData.datasets[3].label = `${this.$t('Database.平均Lv')}`;

        // この艦種に該当する艦娘id
        const shipMaster = all.filter((v) => type.types.includes(v.type));
        const shipIds = shipMaster.map((v) => v.id);

        // 積み重ねグラフ用データ
        const newStackedData = {
          label: typeName,
          borderWidth: 0,
          data: [] as number[],
          stack: 'stack-1',
          datalabels: { display: false },
        };

        // 積み重ね用10刻みの各Level隻数突っ込むための配列を用意1~ 10~ 20~ のやつ
        const dataCount = Math.floor(this.maxLevel / 10);
        for (let j = 0; j <= dataCount; j += 1) {
          newStackedData.data.push(0);
        }

        // 在籍情報から取得
        const stocks = shipStock.filter((v) => shipIds.includes(v.id) && v.level >= this.levelRange[0] && v.level <= this.levelRange[1]);
        if (stocks.length) {
          const levels = [];
          const exps = [];

          for (let j = 0; j < stocks.length; j += 1) {
            const stock = stocks[j];
            levels.push(stock.level);
            exps.push(stock.exp);

            marriageCount += stock.level > 99 ? 1 : 0;
            exSlotCount += stock.releaseExpand ? 1 : 0;
            totalHPImprovement += stock.improvement.hp;
            totalASWImprovement += stock.improvement.asw;
            totalLuckImprovement += stock.improvement.luck;
            maruyuCount += stock.id === 163 || stock.id === 402 ? 1 : 0;

            newStackedData.data[newStackedData.data.length - 1 - Math.floor(stock.level / 10)] += 1;

            const master = all.find((v) => v.id === stock.id);
            if (!master) {
              continue;
            }

            const orgAlbumId = master.originalId;
            const rankData = expRanks.find((v) => v.id === orgAlbumId);
            if (rankData) {
              rankData.exp += stock.exp;
            } else if (orgAlbumId) {
              expRanks.push({
                id: orgAlbumId,
                name: '',
                exp: stock.exp,
                rate: 0,
              });
            }

            // 以前の改装状態を取得
            const olds = all.filter((v) => v.originalId === orgAlbumId && v.version < master.version);
            for (let k = 0; k < olds.length; k += 1) {
              const ship = olds[k];
              totalBluePrints += ship.blueprints;
              totalActionReports += ship.actionReports;
              totalCatapults += ship.catapults;
            }
            // 以降(自身を含む)の改装状態を取得
            const news = all.filter((v) => v.originalId === orgAlbumId && v.version >= master.version);
            for (let k = 0; k < news.length; k += 1) {
              const ship = news[k];
              totalBluePrintsPlan += ship.blueprints;
              totalActionReportsPlan += ship.actionReports;
              totalCatapultsPlan += ship.catapults;
            }
          }

          const sumExp = sum(exps);
          allExp += sumExp;
          allLevels = allLevels.concat(levels);
          const data = {
            count: stocks.length,
            maxLevel: max(levels),
            minLevel: min(levels),
            midLevel: this.getMidValue(levels),
            avgLevel: mean(levels),
            sumExp,
            avgExp: mean(exps),
            expRate: 0,
          };
          expTable.push({ name: typeName, data });
          this.radarGraphData.datasets[0].data[i] = data.maxLevel ? data.maxLevel : 0;
          this.radarGraphData.datasets[1].data[i] = data.minLevel ? data.minLevel : 0;
          this.radarGraphData.datasets[2].data[i] = data.midLevel ? data.midLevel : 0;
          this.radarGraphData.datasets[3].data[i] = data.avgLevel ? Math.floor(data.avgLevel) : 0;
        } else {
          const data = {
            count: 0,
            maxLevel: 0,
            minLevel: 0,
            midLevel: 0,
            avgLevel: 0,
            sumExp: 0,
            avgExp: 0,
            expRate: 0,
          };
          expTable.push({ name: typeName, data });
          this.radarGraphData.datasets[0].data[i] = 0;
          this.radarGraphData.datasets[1].data[i] = 0;
          this.radarGraphData.datasets[2].data[i] = 0;
          this.radarGraphData.datasets[3].data[i] = 0;
        }

        this.stackedBarData.datasets.push(newStackedData);
      }

      this.summaryTable = [];
      for (let i = 0; i < expTable.length; i += 1) {
        const row = expTable[i];
        this.summaryTable.push({
          name: row.name,
          data: {
            count: row.data.count,
            maxLevel: row.data.maxLevel,
            minLevel: row.data.minLevel,
            midLevel: row.data.midLevel,
            avgLevel: row.data.avgLevel ? row.data.avgLevel.toFixed(1) : 0,
            sumExp: row.data.sumExp.toLocaleString(),
            avgExp: Math.floor(row.data.avgExp).toLocaleString(),
            expRate: allExp ? Math.floor((1000 * row.data.sumExp) / allExp) / 10 : 0,
          },
        });
      }

      // 合計行
      const allLevel = sum(allLevels);
      const allCount = allLevels.length;
      this.summaryTable.push({
        name: this.isNotJapanese ? `${this.$t('SType.合計')}` : '合計',
        data: {
          count: allCount,
          maxLevel: max(expTable.map((v) => v.data.maxLevel)),
          minLevel: min(expTable.map((v) => v.data.minLevel)),
          midLevel: this.getMidValue(allLevels),
          avgLevel: allCount ? (allLevel / allCount).toFixed(1) : '0',
          sumExp: allExp.toLocaleString(),
          avgExp: allCount ? Math.floor(allExp / allCount).toLocaleString() : '0',
          expRate: allCount ? 100 : 0,
        },
      });

      this.allShipCount = allCount;
      this.allMarriageCount = marriageCount;
      this.allExSlotCount = exSlotCount;
      this.totalHPImprovement = totalHPImprovement;
      this.totalLuckImprovement = totalLuckImprovement;
      this.totalASWImprovement = totalASWImprovement;
      // まるゆ指数 => 総運改修値 - (ケッコン艦 * (4.5)) / 1.6 + まるゆ所持数
      this.maruyuRank = Math.max(Math.floor(maruyuCount + (totalLuckImprovement - this.allMarriageCount * 4.5) / 1.6), 0);

      this.totalBluePrintsPlan = totalBluePrintsPlan;
      this.totalActionReportsPlan = totalActionReportsPlan;
      this.totalCatapultsPlan = totalCatapultsPlan;
      this.totalBluePrints = totalBluePrints;
      this.totalActionReports = totalActionReports;
      this.totalCatapults = totalCatapults;

      expRanks = expRanks
        .sort((a, b) => {
          if (b.exp !== a.exp) return b.exp - a.exp;
          return a.id - b.id;
        })
        .splice(0, 50);
      this.expRankTable = [];
      for (let i = 0; i < expRanks.length; i += 1) {
        const rankData = expRanks[i];
        const name = all.find((v) => v.id === rankData.id)?.name;
        if (name) {
          rankData.name = name;
        }
        if (allExp) {
          rankData.rate = (100 * rankData.exp) / allExp;
        }

        this.expRankTable.push({
          rank: i + 1,
          name: rankData.name,
          exp: rankData.exp.toLocaleString(),
          rate: rankData.rate.toFixed(2),
        });
      }
    },
    getMidValue(array: number[]): number {
      if (array.length) {
        const count = array.length;
        array.sort((a, b) => a - b);
        const half = Math.floor(array.length / 2);
        return count % 2 ? array[half] : Math.floor((array[half - 1] + array[half]) / 2);
      }

      return 0;
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const array = ShipMaster.getSuffix(ship);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name ? ship.name : '';
    },
    showBlueprintPlanDialog() {
      this.usedMode = false;
      this.onlyBlueprint = true;
      this.onlyActionReport = false;
      this.onlyCatapult = false;
      this.setDetailDialogData();
    },
    showActionReportPlanDialog() {
      this.usedMode = false;
      this.onlyBlueprint = false;
      this.onlyActionReport = true;
      this.onlyCatapult = false;
      this.setDetailDialogData();
    },
    showCatapultPlanDialog() {
      this.usedMode = false;
      this.onlyBlueprint = false;
      this.onlyActionReport = false;
      this.onlyCatapult = true;
      this.setDetailDialogData();
    },
    showBlueprintUseDialog() {
      this.usedMode = true;
      this.onlyBlueprint = true;
      this.onlyActionReport = false;
      this.onlyCatapult = false;
      this.setDetailDialogData();
    },
    showActionReportUseDialog() {
      this.usedMode = true;
      this.onlyBlueprint = false;
      this.onlyActionReport = true;
      this.onlyCatapult = false;
      this.setDetailDialogData();
    },
    showCatapultUseDialog() {
      this.usedMode = true;
      this.onlyBlueprint = false;
      this.onlyActionReport = false;
      this.onlyCatapult = true;
      this.setDetailDialogData();
    },
    setDetailDialogData() {
      const all = this.$store.state.ships as ShipMaster[];
      let shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      this.reportPlans = [];
      const array = [];

      const stocks = shipStock.filter((v) => v.level >= this.levelRange[0] && v.level <= this.levelRange[1]);
      for (let i = 0; i < stocks.length; i += 1) {
        const stock = stocks[i];
        const master = all.find((v) => v.id === stock.id);
        if (!master) {
          continue;
        }

        const row = {
          master,
          stock,
          blueprints: 0,
          actionReports: 0,
          catapults: 0,
          details: [] as planeDetail[],
          open: -1,
        };

        let bases: ShipMaster[];
        if (this.usedMode) {
          // 以前(自身を含む)の改装状態を取得
          bases = all.filter((v) => v.originalId === master.originalId && v.version <= master.version);
        } else {
          // 以降(自身を含む)の改装状態を取得
          bases = all.filter((v) => v.originalId === master.originalId && v.version >= master.version);
        }
        for (let j = 0; j < bases.length; j += 1) {
          const ship = bases[j];

          let target: ShipMaster | undefined;
          if (this.usedMode) {
            target = bases.find((v) => v.version === ship.version - 1);
            if (target && (target.blueprints || target.actionReports || target.catapults)) {
              // フィルタ
              if (this.onlyBlueprint && !target.blueprints) {
                continue;
              }
              if (this.onlyActionReport && !target.actionReports) {
                continue;
              }
              if (this.onlyCatapult && !target.catapults) {
                continue;
              }

              row.details.push({
                base: ship,
                next: target,
                requireEXP: 0,
                blueprints: target.blueprints,
                actionReports: target.actionReports,
                catapults: target.catapults,
              });

              row.blueprints += target.blueprints;
              row.actionReports += target.actionReports;
              row.catapults += target.catapults;
            }
          } else {
            // 次の改装艦
            target = bases.find((v) => v.version === ship.version + 1);
            // 設計図とか
            if (target && (ship.blueprints || ship.actionReports || ship.catapults)) {
              // フィルタ
              if (this.onlyBlueprint && !ship.blueprints) {
                continue;
              }
              if (this.onlyActionReport && !ship.actionReports) {
                continue;
              }
              if (this.onlyCatapult && !ship.catapults) {
                continue;
              }

              let requireEXP = 0;
              if (stock.level < ship.nextLv) {
                const requiredLevel = Const.LEVEL_BORDERS.find((v) => v.lv === ship.nextLv);
                requireEXP = requiredLevel ? requiredLevel.req - stock.exp : 0;
              }

              row.details.push({
                base: ship,
                next: target,
                requireEXP,
                blueprints: ship.blueprints,
                actionReports: ship.actionReports,
                catapults: ship.catapults,
              });

              row.blueprints += ship.blueprints;
              row.actionReports += ship.actionReports;
              row.catapults += ship.catapults;
            }
          }
        }

        if (row.details.length) {
          array.push(row);
        }
      }

      array.sort((a, b) => a.master.sort - b.master.sort);
      this.reportPlans = array;

      this.isMobile = window.innerWidth < 600;
      this.detailDialog = true;
    },
    expandAll() {
      for (let i = 0; i < this.reportPlans.length; i += 1) {
        this.reportPlans[i].open = 0;
      }
    },
    collapseAll() {
      for (let i = 0; i < this.reportPlans.length; i += 1) {
        this.reportPlans[i].open = -1;
      }
    },
  },
});
</script>
