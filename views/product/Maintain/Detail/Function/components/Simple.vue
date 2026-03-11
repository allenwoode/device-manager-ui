<template>
    <div class="simple-wrapper">
        <div class="tips">
            <a-space>
                <AIcon type="QuestionCircleOutlined" />
                <span>{{ $t('components.Simple.448047-0') }}</span>
            </a-space>
        </div>
        <a-tabs
            v-model="activeKey"
            tab-position="left"
            @change="onTabChange"
            :destroyInactiveTabPane="true"
        >
            <a-tab-pane v-for="func in newFunctions" :key="func.id">
                <template #tab>
                    <a-tooltip>
                        <template #title>
                            {{ func.name }}
                        </template>
                        <div style="max-width: 150px" class="tabTitle">
                            {{ func.name }}
                        </div>
                    </a-tooltip>
                </template>
                <a-row :gutter="30">
                    <a-col :span="15">
                        <a-form :ref="(el) => setRefMap(el, func)" :model="func">
                            <a-table
                                :columns="tableColumns"
                                :data-source="func.table"
                                :pagination="false"
                                rowKey="id"
                                class="function-table"
                            >
                                <template #bodyCell="{ column, record, index }">
                                    <template v-if="column.dataIndex === 'name'">
                                        <div class="param-name-cell">
                                            <span class="param-name">{{ record.name }}</span>
                                            <a-tooltip
                                                v-if="['object', 'array'].includes(record.type)"
                                            >
                                                <template #title>
                                                    {{ $t('components.Simple.448047-1') }}
                                                </template>
                                                <AIcon
                                                    type="QuestionCircleOutlined"
                                                    class="param-help-icon"
                                                />
                                            </a-tooltip>
                                        </div>
                                    </template>
                                    <template v-if="column.dataIndex === 'value'">
                                        <a-form-item
                                            :name="['table', index, 'value']"
                                            :rules="{
                                                required: record.required,
                                                message: $t('components.Simple.448047-2'),
                                            }"
                                            class="table-form-item"
                                        >
                                            <SelectAMap
                                                v-if="record.type === 'geoPoint'"
                                                v-model:point="record.value"
                                            />
                                            <!-- Enum type with inline radio buttons -->
                                            <a-radio-group
                                                v-else-if="record.type === 'enum' && record.options && record.options.length <= 4"
                                                v-model:value="record.value"
                                                class="inline-radio-group"
                                            >
                                                <a-radio 
                                                    v-for="option in record.options"
                                                    :key="option.value"
                                                    :value="option.value"
                                                >
                                                    {{ option.text }}
                                                </a-radio>
                                            </a-radio-group>
                                            <!-- Number types with number input -->
                                            <a-input-number
                                                v-else-if="['int', 'long', 'float', 'double'].includes(record.type)"
                                                v-model:value="record.value"
                                                :precision="['float', 'double'].includes(record.type) ? 2 : 0"
                                                :step="['float', 'double'].includes(record.type) ? 0.01 : 1"
                                                style="width: 100%"
                                                placeholder="请输入数值"
                                            />
                                            <!-- Boolean type with switch -->
                                            <a-switch
                                                v-else-if="record.type === 'boolean'"
                                                v-model:checked="record.value"
                                                :checked-children="record.options?.[1]?.text || 'True'"
                                                :un-checked-children="record.options?.[0]?.text || 'False'"
                                            />
                                            <j-value-item
                                                v-else
                                                :ref="`valueItemRef${record.id}`"
                                                v-model:modelValue="record.value"
                                                :itemType="record.type === 'array' ? 'object' : (record.type === 'file' ? 'string' : record.type)"
                                                :options="
                                                    (record?.options || []).map((item:any) => ({
                                                        label: item.text,
                                                        value: item.value,
                                                    }))
                                                "
                                                :extraProps="{
                                                      style: {
                                                        zIndex: 999,
                                                        width: '100%'
                                                      }
                                                }"
                                            />
                                        </a-form-item>
                                    </template>
                                </template>
                            </a-table>
                        </a-form>
                        <div class="editor-btn">
                            <a-space>
                                <j-permission-button
                                    type="primary"
                                    :loading="loading"
                                    @click="handleExecute(func)"
                                    hasPermission="product/Maintain:execute"
                                >
                                    {{ $t('components.Simple.448047-3') }}
                                </j-permission-button>
                                <a-button
                                    type="default"
                                    @click="handleClear(func)"
                                >
                                    {{ $t('components.Simple.448047-4') }}
                                </a-button>
                            </a-space>
                        </div>
                    </a-col>
                    <a-col :span="9">
                        <h4>{{ $t('components.Simple.448047-5') }}</h4>
                        <span
                            :ref="`result${func.id}Ref`"
                            class="execute-result"
                        >
                            {{ executeResult || '' }}
                        </span>
                    </a-col>
                </a-row>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { useInstanceStore } from '../../../../../../store/instance';
import { execute } from '../../../../../../api/instance';
import { onlyMessage } from '@jetlinks-web/utils';
import { isNil } from "lodash-es";
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const instanceStore = useInstanceStore();
const route = useRoute();

const activeKey = ref('');
const loading = ref<boolean>(false);
// 物模型数据
const metadata = computed(() => JSON.parse(instanceStore.detail.metadata));
// Table columns without type column as per prototype
const tableColumns = ref([
    {
        title: $t('components.Simple.448047-6'), // 参数名称
        dataIndex: 'name',
        width: 150,
        ellipsis: true,
    },
    {
        title: $t('components.Simple.448047-8'), // 值
        dataIndex: 'value',
    },
]);

const executeResult = ref('');
const RefMap = {}

const newFunctions = computed({
    get() {
        const result: any = [];
        metadata.value.functions?.forEach((func: any) => {
            const array = [];
            const tableData = func.inputs || func.properties;
            for (const tableItem of tableData) {
                const type = tableItem.valueType ? tableItem.valueType.type : '-';
                if (type === 'boolean') {
                    tableItem.valueType.elements = [
                        {
                            text: tableItem.valueType.trueText,
                            value: String(tableItem.valueType.trueValue),
                        },
                        {
                            text: tableItem.valueType.falseText,
                            value: String(tableItem.valueType.falseValue),
                        },
                    ];
                }
                array.push({
                    id: tableItem.id,
                    name: tableItem.name,
                    type: type,
                    format: tableItem.valueType
                        ? tableItem.valueType.format
                        : undefined,
                    options: tableItem.valueType
                        ? tableItem.valueType.elements
                        : undefined,
                    json:
                        type === 'object'
                            ? tableItem['json']?.['properties'][0]
                            : undefined,
                    value: undefined,
                    required: tableItem.expands?.required,
                });
            }

            result.push({
                ...func,
                table: array,
                executeResult: '',
            });
        });
        // console.log('newFunctions: ', result);
        return result;
    },
    set(e) {
        return e
    }
})

// 设备功能数据处理
// const newFunctions = computed(() => {
//     const result: any = [];
//     metadata.value.functions?.forEach((func: any) => {
//         const array = [];
//         const tableData = func.inputs || func.properties;
//         for (const tableItem of tableData) {
//             const type = tableItem.valueType ? tableItem.valueType.type : '-';
//             if (type === 'boolean') {
//                 tableItem.valueType.elements = [
//                     {
//                         text: tableItem.valueType.trueText,
//                         value: String(tableItem.valueType.trueValue),
//                     },
//                     {
//                         text: tableItem.valueType.falseText,
//                         value: String(tableItem.valueType.falseValue),
//                     },monacoEditor 页面无法滚动
//                 ];
//             }
//             array.push({
//                 id: tableItem.id,
//                 name: tableItem.name,
//                 type: type,
//                 format: tableItem.valueType
//                     ? tableItem.valueType.format
//                     : undefined,
//                 options: tableItem.valueType
//                     ? tableItem.valueType.elements
//                     : undefined,
//                 json:
//                     type === 'object'
//                         ? tableItem['json']?.['properties'][0]
//                         : undefined,
//                 value: undefined,
//                 required: tableItem.expands?.required,
//             });
//         }
//
//         result.push({
//             ...func,
//             table: array,
//             executeResult: '',
//         });
//     });
//     // console.log('newFunctions: ', result);
//     return result;
// });

/**
 * 执行
 */
const handleExecute = async (func: any) => {
    RefMap[func.id]
        .validate()
        .then(async () => {
        const obj = {};
        func.table.forEach((item: any) => {
                if (item.type === 'object' && item.value) {
                        obj[item.id] = JSON.parse(item.value);
                } else if (!isNil(item.value)) {
                    obj[item.id] = item.value;
                }
        });
        
        loading.value = true;
        const { success, result } = await execute(
            route.params.id as string,
            func.id,
            obj,
            )
                .catch(() => {
                    loading.value = false;
                })
                .finally(() => {
                    loading.value = false;
                });
        if (!success) return;
        onlyMessage($t('components.Simple.448047-9'));
        executeResult.value = result instanceof Array ? result[0] : result;
        RefMap[func.id]?.$forceUpdate();
        })
        .catch((err: any) => {
            console.log('err: ', err);
        });

};

/**
 * 清空
 */
const handleClear = (func: any) => {
    newFunctions.value = newFunctions.value.map(item => {
        if (item.id === func.id) {
            item.table = item.table.map(tItem => {
                tItem.value = undefined
                return tItem
            })
        }
        return item
    })

    executeResult.value = '';
    RefMap[func.id]?.resetFields()
};

const onTabChange = (_key: string) => {
    executeResult.value = '';
};

const getPopupContainer = () => {
    return document.body
}

const setRefMap = (el, item) => {
    RefMap[item.id] = el
}

// Helper function to determine when to show type hints
const showTypeHint = (type: string) => {
    // Show type hint for complex types that might need clarification
    return ['object', 'array', 'geoPoint', 'file'].includes(type);
}

</script>

<style lang="less" scoped>
.simple-wrapper {
    .tips {
        margin-bottom: 16px;
        padding: 12px 16px;
        background-color: #f6f8fa;
        border-radius: 6px;
        color: #586069;
        font-size: 14px;
        
        .anticon {
            color: #1890ff;
            margin-right: 8px;
        }
    }
    
    .function-table {
        margin-bottom: 16px;
        
        .param-name-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .param-name {
                font-weight: 500;
                color: #262626;
            }
            
            .param-help-icon {
                color: #1890ff;
                cursor: help;
                font-size: 14px;
            }
        }
        
        .table-form-item {
            margin-bottom: 0;
            
            // Inline radio group styling
            .inline-radio-group {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                
                .ant-radio-wrapper {
                    margin-right: 0;
                    white-space: nowrap;
                }
            }
        }
    }
    
    .editor-btn {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
        
        .ant-btn {
            height: 36px;
            border-radius: 6px;
            font-weight: 500;
            
            &.ant-btn-primary {
                background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
                border: none;
                box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
                
                &:hover {
                    background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
                    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
                }
            }
        }
    }
    
    .execute-result {
        display: inline-block;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        padding: 12px 16px;
        min-height: 140px;
        width: 100%;
        max-height: 450px;
        overflow: auto;
        background-color: #fafafa;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
    }
}

.tabTitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

// Table and form styling
:deep(.ant-table-cell .ant-form-item) {
    margin-bottom: 0;
}

:deep(.ant-form-item-with-help .ant-form-item-explain) {
    min-height: 0;
}

:deep(.ant-input-number) {
    width: 100%;
}

:deep(.ant-switch) {
    &.ant-switch-checked {
        background-color: #1890ff;
    }
}

// Enhanced table styling
:deep(.function-table) {
    .ant-table-thead > tr > th {
        background-color: #fafafa;
        border-bottom: 2px solid #f0f0f0;
        font-weight: 600;
        color: #262626;
    }
    
    .ant-table-tbody > tr > td {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        
        &:first-child {
            font-weight: 500;
        }
    }
    
    .ant-table-tbody > tr:hover > td {
        background-color: #f8f9fa;
    }
}
</style>
