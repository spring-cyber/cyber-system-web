<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="720px"
    :title="modalState.title"
    :okText="modalState.okText"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="公告标题" name="noticeTitle">
        <a-input v-model:value="formState.noticeTitle" placeholder="请输入公告标题..."></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="发布时间" name="createTime">
          <a-date-picker
            v-model:value="formState.createTime"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择发布时间..."
            class="w-1/1"
            :disabled-date="methods.disabledDate"
          />
        </a-form-item>
        <a-form-item label="发布范围" name="noticeScope">
          <a-input v-model:value="formState.noticeScope" placeholder="请输入发布范围..."></a-input>
        </a-form-item>
      </div>
      <a-form-item label="公告内容" name="noticeContent">
        <a-textarea v-model:value="formState.noticeContent" :autoSize="{ minRows: 10 }" placeholder="请输入描述信息..." show-count :maxlength="360"></a-textarea>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" ghost @click="modalState.visible = false">取消</a-button>
      <a-button type="primary" ghost @click="methods.onSubmit('1')">保存</a-button>
      <a-button type="primary" @click="methods.onSubmit('0')">发布</a-button>
    </template>
  </c-modal>
</template>

<script setup>
import axios from '@/api';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { required } from 'cyber-web-ui';
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
  productId: undefined,
  noticeTitle: undefined,
  noticeScope: undefined,
  noticeContent: undefined,
  status: undefined,
  deleted: undefined,
  creator: undefined,
  createTime: undefined,
  updator: undefined,
  updateTime: undefined,
  remark: undefined,
  version: undefined,
});
// 表单校验规则
const rules = {
  id: required(),
  productId: required(),
  noticeTitle: required(),
  noticeScope: required(),
  noticeContent: required(),
  status: required(),
  deleted: required(),
  creator: required(),
  createTime: required(),
  updator: required(),
  updateTime: required(),
  remark: required(),
  version: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    Object.keys(formState).forEach(key => {
      formState[key] = modalState.isCreate ? undefined : record?.[key];
    });
  },
  async onSubmit(status) {
    try {
      // 校验表单
      await unref(formRef).validate();
      // 请求添加/修改接口
      let res = await axios.request({
        url: '/system/sysnotice',
        method: modalState.isCreate ? 'post' : 'put',
        data: {
          ...formState,
          status
        }
      });
      message.success(res.message);
      modalState.visible = false;
      $emit('ok');
    } catch (error) {
      console.log('error', error);
    }
  },
  // 禁用日期
  disabledDate(currentDate) {
    return currentDate.unix() - dayjs().unix() < 0;
  },
  range(start, end) {
    const result = [];

    for (let i = start; i < end; i++) {
      result.push(i);
    }

    return result;
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
