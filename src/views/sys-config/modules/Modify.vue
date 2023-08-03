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
      <a-form-item label="所属应用" name="productName" v-if="formState.configType == '1'">
        <a-input v-model:value="formState.productName" disabled></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="参数名称" name="configName">
          <a-input v-model:value="formState.configName" placeholder="请输入参数名称..."></a-input>
        </a-form-item>
        <a-form-item label="参数编码" name="configCode">
          <a-input v-model:value="formState.configCode" placeholder="请输入参数编码..."></a-input>
        </a-form-item>
      </div>
      <a-form-item label="参数键名" name="configKey">
        <a-input v-model:value="formState.configKey" placeholder="请输入参数键名..."></a-input>
      </a-form-item>
      <a-form-item label="参数键值" name="configValue">
        <a-input v-model:value="formState.configValue" placeholder="请输入参数键值..."></a-input>
      </a-form-item>
      <a-form-item label="参数描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { required, checkCode } from 'cyber-web-ui';
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
  productCode: undefined,
  productId: undefined,
  configName: undefined,
  configCode: undefined,
  configKey: undefined,
  configValue: undefined,
  configType: undefined,
  description: undefined,
  version: undefined,
});
// 表单校验规则
const rules = {
  configName: required(),
  configCode: [required(), checkCode()],
  configKey: required(),
  configValue: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/system/sysconfig', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail?.[key];
    });
    console.log('configType', formState.configType)
    formState.productName = record.productName;
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/system/sysconfig',
          method: modalState.isCreate ? 'post' : 'put',
          data: {
            ...formState,
            productName: undefined,
            productId: formState.type == '0' ? undefined : formState.productId,
          }
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
