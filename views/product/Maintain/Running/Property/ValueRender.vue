<template>
    <div class="value">
        <div
            v-if="state !== 'online' || !value?.formatValue"
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
         <div class="cardValue">
                <div v-if="isChargeState" class="status-indicators">
                    <template v-for="(s, idx) in statusValues" :key="idx">
                        <a-tooltip :title="getStatusText('C'+(idx+1))">
                            <span :class="['status-dot', getChargeClass(s)]"></span>
                        </a-tooltip>
                    </template>
                </div>
                <div v-else-if="isLockState" class="lock-status">
                    <template v-for="(s, idx) in statusValues" :key="idx">
                        <a-tooltip :title="getStatusText('C'+(idx+1))">
                            <span :class="['lock-icon', getLockIconClass(s)]">
                                <i :class="getFaClass(s)" aria-hidden="true"></i>
                            </span>
                        </a-tooltip>
                    </template>
                </div>
                <div v-else class="status-indicators">
                    <template v-for="(s, idx) in statusValues" :key="idx">
                        <a-tooltip :title="getStatusText('C'+(idx+1))">
                            <span :class="['status-dot', getStatusClass(s)]"></span>
                        </a-tooltip>
                    </template>
                </div>
            </div>
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
    </div>
</template>

<script lang="ts" setup>
import { onlyMessage } from '@jetlinks-web/utils';
import { getType, imgMap, imgList, videoList, fileList } from './index';
import { useI18n } from 'vue-i18n';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
    state: {
        type: String,
        default: '',
    }
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

const isChargeState = computed(() => {
    const id = _data.value?.property || '';
    return id === 'CHARGE_STATE';
});

const isLockState = computed(() => {
    const id = _data.value?.property || '';
    return id === 'LOCK_STATE';
});

// const isUsedState = computed(() => {
//     const id = _data.value?.property || '';
//     return id === 'USED_STATE';
// });

// 解析状态值为数组（支持多状态显示），兼容多种格式
const statusValues = computed(() => {
    let raw = _data.value?.formatValue;
    if (raw == null) return [];

    // 如果 formatValue 是对象并且包含 state 字段，优先使用它
    if (typeof raw === 'object' && raw !== null && 'state' in raw) {
        raw = raw.state;
    }

    // 数组直接返回
    if (Array.isArray(raw)) return raw;

    const str = String(raw);
    // 支持以逗号或竖线分隔的多状态
    if (str.includes(',') || str.includes('|')) return str.split(/[,|]/).map(v => v.trim());

    // 如果是纯数字且长度>1，将每一位拆分为单个状态
    if (/^\d+$/.test(str) && str.length > 1) return str.split('').map(v => v);

    return [raw];
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

// 获取状态显示文本，优先使用 valueType.elements 映射
const getStatusText = (status: any) => {
    // const elems = _data.data?.valueType?.elements || [];
    // if (Array.isArray(elems) && elems.length) {
    //     const found = elems.find((e: any) => String(e.value) === String(status) || String(e.text) === String(status));
    //     if (found) return found.text;
    // }

    return String(status);
};

// 获取充电状态的样式（0 白色, 1 绿色, 2 蓝色）
const getChargeClass = (status: any) => {
    const s = String(status);
    if (s === '0') return 'status-charge-0';
    if (s === '1') return 'status-charge-1';
    if (s === '2') return 'status-charge-2';
    return 'status-default';
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
    if (value === null || value === undefined) return '------';

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

// const getUsedIcon = (status: any) => {
//     const statusStr = String(status);
//     // use filled/solid icons for clearer display
//     return statusStr === '1' ? 'LoginOutlined' : 'LogoutOutlined';
// };

// 获取锁状态图标样式类
const getLockIconClass = (status: any) => {
    const statusStr = String(status);
    return statusStr === '1' ? 'lock-unlocked' : 'lock-locked';
};

// FontAwesome class for lock/unlock (uses solid icons)
const getFaClass = (status: any) => {
    const statusStr = String(status);
    return statusStr === '1' ? 'fas fa-lock-open' : 'fas fa-lock';
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
    console.log("data value:", _data.value);
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
            gap: 5px;
            flex-wrap: wrap;

            .status-dot {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                display: inline-block;
                transition: all 0.3s ease;

                &.status-active {
                    background-color: #52c41a; // 绿色 - 正常/充电/激活
                    box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
                }

                .status-label {
                    font-size: 12px;
                    color: #595959;
                    margin-right: 6px;
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

                &.status-charge-0 {
                    background-color: #ffffff;
                    border: 1px solid #d9d9d9;
                }

                &.status-charge-1 {
                    background-color: #52c41a;
                    box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
                }

                &.status-charge-2 {
                    background-color: #1890ff;
                    box-shadow: 0 0 6px rgba(24, 144, 255, 0.35);
                }
            }
        }

        // 锁状态图标样式
        .lock-status {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 1.5px;
            flex-wrap: wrap;

            .lock-icon {
                display: inline-flex;
                align-items: center;
                font-size: 14px;
                transition: all 0.3s ease;
                &.lock-unlocked {
                    color: #52c41a; // 绿色 - 已解锁
                }
                &.lock-locked {
                    color: #d9d9d9;
                }
                .lock-text {
                    font-size: 12px;
                    color: #595959;
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
            align-items: flex-start;
            justify-content: flex-start;
            gap: 10px;

            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;

                &.status-active {
                    background-color: #52c41a;
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
            align-items: flex-start;
            justify-content: flex-start;
            gap: 4px;

            .lock-icon {
                font-size: 14px;
                margin: 2px 0;

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
            align-items: flex-start;
            justify-content: flex-start;
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

/* Ensure FontAwesome <i> inherits sizing and color */
.lock-status i,
.lock-icon i {
    font-size: inherit;
    color: inherit;
    line-height: 1;
    display: inline-block;
}
</style>
