<template>
  <c-page-label title="角色管理" icon="cyber-jiaose2" document-link="javascript:;">
    <template #tips>维护角色相关信息。</template>
  </c-page-label>

  <div class="flex">
    <c-product-tree v-model:value="queryState.productId" @change="methods.onChange"></c-product-tree>

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
          <span class="text-14px weight-600">{{ tableState.parentNode?.name || '-' }} / {{ tableState.appNode?.name || '-' }}</span>
        </template>
        <template #right>
          <a-button type="primary" :disabled="!queryState.productId" @click="methods.showModify()">新建</a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'name'">
            <c-cell icon="cyber-jiaose" :title="record.name"></c-cell>
          </template>
          <template v-if="column.key == 'type'">
            <c-cell-dict :options="$dictStore.roleType" :value="record.type"></c-cell-dict>
          </template>
          <template v-if="column.key == 'status'">
            <c-cell-dict :options="$dictStore.status" :value="record.status"></c-cell-dict>
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
import { message } from 'ant-design-vue';
const $dictStore = dictStore();
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
    { title: '角色名称', key: "name" },
    { title: '角色编码', dataIndex: "code" },
    { title: '角色类型', key: "type" },
    { title: '角色描述', dataIndex: "description" },
    { title: '状态', key: "status" },
    { title: '更新时间', dataIndex: "updateTime" },
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
  parentNode: {},
});

const methods = {
  onChange(node, parentNode) {
    tableState.appNode = node || {};
    tableState.parentNode = parentNode || {};
    nextTick(methods.searchQuery);
  },
  // 搜索表格
  searchQuery() {
    if(!queryState.productId) {
      message.warning('请先选择应用！');
      return;
    }
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/system/role/search',
      method: 'get',
      params: {
        ...queryState,
        sortBy: 'order_num',
        sortType: 'asc',
      },
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal({
      productId: tableState.appNode.id,
      productName: tableState.appNode.name,
      ...(record || {}),
    });
  },
  // 删除
  delete(record) {
    deleteConfrim({
      content: `是否确认删除“${record.name}（${record.code}）”的角色及其相关数据？`,
      value: record.code,
    }, {
      url: '/system/role',
      method: 'delete',
      params: {
        id: record.id,
      }
    }).then(() => {
      methods.searchQuery();
    });
  },
};
</script>

<style lang="less" scoped>
</style>
