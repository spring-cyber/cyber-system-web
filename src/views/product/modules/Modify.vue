<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    :title="modalState.title"
    :okText="modalState.okText"
    @ok="methods.onSubmit"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="应用名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入应用名称..."></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="应用编码" name="code">
          <a-input v-model:value="formState.code" :disabled="!modalState.isCreate" placeholder="请输入应用编码..."></a-input>
        </a-form-item>
        <a-form-item label="应用类型" name="type">
          <c-select v-model:value="formState.type" :options="PRODUCT_TYPE" placeholder="请选择应用类型"></c-select>
        </a-form-item>
        <a-form-item label="应用图标" name="icon">
          <c-icon-select v-model:value="formState.icon" placeholder="请点击选择应用图标"></c-icon-select>
        </a-form-item>
        <a-form-item label="门户地址" name="portalAdd">
          <a-input v-model:value="formState.portalAdd" placeholder="http://www.example.com"></a-input>
        </a-form-item>
        <a-form-item label="应用状态" name="status">
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
        <a-form-item label="负责人" name="leader">
          <a-input v-model:value="formState.leader" placeholder="请输入负责人姓名..." show-count :maxlength="32"></a-input>
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入负责人电话..." show-count :maxlength="32"></a-input>
        </a-form-item>
        <a-form-item label="联系邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入负责人联系邮箱..." show-count :maxlength="64"></a-input>
        </a-form-item>
      </div>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { required, useDict, checkCode } from 'cyber-web-ui';
const { STATUS, PRODUCT_TYPE } = useDict({ COMMON: ['STATUS', 'PRODUCT_TYPE'] });
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => modalState.isCreate ? '新建' : '编辑'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
});
// 表单信息
const formState = reactive({
  id: undefined,
  name: undefined,
  code: undefined,
  icon: undefined,
  portalAdd: undefined,
  type: undefined,
  orderNum: 1,
  leader: undefined,
  phone: undefined,
  email: undefined,
  description: undefined,
  status: '0',
  version: undefined,
});
// 表单校验规则
const rules = {
  name: required(),
  code: [required(), checkCode()],
  icon: required(),
  portalAdd: required(),
  type: required(),
  orderNum: required(),
  status: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/system/product', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail?.[key];
    });
    if(modalState.isCreate) {
      formState.orderNum = 1;
      formState.status = '0';
    } else {
      formState.status += '';
      formState.type += '';
    }
    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/system/product',
          method: modalState.isCreate ? 'post' : 'put',
          data: formState
        });
        message.success(res.message);
        $emit('ok');
        resolve();
      } catch (error) {
        console.log('error', error);
        reject();
      }
    })
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
