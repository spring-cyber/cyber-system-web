<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    :title="modalState.title"
    :okText="modalState.okText"
    @ok="methods.onSubmit"
    @cancel="formState.productId = undefined"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="所属应用" name="productId">
          <a-input v-model:value="formState.productName" disabled placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="上级菜单" name="parentId">
          <c-menu-tree-select
            v-model:value="formState.parentId"
            placeholder="请选择上级菜单"
            allowClear
            :productId="formState.productId"
            :excludeId="formState.id"
          ></c-menu-tree-select>
        </a-form-item>
        <a-form-item label="菜单名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入菜单名称..."></a-input>
        </a-form-item>
        <a-form-item label="菜单编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入菜单编码..."></a-input>
        </a-form-item>
        <a-form-item label="菜单图标" name="icon">
          <c-icon-select v-model:value="formState.icon" allowClear placeholder="请点击选择菜单图标"></c-icon-select>
        </a-form-item>
        <a-form-item label="路由地址" name="path">
          <a-input v-model:value="formState.path" placeholder="请输入路由地址..."></a-input>
        </a-form-item>
        <a-form-item label="组件路径" name="component">
          <a-input v-model:value="formState.component" placeholder="请输入组件路径..."></a-input>
        </a-form-item>
        <a-form-item label="路由参数" name="query">
          <a-input v-model:value="formState.query" placeholder="请输入路由参数..."></a-input>
        </a-form-item>
        <a-form-item label="显示状态" name="visible">
          <a-radio-group v-model:value="formState.visible" :options="MENU_VISIBLE"></a-radio-group>
        </a-form-item>
        <a-form-item label="是否外链" name="isFrame">
          <a-radio-group v-model:value="formState.isFrame" :options="IS_FRAME"></a-radio-group>
        </a-form-item>
        <a-form-item label="菜单状态" name="status">
          <a-radio-group v-model:value="formState.status" :options="STATUS"></a-radio-group>
        </a-form-item>
        <a-form-item label="显示顺序" name="orderNum">
          <a-input-number
            placeholder="请输入排序..."
            class="w-150px"
            :min="0"
            :max="9999"
            v-model:value="formState.orderNum"
          ></a-input-number>
        </a-form-item>
      </div>
      <a-form-item label="API列表" name="apiPerms">
        <ActionList :productCode="modalState.productCode" v-model:value="formState.apiPerms"></ActionList>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import ActionList from './ActionList.jsx';
import { required, useDict, checkCode } from 'cyber-web-ui';
const { STATUS, IS_FRAME, MENU_VISIBLE } = useDict({ COMMON: ['STATUS'], SYSTEM: ['IS_FRAME', 'MENU_VISIBLE'] });
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => modalState.isCreate ? '新建菜单' : '编辑菜单'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
  productCode: undefined,
});
// 表单信息
const formState = reactive({
  id: undefined,
  productId: undefined,
  productName: undefined,
  parentId: undefined,
  name: undefined,
  code: undefined,
  orderNum: undefined,
  apiPerms: [],
  status: '0',
  version: undefined,
  icon: undefined,
  path: undefined,
  component: undefined,
  query: undefined,
  visible: '0',
  isFrame: '1',
});
// 表单校验规则
const rules = {
  name: required(),
  code: [required(), checkCode()],
  orderNum: required(),
  status: required(),
  path: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record, productCode) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    modalState.productCode = productCode;
    let detail = await queryDetail('/system/menu', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail?.[key];
    });
    if(modalState.isCreate) {
      formState.orderNum = 1;
      formState.status = '0';
      formState.visible = '0';
      formState.isFrame = '1';
    } else {
      formState.status += '';
      formState.visible += '';
      formState.isFrame += '';
      formState.productName = record.productName;
    }
    formState.parentId = formState.parentId == '0' ? undefined : formState.parentId;
    let productCodeReg = new RegExp(`^${productCode}`);
    formState.apiPerms = (formState.apiPerms || []).map(item => item.replace(productCodeReg, ''));
    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/system/menu',
          method: modalState.isCreate ? 'post' : 'put',
          data: {
            ...formState,
            parentId: formState.parentId || 0,
            productName: undefined,
            apiPerms: (formState.apiPerms || []).filter(item => item).map(item => `${modalState.productCode}${item}`),
          },
        });
        formState.productId = undefined;
        message.success(res.message);
        $emit('ok');
        resolve();
      } catch (error) {
        console.log('error', error);
        reject();
      }
    });
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
