<!-- 新增编辑弹窗 -->
<template>
  <a-modal
    v-if="visible"
    :title="props.title"
    :maskClosable="false"
    destroy-on-close
    visible
    @ok="submitData"
    @cancel="close"
    :confirmLoading="loading"
    :okText="$t('modifyModal.index.177674-0')"
    :cancelText="$t('modifyModal.index.177674-1')"
    v-bind="layout"
  >
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="tab1" :tab="$t('Category.index.779033-15')">
        <a-form layout="vertical" ref="formRef" :rules="rules" :model="formModel">
          <a-form-item :label="$t('modifyModal.index.177674-2')" name="name">
            <a-input
              v-model:value="formModel.name"
              :placeholder="$t('modifyModal.index.177674-3')"
            />
          </a-form-item>
          <a-form-item :label="$t('modifyModal.index.177674-4')" name="sortIndex">
            <a-input-number
              style="width: 100%"
              id="inputNumber"
              v-model:value="formModel.sortIndex"
              :min="1"
              :max="9999"
              :precision="0"
              :placeholder="$t('modifyModal.index.177674-5')"
            />
          </a-form-item>
          <a-form-item :label="$t('modifyModal.index.177674-6')">
            <a-textarea
              v-model:value="formModel.description"
              show-count
              :maxlength="200"
              :placeholder="$t('modifyModal.index.177674-7')"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="tab2" :tab="$t('Category.index.779033-16')">
        <EditTable
          ref="formRef"
          :data-source="metadataList"
          :columns="metadataColumns"
          :height="400"

          rowKey="id"
          @editChange="onMetadataEdit"
        >
          <template #id="{ record, index }">
            <EditTableFormItem :name="[index, 'id']" @change="metadataChange">
              <a-input
                v-model:value="record.id"
                :placeholder="$t('Category.index.779036-1')"
              />
            </EditTableFormItem>
          </template>

          <template #name="{ record, index }">
            <EditTableFormItem :name="[index, 'name']" @change="metadataChange">
              <a-input
                v-model:value="record.name"
                :placeholder="$t('Category.index.779036-2')"
              />
            </EditTableFormItem>
          </template>

          <template #expands="{ record, index }">
            <EditTableFormItem :name="[index, 'expands']" @change="metadataChange">
              <a-select
                v-model:value="record.expands.required"
                :placeholder="$t('Category.index.779036-3')"
                style="width: 100%"
              >
                <a-select-option :value="false">{{ $t('Category.index.779034-0') }}</a-select-option>
                <a-select-option :value="true">{{ $t('Category.index.779034-1') }}</a-select-option>
              </a-select>
            </EditTableFormItem>
          </template>

          <template #valueType="{ record, index }">
            <EditTableFormItem :name="[index, 'valueType']" @change="metadataChange">
              <div class="datatype-container">
                <a-select
                  v-model:value="record.valueType.type"
                  :placeholder="$t('Category.index.779036-4')"
                  style="width: 100%"
                >
                  <a-select-option value="int">{{ $t('Category.index.779035-1') }}</a-select-option>
                  <a-select-option value="string">{{ $t('Category.index.779035-2') }}</a-select-option>
                  <a-select-option value="enum">{{ $t('Category.index.779035-3') }}</a-select-option>
                </a-select>
                <a-button
                  v-if="record.valueType.type === 'enum'"
                  type="link"
                  size="small"
                  @click="editEnumData(record, index)"
                  title="编辑枚举值"
                  class="enum-edit-btn"
                >
                  <EditOutlined />
                </a-button>
              </div>
            </EditTableFormItem>
          </template>

          <template #actions="{ record, index }">
            <div class="table-actions">
              <a-button
                type="link"
                size="small"
                danger
                @click="deleteMetadataItem(index)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
          </template>
          
          <template #bodyExtra>
            <div class="metadata-add-row">
              <a-button
                type="dashed"
                block
                @click="addMetadataItem"
                :disabled="loading"
                class="add-row-btn"
              >
                <PlusOutlined />
                {{ $t('Category.index.779033-0')}}
              </a-button>
            </div>
          </template>
        </EditTable>
      </a-tab-pane>
    </a-tabs>
  </a-modal>

  <!-- 枚举编辑弹窗 -->
  <a-modal
    v-model:visible="enumModalVisible"
    :title="`编辑枚举值 - ${currentEnumField?.name || ''}`"
    :width="600"
    :z-index="2000"
    @ok="saveEnumData"
    @cancel="closeEnumModal"
    :confirmLoading="enumLoading"
  >
    <div class="enum-edit-container">
      <div class="enum-list-header">
        <span>枚举项列表</span>
        <a-button 
          type="primary" 
          size="small" 
          @click="addEnumItem"
          :disabled="enumLoading"
        >
          <PlusOutlined />
          新增枚举项
        </a-button>
      </div>
      
      <div class="enum-items-container">
        <div 
          v-for="(item, index) in currentEnumData" 
          :key="index"
          class="enum-item-row"
        >
          <div class="enum-item-inputs">
            <a-input
              v-model:value="item.value"
              placeholder="枚举值"
              style="width: 120px; margin-right: 8px;"
            />
            <a-input
              v-model:value="item.text"
              placeholder="枚举显示文本"
              style="flex: 1; margin-right: 8px;"
            />
          </div>
          <a-button
            type="link"
            danger
            size="small"
            @click="removeEnumItem(index)"
            :disabled="enumLoading"
          >
            <DeleteOutlined />
          </a-button>
        </div>
        
        <div v-if="currentEnumData.length === 0" class="enum-empty">
          <j-empty description="暂无枚举项，点击上方按钮新增" />
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts" name="modifyModal">
import { PropType } from "vue";
import { Form } from "ant-design-vue";
import { queryTree, saveTree, updateTree } from "../../../../../api/category";
import { onlyMessage } from "@/utils/comm";
import { useI18n } from "vue-i18n";
import {
  EditTable,
  EditTableFormItem,
} from "../../../../../components/Metadata";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";

const { t: $t } = useI18n();

const emits = defineEmits(["refresh"]);
const formRef = ref();
const useForm = Form.useForm;
const props = defineProps({
  formData: {
    type: Object as PropType<Record<string, any>>,
    default: () => {},
  },
  title: {
    type: String,
    defult: "",
  },
  isAdd: {
    type: Number,
    default: 0,
  },
  isChild: {
    type: Number,
    default: 0,
  },
});
interface formState {
  name: string;
  sortIndex: number;
  description: string;
  metadata?: any[]; // 元数据字段
}

const listData = ref([]);
const childArr = ref([]);
const arr = ref([]);
const updateObj = ref({});
const addObj = ref({});
const addParams = ref({});
const loading = ref(false);
const activeTab = ref('tab1');

// 枚举编辑相关
const enumModalVisible = ref(false);
const enumLoading = ref(false);
const currentEnumField = ref(null);
const currentEnumIndex = ref(-1);
const currentEnumData = ref([]);

// 元数据相关
const metadataList = ref([]);
const metadataColumns = ref([
  {
    title: '参数标识',
    dataIndex: 'id',
    key: 'id',
    width: 150,
    form: {
      required: true,
      rules: [{
        required: true,
        message: '请输入参数标识'
      }]
    }
  },
  {
    title: '参数名称',
    dataIndex: 'name', 
    key: 'name',
    width: 150,
    form: {
      required: true,
      rules: [{
        required: true,
        message: '请输入参数名称'
      }]
    }
  },
  {
    title: '填写约束',
    dataIndex: 'expands',
    key: 'expands', 
    width: 120
  },
  {
    title: '数据类型',
    dataIndex: 'valueType',
    key: 'valueType',
    width: 150,
    form: {
      required: true,
      rules: [{
        required: true,
        message: '请选择数据类型'
      }]
    }
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    width: 100,
    fixed: 'right'
  }
]);
/**
 * 表单数据
 */
const formModel = ref<formState>({
  name: "",
  sortIndex: 1,
  description: "",
  metadata: [],
});
const rules = ref({
  name: [
    {
      required: true,
      message: $t("modifyModal.index.177674-3"),
    },
    {
      max: 64,
      message: $t("modifyModal.index.177674-8"),
    },
  ],
  sortIndex: [
    {
      required: true,
      message: $t("modifyModal.index.177674-5"),
    },
  ],
});
const visible = ref(false);
const { resetFields, validate, validateInfos } = useForm(
  formModel.value,
  rules.value,
);
/**
 * 提交数据
 */
const submitData = async () => {
  formRef.value.validate().then(async () => {
    loading.value = true;
    addParams.value = {};
    
    // 处理元数据序列化
    const processedMetadata = metadataList.value.map(item => ({
      id: item.id,
      name: item.name,
      valueType: {
        type: item.valueType?.type || 'string',
        elements: item.valueType?.type === 'enum' ? (item.enumData || []) : undefined
      },
      expands: {
        required: item.expands?.required || false
      }
    }));

    console.log(processedMetadata)
    const formDataWithMetadata = {
      ...formModel.value,
      metadata: JSON.stringify(processedMetadata)
    };

    console.log(formDataWithMetadata)
    if (props.isAdd === 0) {
      if (props.isChild === 1) {
        addParams.value = {
          ...formDataWithMetadata,
          // sortIndex:
          //     childArr.value[childArr.value.length - 1].sortIndex + 1,
          parentId: addObj.value.id,
        };
      } else if (props.isChild === 2) {
        addParams.value = {
          parentId: addObj.value.id,
          ...formDataWithMetadata,
          // sortIndex: 1,
        };
      } else if (props.isChild === 3) {
        addParams.value = {
          ...formDataWithMetadata,
          // sortIndex: arr.value[arr.value.length - 1].sortIndex + 1,
        };
      }
      const res = await saveTree(addParams.value).finally(() => {
        loading.value = false;
      });
      if (res.status === 200) {
        onlyMessage($t("modifyModal.index.177674-10"));
        visible.value = false;
        emits("refresh");
      } else {
        onlyMessage($t("modifyModal.index.177674-11"), "error");
      }
    } else if (props.isAdd === 2) {
      const id = updateObj.value.id;
      const updateParams = {
        ...formDataWithMetadata,
        id: updateObj.value.id,
        key: updateObj.value.key,
        parentId: updateObj.value.parentId,
      };
      const res = await updateTree(id, updateParams).finally(() => {
        loading.value = false;
      });
      if (res.status === 200) {
        onlyMessage($t("modifyModal.index.177674-10"));
        visible.value = false;
        emits("refresh");
      } else {
        onlyMessage($t("modifyModal.index.177674-11"), "error");
      }
    }
  });
};
/**
 * 显示弹窗
 */
const show = async (row: any) => {
  //新增
  if (props.isAdd === 0) {
    if (props.isChild === 1) {
      addObj.value = row;
      if (row.children && row.children.length > 0) {
        childArr.value = row.children.sort(compare("sortIndex"));
        formModel.value = {
          name: "",
          sortIndex:
            childArr.value[childArr.value.length - 1].sortIndex === 9999
              ? childArr.value[childArr.value.length - 1].sortIndex
              : childArr.value[childArr.value.length - 1].sortIndex + 1,
          description: "",
          metadata: [],
        };
        visible.value = true;
      }
    } else if (props.isChild === 3) {
      const res = await getTableData();
      arr.value = listData.value.sort(compare("sortIndex"));
      if (arr.value.length > 0) {
        formModel.value = {
          name: "",
          sortIndex:
            arr.value[arr.value.length - 1].sortIndex === 9999
              ? arr.value[arr.value.length - 1].sortIndex
              : arr.value[arr.value.length - 1].sortIndex + 1,
          description: "",
          metadata: [],
        };
      }
      visible.value = true;
    } else if (props.isChild === 2) {
      if (row.level === 5) {
        onlyMessage($t("modifyModal.index.177674-12"), "warning");
        visible.value = false;
      } else {
        addObj.value = row;
        formModel.value = {
          name: "",
          sortIndex: 1,
          description: "",
          metadata: [],
        };
        visible.value = true;
      }
    }
  } else if (props.isAdd === 2) {
    updateObj.value = row;
    // 编辑
    const parsedMetadata = row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : [];
    formModel.value = {
      name: row.name,
      sortIndex: row.sortIndex,
      description: row.description,
      metadata: parsedMetadata, // 加载已有的元数据
    };
    
    // 立即同步到 metadataList，确保枚举数据正确映射
    metadataList.value = parsedMetadata.map((item, index) => {
      const enumData = item.enumData || item.valueType?.elements || [];
      return {
        ...item,
        enumData: enumData,
        valueType: {
          type: item.valueType?.type || 'string',
          elements: item.valueType?.type === 'enum' ? enumData : undefined
        },
        expands: {
          required: item.expands?.required || false,
          isProduct: item.expands?.isProduct || false
        },
        __dataIndex: index,
        __key: `${item.id}_${Date.now()}_${index}`
      };
    });
    
    visible.value = true;
  }
  
};

/**
 * 排序
 */
const compare = (property: any) => {
  return function (obj1: any, obj2: any) {
    const value1 = obj1[property];
    const value2 = obj2[property];
    return value1 - value2; // 升序
  };
};

/**
 * 获取列表数据
 */
const getTableData = async () => {
  const params = {
    paging: false,
    sorts: [
      { name: "sortIndex", order: "asc" },
      {
        name: "createTime",
        order: "desc",
      },
    ],
  };
  const res = await queryTree(params);
  if (res.status === 200) {
    listData.value = res.result;
  }
};

/**
 * 弹窗布局配置
 */
const layout = computed(() => {
  return {
    width: '1000px',
  };
});

/**
 * 关闭弹窗
 */
const close = () => {
  visible.value = false;
  resetFields();
  metadataList.value = [];
  formModel.value.metadata = [];
  activeTab.value = 'tab1';
  closeEnumModal();
};

/**
 * 元数据变更
 */
const metadataChange = () => {
  // 处理元数据变更
};

/**
 * 元数据编辑变更
 */
const onMetadataEdit = () => {
  // 处理编辑状态变更
};

/**
 * 添加元数据项
 */
const addMetadataItem = () => {
  const newItem = {
    id: '',
    name: '',
    required: false,
    dataType: 'string',
    enumData: [], // 枚举数据
    expands: {
      required: false
    },
    valueType: {
      type: 'string'
    },
    __dataIndex: metadataList.value.length,
    __key: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  };
  metadataList.value.push(newItem);
  
  // 聚焦到新添加的行
  // nextTick(() => {
  //   if (tableRef.value) {
  //     tableRef.value.scrollToByIndex(metadataList.value.length - 1);
  //   }
  // });
};

/**
 * 编辑元数据项
 */
const editMetadataItem = (record, index) => {
  // 处理编辑逻辑
};

/**
 * 删除元数据项
 */
const deleteMetadataItem = (index) => {
  metadataList.value.splice(index, 1);
  // 重新设置 __dataIndex
  metadataList.value.forEach((item, idx) => {
    item.__dataIndex = idx;
  });
};

/**
 * 编辑枚举数据
 */
const editEnumData = (record, index) => {
  
  currentEnumField.value = record;
  currentEnumIndex.value = index;
  
  // 初始化枚举数据 - 优先使用 valueType.elements，其次使用 enumData
  let enumElements = [];
  if (record.valueType?.elements && Array.isArray(record.valueType.elements)) {
    enumElements = [...record.valueType.elements];
  } else if (record.enumData && Array.isArray(record.enumData)) {
    enumElements = [...record.enumData];
  } else {
    enumElements = [];
  }
  
  currentEnumData.value = enumElements;
  enumModalVisible.value = true;
};

/**
 * 添加枚举项
 */
const addEnumItem = () => {
  currentEnumData.value.push({
    value: '',
    text: ''
  });
};

/**
 * 删除枚举项
 */
const removeEnumItem = (index) => {
  currentEnumData.value.splice(index, 1);
};

/**
 * 保存枚举数据
 */
const saveEnumData = async () => {
  enumLoading.value = true;
  
  try {
    // 过滤空值
    const validEnumData = currentEnumData.value.filter(item => 
      item.value.trim() !== '' && item.text.trim() !== ''
    );
    
    // 更新元数据列表中的枚举数据，watcher 会自动同步到 formModel.value.metadata
    if (currentEnumIndex.value >= 0 && metadataList.value[currentEnumIndex.value]) {
      metadataList.value[currentEnumIndex.value].enumData = validEnumData;
      // 同时更新 valueType.elements 用于后端序列化
      if (!metadataList.value[currentEnumIndex.value].valueType) {
        metadataList.value[currentEnumIndex.value].valueType = { type: 'enum' };
      }
      metadataList.value[currentEnumIndex.value].valueType.elements = validEnumData;
    }
    
    enumModalVisible.value = false;
    onlyMessage('枚举数据保存成功');
  } catch (error) {
    onlyMessage('保存失败', 'error');
  } finally {
    enumLoading.value = false;
  }
};

/**
 * 关闭枚举编辑弹窗
 */
const closeEnumModal = () => {
  enumModalVisible.value = false;
  currentEnumField.value = null;
  currentEnumIndex.value = -1;
  currentEnumData.value = [];
  enumLoading.value = false;
};

// 元数据双向绑定 - metadataList 变化同步到 formModel.value.metadata
watch(
  () => metadataList.value,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      formModel.value.metadata = newVal.map(item => ({
        id: item.id,
        name: item.name,
        valueType: {
          type: item.valueType?.type || 'string',
          elements: item.valueType?.type === 'enum' ? (item.enumData || item.valueType?.elements || []) : undefined
        },
        expands: {
          required: item.expands?.required || false
        },
        enumData: item.enumData || []
      }));
    }
  },
  { deep: true, immediate: false }
);

watch(
  () => formModel.value.metadata,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      metadataList.value = newVal.map((item, index) => {
        // 确保枚举数据正确映射
        const enumData = item.enumData || item.valueType?.elements || [];
        return {
          ...item,
          enumData: enumData,
          valueType: {
            type: item.valueType?.type || 'string',
            elements: item.valueType?.type === 'enum' ? enumData : undefined
          },
          expands: {
            required: item.expands?.required || false,
            isProduct: item.expands?.isProduct || false
          },
          __dataIndex: index,
          __key: `${item.id}_${Date.now()}_${index}`
        };
      });
    }
  },
  { deep: true }
);

//监听项目ID
watch([() => props.isAdd], () => {}, { immediate: false, deep: true });
defineExpose({
  show: show,
});
</script>

<style scoped>
.ant-table-tbody .ant-table-cell {
  padding: 8px 12px;
}

.ant-table-tbody .ant-table-cell .ant-input,
.ant-table-tbody .ant-table-cell .ant-select {
  border: none;
  box-shadow: none;
  background: transparent;
}

.ant-table-tbody .ant-table-cell .ant-input:hover,
.ant-table-tbody .ant-table-cell .ant-select:hover {
  border-color: #d9d9d9;
}

.ant-table-tbody .ant-table-cell .ant-input:focus,
.ant-table-tbody .ant-table-cell .ant-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.ant-table-tbody .ant-table-cell .ant-input[status="error"],
.ant-table-tbody .ant-table-cell .ant-select[status="error"] {
  border-color: #ff4d4f;
}

.ant-table-tbody .ant-table-cell .ant-input[status="error"]:focus,
.ant-table-tbody .ant-table-cell .ant-select[status="error"]:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.ant-btn[disabled] .anticon {
  opacity: 0.3;
}

.table-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.table-actions .ant-btn {
  padding: 0;
  width: auto;
  height: auto;
  border: none;
}

.metadata-add-row {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #d9d9d9;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.add-row-btn {
  height: 36px;
  border: 1px dashed #d9d9d9;
  background: #fff;
  color: #666;
  transition: all 0.2s;
}

.add-row-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.add-row-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 枚举编辑弹窗样式 */
.enum-edit-container {
  max-height: 400px;
}

.enum-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.enum-list-header span {
  font-weight: 500;
  color: #262626;
}

.enum-items-container {
  max-height: 300px;
  overflow-y: auto;
}

.enum-item-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.enum-item-inputs {
  display: flex;
  flex: 1;
  align-items: center;
}

.enum-empty {
  text-align: center;
  padding: 32px;
  color: #999;
}

.datatype-container {
  display: flex;
  flex: 1;
  width: 100%;
  gap: 4px;
}

.enum-edit-btn {
  width: 32px;
  height: 32px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enum-edit-btn:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
