<template>
  <div>
    <c-page-label title="菜单管理" icon="cyber-caidan" document-link="#菜单管理">
      <template #tips>维护应用菜单相关信息。</template>
    </c-page-label>

    <div class="flex">
      <c-product-tree v-model:value="queryState.productId" @change="methods.onChange"></c-product-tree>
      
      <div class="w-0 flex-1 ml-20px">
        <c-table-wrapper
          rowKey="id"
          ref="tableRef"
          v-model:loading="tableState.loading"
          :dataSource="tableState.dataSource"
          :columns="tableState.columns"
          :overlayMenu="tableState.overlayMenu"
          @search="methods.searchQuery"
        >
          <template #collapse>
            <span class="text-14px weight-600">{{ tableState.parentNode?.name || '-' }} / {{ tableState.appNode?.name || '-' }}</span>
          </template>
          <template #right>
            <a-button type="primary" :disabled="!queryState.productId" @click="methods.showModify()">新建</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key == 'icon'">
              <c-icon v-if="record.menu.icon" isSvg :icon="record.menu.icon" size="16"></c-icon>
            </template>
            <template v-if="column.key == 'status'">
              <c-cell-dict :options="STATUS" :value="record.menu.status"></c-cell-dict>
            </template>
          </template>
        </c-table-wrapper>
      </div>
    </div>

    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
  </div>
</template>

<script setup>
import axios from '@/api';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
import Modify from './modules/Modify.vue';
import { message } from 'ant-design-vue';
const { STATUS } = useDict({ COMMON: ['STATUS'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    productId: undefined,
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '菜单名称', dataIndex: ['menu', 'name'] },
    { title: '菜单编码', dataIndex: ['menu', 'code'], width: '18%' },
    { title: '菜单图标', key: 'icon', width: '18%' },
    { title: '菜单状态', key: "status", width: '18%' },
    { title: '更新时间', dataIndex: ['menu', 'updateTime'], width: '240px' },
  ],
  overlayMenu: [
    {
      label: "编辑",
      handler: (record) => methods.showModify(record),
    },
    {
      label: "删除",
      handler: (record) => methods.delete(record),
    },
  ],
  dataSource: [],
  appNode: {},
  parentNode: {},
});

const methods = {
  onChange(node, parentNode) {
    tableState.appNode = node || {};
    tableState.parentNode = parentNode || {};
    nextTick(methods.searchQuery);
  },
  // 搜索表格
  async searchQuery() {
    if(!queryState.productId) {
      message.warning('请先选择应用！');
      return;
    }
    changeHistoryState(queryState);
    tableState.loading = true;
    try {
      let { data = [] } = await axios.request({
        url: '/system/menu/tree',
        method: 'get',
        params: {
          ...queryState,
          sortBy: 'order_num',
          sortType: 'asc',
        },
      });
      tableState.dataSource = data;
    } catch {
      tableState.dataSource = [];
    }
    tableState.loading = false;
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal({
      productId: tableState.appNode.id,
      productName: tableState.appNode.name,
      ...(record?.menu || {}),
    }, `/${tableState.appNode.code}/`);
  },
  // 删除
  delete(record) {
    Modal.verify({
      content: `是否确认删除“${record.menu.name}”的菜单及其相关数据？`,
      value: record.menu.name,
      params: {
        url: '/system/menu',
        method: 'delete',
        params: {
          id: record.id,
        }
      },
    }).then(() => {
      methods.searchQuery();
    });
  },
};
</script>

<style lang="less" scoped>
</style>
