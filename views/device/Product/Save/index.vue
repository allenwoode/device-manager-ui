<!-- 新增、编辑产品 -->
<template>
    <a-modal 
        :title="props.title" 
        :maskClosable="false" 
        destroy-on-close 
        v-model:visible="visible" 
        @ok="submitData"
        @cancel="close" 
        :okText="$t('Save.index.912481-0')" 
        :cancelText="$t('Save.index.912481-1')" 
        width="650px"
        :confirmLoading="loading">
        <div style="margin-top: 10px">
            <a-form layout="vertical" :model="form" :rules="rules" ref="formRef">
                <a-row type="flex">
                    <a-col flex="180px">
                        <a-form-item name="photoUrl">
                            <pro-upload v-model="form.photoUrl" :accept="imageTypes && imageTypes.length
                                    ? imageTypes.toString()
                                    : ''
                                " />
                        </a-form-item>
                    </a-col>
                    <a-col flex="auto">
                        <a-form-item name="id" :validateFirst="true">
                            <template #label>
                                <span>ID</span>
                                <a-tooltip :title="$t('Save.index.912481-2')">
                                    <AIcon type="QuestionCircleOutlined" style="margin-left: 2px" />
                                </a-tooltip>
                            </template>
                            <a-input v-model:value="form.id" :placeholder="$t('Save.index.912481-3')"
                                :disabled="idDisabled" />
                        </a-form-item>
                        <a-form-item :label="$t('Save.index.912481-4')" name="name">
                            <a-input v-model:value="form.name" :placeholder="$t('Save.index.912481-5')" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-form-item :label="$t('Save.index.912481-6')" name="classifiedId">
                    <a-tree-select showSearch v-model:value="form.classifiedId" :placeholder="$t('Save.index.912481-7')"
                        :tree-data="treeList" @change="valueChange" allow-clear :fieldNames="{
                            label: 'name',
                            value: 'id',
                            children: 'children',
                        }" 
                        :filterTreeNode="(v, option) => filterSelectNode(v, option, 'name')">
                        <template></template>
                    </a-tree-select>
                    <!-- 动态表单 -->
                    <div v-if="selectedItemMetadata && metadataProperties && Object.keys(metadataProperties).length > 0" style="margin-top: 16px;">
                        <a-divider style="margin: 12px 0 12px 0;">
                            <span style="font-size: 12px; color: #666;">元数据配置</span>
                        </a-divider>
                        <a-form layout="vertical" ref="metadataFormRef" :model="metadataForm">
                            <template v-for="(property, key) in metadataProperties" :key="`metadata-${key}`">
                                <a-form-item :name="String(key)" :rules="getFieldRules(property)" style="margin-bottom: 10px;">
                                    <template #label>
                                        <span>{{ property.name || property.id }}</span>
                                    </template>
                                    <!-- 枚举类型 -->
                                    <a-select
                                        v-if="property?.valueType?.type === 'enum' && property?.valueType?.elements"
                                        v-model:value="metadataForm[key]" :placeholder="`请选择${property.name || key}`"
                                        allow-clear>
                                        <a-select-option v-for="item in property.valueType.elements"
                                            :key="item?.value || Math.random()" :value="item.value">
                                            {{ item.text }}
                                        </a-select-option>
                                    </a-select>

                                    <!-- 布尔类型 -->
                                    <a-radio-group v-else-if="property?.valueType?.type === 'boolean'"
                                        v-model:value="metadataForm[key]">
                                        <a-radio :value="true">是</a-radio>
                                        <a-radio :value="false">否</a-radio>
                                    </a-radio-group>

                                    <!-- 数字类型 -->
                                    <a-input-number
                                        v-else-if="property?.valueType?.type && ['int', 'long', 'float', 'double'].includes(property.valueType.type)"
                                        v-model:value="metadataForm[key]" :placeholder="`请输入${property.name || key}`"
                                        style="width: 100%"
                                        :precision="property.valueType?.type === 'int' || property.valueType?.type === 'long' ? 0 : 2" />

                                    <!-- 日期类型 -->
                                    <a-date-picker v-else-if="property?.valueType?.type === 'date'"
                                        v-model:value="metadataForm[key]" :placeholder="`请选择${property.name || key}`"
                                        style="width: 100%" />

                                    <!-- 对象/数组类型 -->
                                    <a-textarea
                                        v-else-if="property?.valueType?.type && ['object', 'array'].includes(property.valueType.type)"
                                        v-model:value="metadataForm[key]"
                                        :placeholder="`请输入JSON格式的${property.name || key}`"
                                        :auto-size="{ minRows: 3, maxRows: 6 }" @blur="validateJSON(key)" />

                                    <!-- 默认文本类型 -->
                                    <a-input v-else v-model:value="metadataForm[key]"
                                        :placeholder="`请输入${property.name || key}`" />

                                </a-form-item>
                            </template>
                        </a-form>
                    </div>
                </a-form-item>
                <a-form-item :label="$t('Save.index.912481-8')" name="deviceType">
                    <j-card-select v-model:value="form.deviceType" :options="deviceList"
                        :disabled="productStore.detail?.accessId ? true : false" @change="changeDeviceType">
                        <template #itemRender="{ node }">
                            <div class="select-item">
                                <div>
                                    <span>{{ node.label }}</span>
                                    <a-tooltip :title="node.tooltip">
                                        <AIcon type="QuestionCircleOutlined" style="margin-left: 2px" />
                                    </a-tooltip>
                                </div>
                                <img :src="node.iconUrl" alt="">
                            </div>
                        </template>
                    </j-card-select>
                </a-form-item>
                <a-form-item :label="$t('Save.index.912481-9')" name="description">
                    <a-textarea :maxlength="200" showCount :auto-size="{ minRows: 4, maxRows: 5 }"
                        v-model:value="form.describe" :placeholder="$t('Save.index.912481-10')" />
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
    <DialogTips ref="dialogRef" />
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { category, queryProductId, addProduct, editProduct } from '../../../../api/product';
import { Form } from 'ant-design-vue';
import DialogTips from '../DialogTips/index.vue';
import { useProductStore } from '../../../../store/product';
import { filterSelectNode, encodeQuery } from '@/utils';
import { onlyMessage } from '@jetlinks-web/utils'
import { isInput } from '@device/utils/utils';
import type { Rule } from 'ant-design-vue/es/form';
import { device } from '../../../../assets';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const productStore = useProductStore();
const emit = defineEmits(['success']);

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    isAdd: {
        type: Number,
        default: 0,
    },
});
const loading = ref<boolean>(false);
const dialogRef = ref();
const treeList = ref<Record<string, any>[]>([]);
const visible = ref<boolean>(false);
const formRef = ref();
const metadataFormRef = ref();
const idDisabled = ref<boolean>(false);
const selectedItemMetadata = ref<any>(null);
const metadataForm = reactive<Record<string, any>>({});

// 计算属性，确保响应式
const metadataProperties = computed(() => {
    return getMetadataProperties();
});
const useForm = Form.useForm;
const photoValue = ref(device.deviceProduct);
const imageTypes = reactive([
    'image/jpeg',
    'image/png',
    // 'image/jpg',
    'image/jfif',
    'image/pjp',
    // 'image/pjpeg',
]);
const deviceList = ref([
    {
        label: $t('Save.index.912481-11'),
        value: 'device',
        iconUrl: device.deviceType1,
        tooltip: $t('Save.index.912481-12'),
    },
    {
        label: $t('Save.index.912481-13'),
        value: 'childrenDevice',
        iconUrl: device.deviceType2,
        tooltip: $t('Save.index.912481-14'),
    },
    {
        label: $t('Save.index.912481-15'),
        value: 'gateway',
        iconUrl: device.deviceType3,
        tooltip: $t('Save.index.912481-16'),
    },
]);

const form = reactive({
    id: undefined,
    name: '',
    classifiedId: undefined,
    classifiedName: '',
    deviceType: '',
    describe: undefined,
    photoUrl: device.deviceProduct,
});
/**
 * 校验id
 */
const validateInput = async (_rule: Rule, value: string) => {
    if (value) {
        if (!isInput(value)) {
            return Promise.reject($t('Save.index.912481-17'));
        } else {
            if (props.isAdd === 1) {
                const res = await queryProductId(value);
                if (res.success && res.result) {
                    return Promise.reject($t('Save.index.912481-18'));
                } else {
                    return Promise.resolve();
                }
            }
        }
    } else {
        return Promise.resolve();
    }
};
/**
 * 校验是否选择设备类型
 */
const validateDeviceType = async (_rule: Rule, value: string) => {
    if (!value) {
        return Promise.reject($t('Save.index.912481-19'));
    } else {
        return Promise.resolve();
    }
};
const rules = reactive({
    id: [
        { validator: validateInput, trigger: 'blur' },
        { max: 64, message: $t('Save.index.912481-20'), trigger: 'change' },
    ],
    name: [
        { required: true, message: $t('Save.index.912481-5'), trigger: 'blur' },
        { max: 64, message: $t('Save.index.912481-20'), trigger: 'change' },
    ],
    deviceType: [
        {
            required: true,
            validator: validateDeviceType,
            trigger: 'blur',
        },
    ],
    description: [
        { max: 200, message: $t('Save.index.912481-21'), trigger: 'blur' },
    ],
});

const valueChange = (value: string, label: string) => {
    form.classifiedName = label[0];

    // 查找选中项的metadata
    const findItemById = (items: any[], id: string): any => {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findItemById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    if (value) {
        const selectedItem = findItemById(treeList.value, value);
        selectedItemMetadata.value = selectedItem?.metadata || null;

        // 初始化metadata表单
        initMetadataForm();
    } else {
        selectedItemMetadata.value = null;
        // 清空metadata表单
        Object.keys(metadataForm).forEach(key => {
            delete metadataForm[key];
        });
    }
};

/**
 * 获取字段验证规则
 */
const getFieldRules = (property: any) => {
    if (!property || typeof property !== 'object') return [];

    const rules: any[] = [];

    // 必填验证
    if (property.expands?.required === true || property.required === true) {
        rules.push({
            required: true,
            message: `请输入${property.name || '该字段'}`,
            trigger: 'blur'
        });
    }

    // 根据类型添加特定验证
    const valueType = property.valueType?.type;

    if (['object', 'array'].includes(valueType)) {
        // JSON格式验证
        rules.push({
            validator: async (_rule: any, value: string) => {
                if (value && typeof value === 'string' && value.trim()) {
                    try {
                        JSON.parse(value);
                        return Promise.resolve();
                    } catch (e) {
                        return Promise.reject(`请输入正确的JSON格式`);
                    }
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        });
    } else if (['int', 'long', 'float', 'double'].includes(valueType)) {
        // 数字类型验证
        rules.push({
            type: 'number',
            message: `请输入正确的数字`,
            trigger: 'blur'
        });
    }

    return rules;
};

/**
 * 获取metadata的properties，兼容不同的数据结构
 */
const getMetadataProperties = () => {
    try {
        if (!selectedItemMetadata.value) return null;

        // 安全地解析JSON
        if (typeof selectedItemMetadata.value === 'string') {
            const parsed = JSON.parse(selectedItemMetadata.value);
            return parsed && typeof parsed === 'object' ? parsed : null;
        }

        // 如果已经是对象，直接返回
        if (typeof selectedItemMetadata.value === 'object' && selectedItemMetadata.value !== null) {
            return selectedItemMetadata.value;
        }

        return null;
    } catch (error) {
        console.warn('Failed to parse metadata:', error);
        return null;
    }
};

/**
 * 验证JSON格式
 */
const validateJSON = (key: string) => {
    const value = metadataForm[key];
    if (value && typeof value === 'string') {
        try {
            JSON.parse(value);
        } catch (e) {
            onlyMessage(`${key} 字段的JSON格式不正确`, 'error');
        }
    }
};

/**
 * 初始化metadata表单
 */
const initMetadataForm = (existingData?: Record<string, any>) => {
    // 清空现有数据，使用Vue 3的响应式方式
    Object.keys(metadataForm).forEach(key => {
        metadataForm[key] = undefined;
    });

    // 根据metadata的properties初始化表单字段
    const properties = getMetadataProperties();
    if (properties) {
        Object.keys(properties).forEach(key => {
            const property = properties[key];
            const valueType = property.valueType?.type;

            // 如果有现有数据，优先使用现有数据
            if (existingData && existingData.hasOwnProperty(key)) {
                // 对于对象和数组类型，需要转换为JSON字符串
                if (['object', 'array'].includes(valueType) && typeof existingData[key] === 'object') {
                    metadataForm[key] = JSON.stringify(existingData[key], null, 2);
                } else {
                    metadataForm[key] = existingData[key];
                }
                return;
            }

            // 根据不同类型设置默认值
            switch (valueType) {
                case 'boolean':
                    metadataForm[key] = false;
                    break;
                case 'int':
                case 'long':
                case 'float':
                case 'double':
                    metadataForm[key] = undefined;
                    break;
                case 'enum':
                    metadataForm[key] = undefined;
                    break;
                case 'date':
                    metadataForm[key] = undefined;
                    break;
                case 'object':
                case 'array':
                    metadataForm[key] = '';
                    break;
                default:
                    metadataForm[key] = '';
                    break;
            }
        });
    }
};

/**
 * 查询产品分类
 */
const queryProductTree = async () => {
    category(encodeQuery({ sorts: { sortIndex: 'asc' } })).then((resp) => {
        if (resp.status === 200) {
            treeList.value = resp.result;
            treeList.value = dealProductTree(treeList.value);
        }
    });
};
/**
 * 处理产品分类key
 */
const dealProductTree = (arr: any) => {
    return arr.map((element: any) => {
        element.key = element.id;
        if (element.children) {
            element.children = dealProductTree(element.children);
        }
        return element;
    });
};
/**
 * 显示弹窗
 */
const show = (data: any) => {
    if (props.isAdd === 2) {
        productStore.refresh(data.id);
        form.name = data.name;
        form.classifiedId = data.classifiedId || undefined;
        form.classifiedName = data.classifiedName;
        form.photoUrl = data.photoUrl || photoValue.value;
        form.deviceType = data.deviceType.value;
        form.describe = data.describe;
        form.id = data.id;
        idDisabled.value = true;

        // 设置选中项的metadata
        if (form.classifiedId) {
            const findItemById = (items: any[], id: string): any => {
                for (const item of items) {
                    if (item.id === id) {
                        return item;
                    }
                    if (item.children && item.children.length > 0) {
                        const found = findItemById(item.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            const selectedItem = findItemById(treeList.value, form.classifiedId);
            selectedItemMetadata.value = selectedItem?.metadata || null;
            // 编辑模式下，传入现有的metadata数据进行回填
            initMetadataForm(data.metadata);
        } else {
            selectedItemMetadata.value = null;
            Object.keys(metadataForm).forEach(key => {
                delete metadataForm[key];
            });
        }
    } else if (props.isAdd === 1) {
        productStore.reSet();
        form.name = '';
        form.classifiedId = undefined;
        form.classifiedName = '';
        form.photoUrl = device.deviceProduct;
        form.deviceType = '';
        form.describe = undefined;
        form.id = undefined;
        idDisabled.value = false;
        selectedItemMetadata.value = null;
        Object.keys(metadataForm).forEach(key => {
            delete metadataForm[key];
        });
    }
    visible.value = true;
};

/**
 * 关闭弹窗
 */
const close = () => {
    visible.value = false;
};
const { resetFields, validate, validateInfos, clearValidate } = useForm(
    form,
    rules,
);
/**
 * 提交表单数据
 */
const submitData = async () => {
    try {
        // 验证主表单
        await formRef.value.validate();

        // 验证metadata表单（如果存在）
        if (metadataFormRef.value && Object.keys(metadataForm).length > 0) {
            try {
                await metadataFormRef.value.validate();
            } catch (error) {
                console.warn('Metadata form validation failed:', error);
                throw error; // 重新抛出错误以阻止提交
            }
        }

        // 验证通过，继续提交
        loading.value = true
        // 新增
        if (props.isAdd === 1) {
            if (form.id === '') {
                form.id = undefined;
            }

            // 合并metadata表单数据，处理JSON字符串
            const processedMetadata: Record<string, any> = {};
            if (Object.keys(metadataForm).length > 0) {
                const properties = getMetadataProperties();
                Object.keys(metadataForm).forEach(key => {
                    const property = properties?.[key];
                    const valueType = property?.valueType?.type;
                    const value = metadataForm[key];

                    if (['object', 'array'].includes(valueType) && typeof value === 'string' && value.trim()) {
                        try {
                            processedMetadata[key] = JSON.parse(value);
                        } catch (e) {
                            processedMetadata[key] = value; // 如果解析失败，保持原值
                        }
                    } else {
                        processedMetadata[key] = value;
                    }
                });
            }

            const submitForm = {
                ...form,
                metadata: Object.keys(processedMetadata).length > 0 ? processedMetadata : undefined
            };

            const res = await addProduct(submitForm).finally(() => {
                loading.value = false
            });
            if (res.success) {
                onlyMessage($t('Save.index.912481-22'));
                visible.value = false;
                emit('success');
                dialogRef.value.show(res.result.id);
            } else {
                onlyMessage($t('Save.index.912481-23'), 'error');
            }
        } else if (props.isAdd === 2) {
            // 编辑
            form.classifiedId = form.classifiedId || ''
            form.classifiedName = form.classifiedName || ''

            // 合并metadata表单数据，处理JSON字符串
            const processedMetadata: Record<string, any> = {};
            if (Object.keys(metadataForm).length > 0) {
                const properties = getMetadataProperties();
                Object.keys(metadataForm).forEach(key => {
                    const property = properties?.[key];
                    const valueType = property?.valueType?.type;
                    const value = metadataForm[key];

                    if (['object', 'array'].includes(valueType) && typeof value === 'string' && value.trim()) {
                        try {
                            processedMetadata[key] = JSON.parse(value);
                        } catch (e) {
                            processedMetadata[key] = value; // 如果解析失败，保持原值
                        }
                    } else {
                        processedMetadata[key] = value;
                    }
                });
            }

            const submitForm = {
                ...form,
                metadata: Object.keys(processedMetadata).length > 0 ? processedMetadata : undefined
            };

            const res = await editProduct(submitForm).finally(() => {
                loading.value = false
            });
            if (res.success) {
                onlyMessage($t('Save.index.912481-22'));
                emit('success');
                visible.value = false;
            } else {
                onlyMessage($t('Save.index.912481-23'), 'error');
            }
        }
    } catch (err: any) {
        // 验证失败，停止loading
        loading.value = false;
    }
};
/**
 * 初始化
 */
queryProductTree();

const changeDeviceType = (value: Array<string>) => {
    form.deviceType = value[0];
};
defineExpose({
    show: show,
});
</script>

<style scoped lang="less">
.card-style {
    position: relative;
    top: 19px;
}

.select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.upload-image-warp-logo {
    display: flex;
    justify-content: flex-start;

    .upload-image-border-logo {
        position: relative;
        overflow: hidden;
        border: 1px dashed #d9d9d9;
        transition: all 0.3s;
        width: 160px;
        height: 150px;

        &:hover {
            border: 1px dashed #1890ff;
            display: flex;
        }

        .upload-image-content-logo {
            align-items: center;
            justify-content: center;
            position: relative;
            display: flex;
            flex-direction: column;
            width: 160px;
            height: 150px;
            padding: 8px;
            background-color: rgba(0, 0, 0, 0.06);
            cursor: pointer;

            .loading-logo {
                position: absolute;
                top: 50%;
            }

            .loading-icon {
                position: absolute;
            }

            .upload-image {
                width: 100%;
                height: 100%;
                background-repeat: no-repeat;
                background-position: 50%;
                background-size: cover;
            }

            .upload-image-icon {
                width: 100%;
                height: 100%;
                background-repeat: no-repeat;
                background-position: 50%;
                background-size: inherit;
            }

            .upload-image-mask {
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 0;
                left: 0;
                display: none;
                width: 100%;
                height: 100%;
                color: #fff;
                font-size: 16px;
                background-color: rgba(0, 0, 0, 0.35);
            }

            &:hover .upload-image-mask {
                display: flex;
            }
        }
    }
}

.button-style {
    background-color: #fff;
    height: 66px;
    overflow: hidden;

    .card-content {
        width: 100%;

        .img-style {
            position: relative;
            top: 16px;
        }

        .checked-icon {
            position: absolute;
            right: -22px;
            bottom: -22px;
            z-index: 2;

            width: 44px;
            height: 44px;
            color: #fff;
            background-color: @primary-color-active;
            transform: rotate(-45deg);

            >div {
                position: relative;
                height: 100%;
                transform: rotate(45deg);

                >span {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    font-size: 12px;
                }
            }
        }

        &.checked {
            position: relative;
            color: @primary-color-active;
            border-color: @primary-color-active;

            >.checked-icon {
                display: block;
            }
        }
    }
}
</style>
