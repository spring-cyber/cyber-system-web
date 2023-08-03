import { defineComponent, nextTick, reactive, ref, watchEffect, watch } from 'vue';
import { Icon } from 'cyber-web-ui';
import { Input as AInput } from 'ant-design-vue';
import './ActionList.less';

export default defineComponent({
  name: 'CActionList',
  props: {
    value: Array,
    addText: {
      type: String,
      default: '新建'
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    productCode: String,
  },
  setup(props, { attrs, slots, emit, expose }) {
    const inputRef = ref();
    const actionState = reactive({
      actionKey: undefined,
      dataSource: [],
    });

    function addHandler() {
      actionState.dataSource.push('');
      actionState.actionKey = actionState.dataSource.length - 1;
      nextTick(() => unref(inputRef).focus());
    }
    function editHandler(index) {
      actionState.actionKey = index;
      nextTick(() => unref(inputRef).focus());
    }
    function deleteHandler(index) {
      actionState.dataSource.splice(index, 1);
      actionState.actionKey = undefined;
    }
    function onKeydown(event) {
      if(event.keyCode == 13) onBlur();
    }
    function onBlur() {
      if(!actionState.dataSource[actionState.actionKey]) {
        deleteHandler(actionState.actionKey);
      }
      actionState.actionKey = undefined;
    }

    watchEffect(() => actionState.dataSource = props.value || []);
    watch(() => actionState.dataSource, value => emit('update:value', value), { immediate: true, deep: true });

    return () => {
      const defaultSlot = () => {
        return actionState.dataSource.map((item, index) => {
          return <div class="cyber-action-item">
                  <Icon icon="cyber-API" size="16" class="cyber-action-icon" />
                  {
                    index == actionState.actionKey
                      ? <AInput
                          ref={inputRef}
                          v-model:value={actionState.dataSource[index]}
                          placeholder={props.placeholder}
                          onBlur={onBlur}
                          addon-before={props.productCode}
                          onKeydown={onKeydown}
                        ></AInput>
                      : <>
                          <span class="cyber-action-text">{ props.productCode }{ item }</span>
                          <span class="cyber-action-edit" onClick={() => editHandler(index)}>编辑</span>
                          <span class="cyber-action-delete" onClick={() => deleteHandler(index)}>删除</span>
                        </>
                  }
                </div>
        });
      }
      return (
        <div class="cyber-action-list">
          { defaultSlot() }
          <div
            class="cyber-action-item"
            style="justify-content: center;"
            onClick={addHandler}
          ><span class="cyber-action-text">{ props.addText }</span></div>
        </div>
      )
    }
  }
});
