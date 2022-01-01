import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import ShipMaster from '@/classes/fleet/shipMaster';
import ItemMaster from '@/classes/item/itemMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import CalcManager from '@/classes/calcManager';
import CellMaster, { RawCell } from '@/classes/enemy/cellMaster';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ships: [] as ShipMaster[],
    items: [] as ItemMaster[],
    cells: [] as CellMaster[],
    enemies: [] as EnemyMaster[],
    completed: false,
    calcManager: undefined as CalcManager | undefined,
  },
  mutations: {
    setShips: (state, values: ShipMaster[]) => {
      state.ships = values;
    },
    setEnemies: (state, values: EnemyMaster[]) => {
      state.enemies = values;
    },
    setItems: (state, values: ItemMaster[]) => {
      state.items = values;
    },
    setCells: (state, values: CellMaster[]) => {
      state.cells = values;
    },
    setCalcManager: (state, values: CalcManager) => {
      state.calcManager = values;
    },
    completed: (state, value: boolean) => {
      state.completed = value;
      console.log('master initialized!');
    },
  },
  actions: {
    setCalcManager(context, value: CalcManager) {
      context.commit('setCalcManager', value);
    },
    loadData: async (context) => {
      const loadShip = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/ships?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const ships: ShipMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const ship = new ShipMaster(...response.data.values[i]);
            if (ship.id) {
              ships.push(ship);
            }
          }
          context.commit('setShips', ships);
        })
        .catch((error) => {
          console.log(error);
        });

      const loadEnemy = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/enemies?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const enemies: EnemyMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const enemy = new EnemyMaster(...response.data.values[i]);
            if (enemy.id) {
              enemies.push(enemy);
            }
          }
          context.commit('setEnemies', enemies);
        })
        .catch((error) => {
          console.log(error);
        });

      const loadItem = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/items?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const items: ItemMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const item = new ItemMaster(...response.data.values[i]);
            if (item.id) {
              items.push(item);
            }
          }
          context.commit('setItems', items);
        })
        .catch((error) => {
          console.log(error);
        });

      const loadCell = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/cells?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const cells: CellMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const raw = JSON.parse(`${response.data.values[i][0]}`.slice(0, -1)) as RawCell;
            cells.push(new CellMaster(raw));
          }
          context.commit('setCells', cells);
        })
        .catch((error) => {
          console.log(error);
        });

      const loader = [loadShip, loadEnemy, loadItem, loadCell];
      Promise.all(loader).then(() => {
        context.commit('completed', true);
      });
    },
  },
  modules: {
  },
  getters: {
    getCompleted: (state) => state.completed,
  },
});
