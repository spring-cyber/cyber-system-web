import { Icon } from 'cyber-web-ui';
import { Input as AInput } from 'ant-design-vue';
import { defineComponent, reactive, watchEffect } from 'vue';
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
  },
  setup(props, { attrs, slots, emit, expose }) {
    const actionState = reactive({
      actionKey: undefined,
      dataSource: [],
    });

    
    function addHandler() {
      actionState.dataSource.push('');
      actionState.actionKey = actionState.dataSource.length - 1;
    }
    function editHandler(index) {
      actionState.actionKey = index;
    }
    function deleteHandler(index) {
      actionState.dataSource.splice(index, 1);
      actionState.actionKey = undefined;
    }
    function onKeydown(event) {
      if(event.keyCode == 13) actionState.actionKey = undefined;
    }

    watchEffect(() => actionState.dataSource = props.value || []);
    watchEffect(() => emit('update:value', actionState.dataSource));

    return () => {
      const defaultSlot = () => {
        return actionState.dataSource.map((item, index) => {
          return <div class="cyber-action-item">
                  <Icon icon="cyber-API" size="16" class="cyber-action-icon" />
                  {
                    index == actionState.actionKey
                      ? <AInput
                          v-model:value={actionState.dataSource[index]}
                          placeholder={props.placeholder}
                          onBlur={() => actionState.actionKey = undefined}
                          onKeydown={onKeydown}
                        ></AInput>
                      : <>
                          <span class="cyber-action-text">{ item }</span>
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
