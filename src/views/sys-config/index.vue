<template>
  <c-page-label title="系统配置项" icon="cyber-jiaose2" document-link="javascript:;">
    <template #tips>维护配置项相关信息。</template>
  </c-page-label>


  <div class="flex">
    <ConfigApplicationTree v-model:value="queryState.productId" @change="methods.onChange"></ConfigApplicationTree>

    <div class="w-0 flex-1 ml-20px">
      <c-table-wrapper
        rowKey="id"
        ref="tableRef"
        v-model:loading="tableState.loading"
        :columns="tableState.columns"
        :overlayMenu="tableState.overlayMenu"
        @search="methods.searchQuery"
      >
        <template #collapse>
          <span class="text-14px weight-600">
            {{ tableState.tableTitle }}
          </span>
        </template>
        <template #right>
          <a-button type="primary" ghost @click="methods.showModify()">添加参数</a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'configName'">
            <c-cell icon="cyber-peizhixiang1" :title="record.configName"></c-cell>
          </template>
          <template v-if="column.key == 'configType'">
            <c-cell-dict :options="$dictStore.configType" :value="record.configType"></c-cell-dict>
          </template>
        </template>
      </c-table-wrapper>
    </div>
  </div>

  <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
</template>

<script setup>
import { dictStore } from '@/store';
import { deleteConfrim } from '@/api';
import { changeHistoryState, initHistoryState } from 'cyber-web-ui';
import Modify from './modules/Modify.vue';
import ConfigApplicationTree from './modules/ConfigApplicationTree.vue';
const $dictStore = dictStore();
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    productId: 'sysConfig',
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '参数名称', key: "configName", ellipsis: true },
    { title: '参数键名', dataIndex: "configKey", width: '12%', ellipsis: true },
    { title: '参数键值', dataIndex: "configValue", ellipsis: true },
    { title: '参数类型', key: "configType", width: '12%' },
    { title: '参数描述', dataIndex: "description", ellipsis: true },
    { title: '更新时间', dataIndex: "updateTime", width: "200px" },
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
  appNode: {},
  tableTitle: computed(() => {
    return queryState.productId == 'sysConfig'
      ? '系统配置'
      : `应用配置 / ${tableState.appNode?.name || '-'}`
  })
});

const methods = {
  onChange(node) {
    tableState.appNode = node || {};
    nextTick(methods.searchQuery);
  },
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/system/sysconfig/search',
      method: 'get',
      params: {
        productId: queryState.productId == 'sysConfig' ? undefined : queryState.productId,
        configType: queryState.productId == 'sysConfig' ? '0' : '1',
        sortBy: 'create_time',
        sortType: 'desc',
      },
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal({
      productId: tableState.appNode.id,
      productName: tableState.appNode.name,
      productCode: tableState.appNode.code,
      configType: queryState.productId == 'sysConfig' ? '0' : '1',
      ...(record || {}),
    });
  },
  // 删除
  delete(record) {
    deleteConfrim({
      content: `是否确认删除“${record.configName}（${record.configCode}）”的配置项及其相关数据？`,
      value: record.configCode,
    }, {
      url: '/system/sysconfig',
      method: 'delete',
      params: {
        id: record.id,
      }
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
