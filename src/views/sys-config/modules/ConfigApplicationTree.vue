<template>
  <c-tree-body>
    <template #header>应用列表</template>
    <a-tree
      block-node
      :height="650"
      show-icon
      :fieldNames="{ title: 'name', key: 'id' }"
      v-model:selectedKeys="configState.selectedKeys"
      v-model:expandedKeys="configState.expandedKeys"
      :tree-data="configState.treeData"
      :onSelect="onSelect"
      :onExpand="onExpand"
    >
      <template #icon="{ treeIcon }">
        <c-icon :icon="treeIcon" size="14" v-if="treeIcon"/>
      </template>
    </a-tree>
  </c-tree-body>
</template>

<script setup>
import axios from '@/api';
import { watchEffect } from 'vue';
const props = defineProps({
  value: String,
});
const configState = reactive({
  treeData: [
    { id: 'sysConfig', name: '系统配置', isLeaf: true },
    { id: 'productConfig', name: '应用配置', children: [] },
  ],
  selectedKeys: [],
  expandedKeys: [],
});
const $emit = defineEmits(['update:value', 'change']);
function onSelect(selectedKeys, {selected, selectedNodes, node, event}) {
  // console.log('onSelect', selectedKeys, {selected, selectedNodes, node, event})
  // 应用类型
  if(node.id == 'productConfig') {
    configState.selectedKeys = [props.value];
    let findIndex = configState.expandedKeys.findIndex(item => item == node.id);
    if(findIndex != -1) {
      configState.expandedKeys.splice(findIndex, 1);
    } else {
      configState.expandedKeys.push(node.id);
    }
    configState.expandedKeys = [...configState.expandedKeys];
    return;
  }
  // 应用
  $emit('update:value', node.id);
  if(selected) {
    $emit('change', node);
  } else {
    configState.selectedKeys = [props.value];
  }
}
function onExpand(expandedKeys, {expanded: bool, node}) {
  configState.expandedKeys = expandedKeys;
}
async function queryProductSelect() {
  try {
    let res = await axios.request({
      url: '/system/product/select',
      method: 'get',
    });
    let target = props.value == '0' ? configState.treeData[0] : undefined;
    configState.treeData[1].children = (res.data || []).map(item => {
      if(props.value && props.value != '0' && props.value == item.id) {
        target = item;
      }
      return { ...item, isLeaf: true, icon: undefined, treeIcon: item.icon }
    });
    if(target) $emit('change', target);
    configState.treeData = [...configState.treeData];
  } catch(e) {
    if(e) throw Error(e);
  }
}
queryProductSelect();
watchEffect(() => configState.selectedKeys = [props.value]);
if(props.value && props.value != '0') configState.expandedKeys = ['productConfig'];
</script>