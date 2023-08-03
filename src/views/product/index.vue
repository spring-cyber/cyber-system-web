<template>
  <div>
    <c-page-label title="应用管理" icon="cyber-yingyong" document-link="#应用中心">
      <template #tips>维护应用相关信息。</template>
    </c-page-label>

    <c-radio-wrapper v-model:value="queryState.status" @change="methods.searchQuery">
      <c-radio-button value="" :count="tableState.total + ''">全部</c-radio-button>
      <c-radio-button
        v-for="(item, index) in STATUS"
        :key="index"
        :value="item.value"
        :count="tableState.count?.[item.value] ? tableState.count?.[item.value] + '' : '0'"
        :dark="item.value == '1'"
      >{{ item.label }}</c-radio-button>
    </c-radio-wrapper>

    <c-table-wrapper
      rowKey="id"
      ref="tableRef"
      v-model:loading="tableState.loading"
      :columns="tableState.columns"
      :overlayMenu="tableState.overlayMenu"
      @search="methods.searchQuery"
    >
      <template #collapse>
        <!-- 应用类型（0系统）搜索 -->
        <c-select
          v-model:value="queryState.type"
          :options="PRODUCT_TYPE"
          allowClear
          width="168px"
          placeholder="应用类型"
          @change="methods.searchQuery()"
        ></c-select>
        <!-- 应用名称搜索 -->
        <a-input
          v-model:value="queryState.name"
          placeholder="请输入应用名称、编码搜索..."
          style="width: 256px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
      </template>
      <template #right>
        <a-button type="primary" @click="methods.showModify()">新建</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'name'">
          <c-cell icon="cyber-yingyong2" :title="record.name"></c-cell>
        </template>
        <template v-if="column.key == 'icon'">
          <c-icon v-if="record.icon" isSvg :icon="record.icon" size="16"></c-icon>
        </template>
        <template v-if="column.key == 'type'">
          <c-cell-dict :options="PRODUCT_TYPE" :value="record.type"></c-cell-dict>
        </template>
        <template v-if="column.key == 'status'">
          <c-cell-dict :options="STATUS" :value="record.status"></c-cell-dict>
        </template>
      </template>
    </c-table-wrapper>

    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
  </div>
</template>

<script setup>
import axios from '@/api';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
import Modify from './modules/Modify.vue';
const { STATUS, PRODUCT_TYPE } = useDict({ COMMON: ['STATUS', 'PRODUCT_TYPE'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    name: undefined,
    type: undefined,
    status: '',
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '应用名称', key: "name", width: '12%', ellipsis: true },
    { title: '应用编码', dataIndex: "code", width: '12%', ellipsis: true },
    { title: '应用图标', key: "icon", width: '12%', ellipsis: true },
    { title: '应用类型', key: "type", width: '12%', ellipsis: true },
    { title: '应用描述', dataIndex: "description", ellipsis: true },
    { title: '应用状态', key: "status", width: '12%', ellipsis: true },
    { title: '更新时间', dataIndex: "updateTime", width: '240px' },
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
  count: {},
  total: '0',
});

const methods = {
  // 搜索表格
  async searchQuery() {
    changeHistoryState(queryState);
    try {
      let res = await axios.request({
        url: '/system/product/status/count',
        method: 'get',
      });
      tableState.total = 0;
      (res.data || []).forEach(item => {
        tableState.count[item.status] = item.count;
        tableState.total += item.count;
      });
    } catch {
      tableState.total = 0;
      tableState.count = {};
    };
    unref(tableRef).searchQuery({
      url: '/system/product/search',
      method: 'get',
      params: {
        ...queryState,
        code: queryState.name,
        sortBy: 'type,order_num',
        sortType: 'asc',
      },
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal(record);
  },
  // 删除
  delete(record) {
    Modal.verify({
      content: `是否确认删除“${record.name}”的应用及其相关数据？`,
      value: record.name,
      params: {
        url: '/system/product',
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

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
