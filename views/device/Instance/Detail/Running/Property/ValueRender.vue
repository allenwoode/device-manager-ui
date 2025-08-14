<template>
    <div class="value">
        <div
            v-if="value?.formatValue !== 0 && !value?.formatValue"
            :class="valueClass"
        >
            --
        </div>
        <div v-else-if="_data.data?.valueType?.type === 'file'">
            <template v-if="data?.valueType?.bodyType === 'base64'">
                <div :class="valueClass" v-if="!!_type">
                    <img :src="imgMap.get(_type)" @error="onError" />
                </div>
                <div v-else :class="valueClass">
                    <img :src="imgMap.get('other')" />
                </div>
            </template>
            <div
                v-else-if="data?.valueType?.bodyType === $t('Detail.Table.181708-1')"
                :class="valueClass"
            >
                <img :src="imgMap.get('other')" />
            </div>
            <template v-else>
                <template
                    v-if="
                        imgList.some((item) =>
                            value?.formatValue.includes(item),
                        )
                    "
                >
                    <div :class="valueClass" @click="getDetail('img')">
                        <img :src="value?.formatValue" @error="imgError" />
                    </div>
                </template>
                <template
                    v-else-if="
                        videoList.some((item) =>
                            value?.formatValue.includes(item),
                        )
                    "
                >
                    <div :class="valueClass" @click="getDetail('video')">
                        <img :src="imgMap.get('video')" />
                    </div>
                </template>
                <template
                    v-else-if="
                        fileList.some((item) =>
                            value?.formatValue.includes(item),
                        )
                    "
                >
                    <div :class="valueClass">
                        <img
                            :src="
                                imgMap.get(
                                    fileList
                                        .find((item) =>
                                            value?.formatValue.includes(item),
                                        )
                                        .slice(1),
                                )
                            "
                        />
                    </div>
                </template>
                <template v-else>
                    <div :class="valueClass">
                        <img :src="imgMap.get('other')" />
                    </div>
                </template>
            </template>
        </div>
        <div
            v-else-if="_data.data?.valueType?.type === 'object'"
            @click="getDetail('obj')"
            :class="valueClass"
        >
            <img :src="imgMap.get('obj')" />
        </div>
        <div
            v-else-if="
                _data.data?.valueType?.type === 'geoPoint' ||
                _data.data?.valueType?.type === 'array'
            "
            :class="valueClass"
        >
            <div style='width: 100%; white-space: normal;'>
                <j-ellipsis>{{ JSON.stringify(value?.formatValue) }}</j-ellipsis>
            </div>
        </div>
        <!-- 数值显示样式 - 针对数字类型优化显示 -->
        <div v-else :class="valueClass">
            <div class="value-content" :class="getValueDisplayClass()">
                <j-ellipsis>
                    {{ formatDisplayValue(value?.formatValue) }}
                </j-ellipsis>
            </div>
        </div>
        <ValueDetail
            v-if="visible"
            :type="_types"
            :value="value"
            @close="visible = false"
        />
    </div>
</template>

<script lang="ts" setup>
import { onlyMessage } from '@jetlinks-web/utils';
import ValueDetail from './ValueDetail.vue';
import { getType, imgMap, imgList, videoList, fileList } from './index';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const _data = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    value: {
        type: Object,
        default: () => {},
    },
    type: {
        type: String,
        default: 'card',
    },
});

const valueClass = computed(() => {
    return _data.type === 'card' ? 'cardValue' : 'otherValue';
});

const isHttps = document.location.protocol === 'https:';

const _types = ref<string>('');
const visible = ref<boolean>(false);
const temp = ref<boolean>(false);

const _type = computed(() => {
  return getType(_data.value?.formatValue)
})

// 判断是否为状态指示器类型
const isStatusIndicator = computed(() => {
    const propertyName = _data.data?.name?.toLowerCase() || '';
    const value = _data.value?.formatValue;
    
    // 检查属性名称是否包含状态相关关键词
    const hasStatusName = propertyName.includes('状态') || 
                         propertyName.includes('status') ||
                         propertyName.includes('充电') ||
                         propertyName.includes('锁');
    
    // 检查是否为状态类型的枚举
    const isStatusEnum = _data.data?.valueType?.type === 'enum' && hasStatusEnum();
    
    // 检查值是否为多位数字字符串（如"001111"）
    const isMultiDigitStatus = typeof value === 'string' && 
                              /^\d{2,}$/.test(value) && 
                              value.length <= 10;
    
    return hasStatusName || isStatusEnum || isMultiDigitStatus;
});

// 判断是否为锁状态
const isLockStatus = computed(() => {
    const propertyName = _data.data?.name?.toLowerCase() || '';
    return propertyName.includes('锁') || 
           propertyName.includes('lock') ||
           propertyName.includes('locked') ||
           propertyName.includes('unlock');
});

// 判断是否为状态枚举
const hasStatusEnum = () => {
    const elements = _data.data?.valueType?.elements;
    if (!elements) return false;
    
    // 检查是否包含状态相关的枚举值
    const statusKeys = Object.keys(elements).some(key => 
        key.includes('状态') || key.includes('status') || 
        key.includes('充电') || key.includes('锁') ||
        elements[key]?.text?.includes('状态')
    );
    return statusKeys;
};

// 解析状态值为数组（支持多状态显示）
const statusValues = computed(() => {
    const value = _data.value?.formatValue.state;
    if (!value) return [];
    
    // 如果是数组格式的状态值
    if (Array.isArray(value)) {
        return value;
    }
    
    // 如果是字符串格式，尝试解析为多个状态
    const strValue = String(value);
    if (strValue.includes(',') || strValue.includes('|')) {
        return strValue.split(/[,|]/).map(v => v.trim());
    }
    
    // 对于充电状态或锁状态，可能需要根据位数拆分
    if (strValue.length > 1 && /^\d+$/.test(strValue)) {
        return strValue.split('').map(v => parseInt(v));
    }
    
    return [value];
});

// 获取状态点的样式类
const getStatusClass = (status: any) => {
    const statusStr = String(status).toLowerCase();
    
    // 根据不同状态值返回不同颜色
    if (statusStr === '1') {
        return 'status-active'; // 绿色
    } else if (statusStr === '2') {
        return 'status-warning'; // 橙色
    } else if (statusStr === '3') {
        return 'status-error'; // 红色
    } else if (statusStr === '0') {
        return 'status-inactive'; // 灰色
    }
    
    return 'status-default'; // 默认灰色
};

// 获取数值显示样式类
const getValueDisplayClass = () => {
    const valueType = _data.data?.valueType?.type;
    const value = _data.value?.formatValue;
    
    // 数字类型使用大字体
    if (['int', 'long', 'float', 'double'].includes(valueType) || 
        (!isNaN(Number(value)) && String(value).length <= 10)) {
        return 'numeric-value';
    }
    
    return 'text-value';
};

// 格式化显示值
const formatDisplayValue = (value: any) => {
    if (value === null || value === undefined) return '--';
    
    const valueType = _data.data?.valueType?.type;
    
    // 数字类型格式化
    if (['int', 'long', 'float', 'double'].includes(valueType)) {
        const num = Number(value);
        if (!isNaN(num)) {
            // 整数直接显示，小数保留合适位数
            return valueType === 'float' || valueType === 'double' ? 
                   parseFloat(num.toFixed(2)).toString() : 
                   num.toString();
        }
    }
    
    return String(value);
};

// 获取锁状态图标
const getLockIcon = (status: any) => {
    const statusStr = String(status);
    return statusStr === '0' ? 'UnlockOutlined' : 'LockOutlined';
};

// 获取锁状态图标样式类
const getLockIconClass = (status: any) => {
    const statusStr = String(status);
    return statusStr === '0' ? 'lock-unlocked' : 'lock-locked';
};

const onError = (e: any) => {
    e.target.src = imgMap.get('other');
};

const imgError = (e: any) => {
    e.target.src = imgMap.get('error');
    temp.value = true;
};

const getDetail = (_type: string) => {
    const value = _data.value;
    let flag: string = '';
    if (_type === 'img') {
        if (isHttps && value?.formatValue.indexOf('http:') !== -1) {
            onlyMessage($t('Property.ValueRender.865445-0'), 'error');
        } else if (temp.value) {
            onlyMessage($t('Property.ValueRender.865445-1'), 'error');
        } else {
            flag =
                ['.jpg', '.png'].find((item) =>
                    value?.formatValue.includes(item),
                ) || '--';
            _types.value = flag;
            visible.value = true;
        }
    } else if (_type === 'video') {
        if (isHttps && value?.formatValue.indexOf('http:') !== -1) {
            onlyMessage($t('Property.ValueRender.865445-0'), 'error');
        } else if (
            ['.rmvb', '.mvb'].some((item) => value?.formatValue.includes(item))
        ) {
            onlyMessage($t('Property.ValueRender.865445-2'), 'error');
        } else {
            flag =
                ['.m3u8', '.flv', '.mp4'].find((item) =>
                    value?.formatValue.includes(item),
                ) || '--';
            _types.value = flag;
            visible.value = true;
        }
    } else if (_type === 'obj') {
        console.log('---> obj')
        flag = 'obj';
        _types.value = flag;
        visible.value = true;
    }
};
</script>

<style lang="less" scoped>
.value {
    display: flex;
    align-items: center;
    width: 100%;

    .cardValue {
        display: flex;
        align-items: center;
        width: 100%;
        height: 60px;
        overflow: hidden;
        color: #323130;
        font-weight: 700;
        font-size: 24px;
        white-space: nowrap;
        text-overflow: ellipsis;

        img {
            width: 60px;
        }

        // 状态指示器样式
        .status-indicators {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;

            .status-dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: inline-block;
                transition: all 0.3s ease;

                &.status-active {
                    background-color: #52c41a; // 绿色 - 正常/充电/激活
                    box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
                    //animation: statusBlink 2s ease-in-out infinite;
                }

                &.status-warning {
                    background-color: #faad14; // 橙色 - 警告
                    box-shadow: 0 0 6px rgba(250, 173, 20, 0.4);
                }

                &.status-error {
                    background-color: #ff4d4f; // 红色 - 错误/故障
                    box-shadow: 0 0 6px rgba(255, 77, 79, 0.4);
                }

                &.status-inactive {
                    background-color: #d9d9d9; // 灰色 - 未激活/锁定
                    border: 2px solid #f0f0f0;
                }

                &.status-default {
                    background-color: #8c8c8c; // 默认灰色
                }
            }
        }

        // 锁状态图标样式
        .lock-status {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .lock-icon {
                display: inline-flex;
                align-items: center;
                font-size: 20px;
                transition: all 0.3s ease;

                &.lock-unlocked {
                    color: #52c41a; // 绿色 - 已解锁
                }

                &.lock-locked {
                    //color: #ff4d4f; // 红色 - 已锁定
                    color: #d9d9d9;
                }
            }
        }

        // 数值内容样式
        .value-content {
            width: 100%;
            
            &.numeric-value {
                font-size: 28px;
                font-weight: 700;
                color: #262626;
                letter-spacing: 1px;
            }

            &.text-value {
                font-size: 16px;
                font-weight: 500;
                color: #595959;
                line-height: 1.4;
                white-space: normal;
            }
        }
    }

    .otherValue {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        
        img {
            width: 40px;
        }

        // 列表视图中的状态指示器
        .status-indicators {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;

            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;

                &.status-active {
                    background-color: #52c41a;
                    //animation: statusBlink 2s ease-in-out infinite;
                }

                &.status-warning {
                    background-color: #faad14;
                }

                &.status-error {
                    background-color: #ff4d4f;
                }

                &.status-inactive {
                    background-color: #d9d9d9;
                    border: 1px solid #f0f0f0;
                }

                &.status-default {
                    background-color: #8c8c8c;
                }
            }
        }

        // 列表视图中的锁状态图标
        .lock-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;

            .lock-icon {
                font-size: 14px;

                &.lock-unlocked {
                    color: #52c41a;
                }

                &.lock-locked {
                    color: #d9d9d9;
                }
            }
        }

        .value-content {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            
            &.numeric-value {
                font-size: 16px;
                font-weight: 600;
            }

            &.text-value {
                font-size: 14px;
                font-weight: 400;
            }
        }
    }
}

// Keyframe animation for status-active blinking
@keyframes statusBlink {
    0% {
        opacity: 1;
        box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
    }
    50% {
        opacity: 0.5;
        box-shadow: 0 0 12px rgba(82, 196, 26, 0.8);
    }
    100% {
        opacity: 1;
        box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
    }
}
</style>
