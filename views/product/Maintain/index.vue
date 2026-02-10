<template>
    <j-page-container>
        <!-- 搜索栏 -->
        <pro-search :columns="columns" target="device-instance" @search="handleSearch" />
        <FullPage>

            <div class="property-box">
                <div class="property-box-left">
                    <div class="organization-nav">
                        <LeftTree @change="onChange" />
                    </div>
                </div>

                <div class="property-box-right">
                    <div class="product-nav">
                        <div class="product-list">
                            <a-card v-for="item in productList" :key="item.id"
                                :class="['product-card', { active: selectedProduct === (item.id + '::' + item.orgId) || selectedProducts.includes(item.id) }]"
                                hoverable>
                                <div class="product-card-inner" @click="selectedProduct = item.id + '::' + item.orgId">
                                    <img class="product-pic" :src="item.photoUrl" alt="" />
                                    <div class="product-meta">
                                        <div class="product-name">型号：{{ item.name }}</div>
                                        <div class="product-type">产品：{{ item.classifiedName }}</div>
                                    </div>
                                </div>
                            </a-card>
                        </div>
                    </div>
                    <JProTable ref="instanceRef"
                        :columns="columns" 
                        :request="query" 
                        :defaultParams="{
                            sorts: [{ name: 'id', order: 'desc' }, { name: 'createTime', order: 'desc' }],
                        }" 
                        :rowSelection="isCheck
                                ? {
                                    selectedRowKeys: _selectedRowKeys,
                                    onSelect: onSelectChange,
                                    onSelectAll: selectAll,
                                    onSelectNone: () => (_selectedRowKeys = []),
                                }
                                : false
                            " :params="params" modeValue="CARD">
                            
                        <template #headerLeftRender>
                            <a-space>
                                <j-permission-button type="primary" @click="handleAdd"
                                    hasPermission="device/Instance:add">
                                    <template #icon>
                                        <AIcon type="PlusOutlined" />
                                    </template>
                                    {{ $t('Instance.index.133466-0') }}
                                </j-permission-button>
                                <BatchDropdown 
                                    v-model:isCheck="isCheck" 
                                    :actions="batchActions"
                                    @change="onCheckChange" />
                            </a-space>
                        </template>

                        <template #card="slotProps">
           
                            <CardBox :value="slotProps" 
                                @click="handleView(slotProps.id)" 
                                :actions="getActions(slotProps, 'card')"
                                :active="_selectedRowKeys.includes(slotProps.id)" 
                                :status="statusValue[slotProps.id]?.value"
                                :statusText="statusValue[slotProps.id]?.text"
                                :statusNames="{
                                    online: 'processing',
                                    offline: 'error',
                                    notActive: 'warning',
                                }">

                                        <template #content>
                                            <div style="display: flex; align-items: flex-start;">
                                                <j-ellipsis style="margin: 0 20px 0 5px">
                                                    <img :width="80" :height="80" :src="slotProps.photoUrl" />
                                                </j-ellipsis>
                                                <div style="flex: 1; margin-right: 16px; align-items: flex-start;">
                                                    
                                                    <j-ellipsis style="margin-bottom: 5px">
                                                        <span style="font-weight: 600; font-size: 16px">
                                                            {{ slotProps.name }}
                                                        </span>
                                                    </j-ellipsis>
                                                    <j-ellipsis style="margin-bottom: 18px">
                                                        <span style="font-weight: 300; font-size: 14px">
                                                            {{ slotProps.id }}
                                                        </span>
                                                    </j-ellipsis>
                                                    <a-row>
                                                        <a-col :span="12">
                                                            <div class="card-item-content-text">
                                                                {{ $t('Instance.index.133466-1') }}
                                                            </div>
                                                            <div>{{ slotProps.deviceType?.text }}</div>
                                                        </a-col>
                                                        <a-col :span="12">
                                                            <div class="card-item-content-text">
                                                                {{ $t('Instance.index.133466-2') }}
                                                            </div>
                                                            <j-ellipsis style="width: 100%">
                                                                {{ slotProps.productName }}
                                                            </j-ellipsis>
                                                        </a-col>
                                                    </a-row>
                                                </div>
                                            </div>

                                            <a-divider style="margin: 10px 0" />

                                            <div class="card-props" style="display:flex; flex-direction: column; align-items:flex-start">
                                                <template v-for="prop in properties" :key="prop.id">
                                                    <div style="display:flex; flex-direction: column; align-items:flex-start;">
                                                        <div style="color: #595959; font-size:12px">{{ prop.name }}:</div>
                                                        <ValueRender :data="prop" :value="propertyValue[slotProps.id]?.[prop.id]" />
                                                    </div>
                                                </template>
                                                <LoadDeviceValues :data="slotProps" />
                                            </div>
                                        </template>

                                <template #actions="item">
                                    <j-permission-button :disabled="item.disabled" :popConfirm="item.popConfirm"
                                        :tooltip="{
                                            ...item.tooltip,
                                        }" @click="item.onClick" :hasPermission="'product/Maintain:' + item.key">
                                        <AIcon type="DeleteOutlined" v-if="item.key === 'delete'" />
                                        <template v-else>
                                            <AIcon :type="item.icon" />
                                            <span>{{ item?.text }}</span>
                                        </template>
                                    </j-permission-button>
                                </template>
                            </CardBox>
                        </template>

                        <template #state="slotProps">
                            <j-badge-status 
                            :status="statusValue[slotProps.id]?.value" 
                            :text="statusValue[slotProps.id]?.text" 
                            :statusNames="{
                                online: 'processing',
                                offline: 'error',
                                notActive: 'warning',
                            }" />
                        </template>

                        <template #createTime="slotProps">
                            <span>{{
                                slotProps?.createTime
                                    ? dayjs(slotProps.createTime).format('YYYY-MM-DD HH:mm:ss')
                                    : ''
                                }}</span>
                        </template>

                        <template #registerTime="slotProps">
                            <span>{{
                                slotProps?.registerTime
                                    ? dayjs(slotProps.registerTime).format('YYYY-MM-DD HH:mm:ss')
                                    : ''
                                }}</span>
                        </template>

                        <template #action="slotProps">
                            <a-space :size="16">
                                <template v-for="i in getActions(slotProps, 'table')" :key="i.key">
                                    <j-permission-button 
                                        :disabled="i.disabled" 
                                        :popConfirm="i.popConfirm" 
                                        :tooltip="{
                                            ...i.tooltip,
                                    }" @click="i.onClick" 
                                        type="link" 
                                        style="padding: 0 5px" :danger="i.key === 'delete'"
                                        :hasPermission="i.key === 'view' ? true : 'device/Instance:' + i.key
                                    ">
                                        <template #icon>
                                            <AIcon :type="i.icon" />
                                        </template>
                                    </j-permission-button>
                                </template>
                            </a-space>
                        </template>

                    </JProTable>
                </div>
            </div>
        </FullPage>
    </j-page-container>

    <!-- 新增or编辑 -->
    <Save v-if="visible" 
        :title="title" 
        :isAdd="isAdd" 
        :data="current" 
        :departmentId="departmentId" 
        @close="visible = false"
        @save="saveBtn" />
</template>

<script setup lang="ts">
import {
    query,
    detail,
} from '../../../api/instance';
import {
    productNav,
} from '../../../api/product';
import { getToken, onlyMessage } from '@jetlinks-web/utils'
// import Import from './Import/modal.vue';
// import Export from './Export/index.vue';
// import Process from './Process/index.vue';
import Save from './Save/index.vue';
import { BASE_API, TOKEN_KEY_URL } from '@jetlinks-web/constants'
import {
    queryGatewayList,
    queryNoPagingPost,
    //queryOrgThree,
} from '../../../api/product';

import { PropertyData } from '../typings';
import { queryTree } from '../../../api/category';
import { useMenuStore } from '@/store/menu';
import type { ActionsType } from '../../device/Instance/typings';
import dayjs from 'dayjs';
//import BatchDropdown from '@/components/BatchDropdown/index.vue';
import type { BatchActionsType } from '@/components/BatchDropdown/types';
import { useRouterParams } from '@jetlinks-web/hooks';
//import TagSearch from '../../components/TagSearch.vue';
import { Modal } from 'ant-design-vue';
//import { device } from '../../../assets';
//import { isNoCommunity } from '@/utils/utils';
import { useI18n } from 'vue-i18n';

import LeftTree from "../../components/LeftTree.vue";
//import { co } from '@fullcalendar/core/internal-common';
//import Card from '@/views/account/center/components/Subscribe/components/Card.vue';

import ValueRender from './Running/Property/ValueRender.vue';
import { useInstanceStore } from '../../../store/instance';
import { dashboard } from '../../../api/dashboard';

const { t: $t } = useI18n();

const instanceRef = ref<Record<string, any>>({});
const productList = ref<Record<string, any>[]>([]);
const selectedProduct = ref<string | undefined>(undefined);
const selectedProducts = ref<string[]>([]);

const params = ref<Record<string, any>>({});
const _selectedRowKeys = ref<string[]>([]);
const importVisible = ref<boolean>(false);
const exportVisible = ref<boolean>(false);

const title = ref<string>("");
const isAdd = ref<number>(0);
const visible = ref<boolean>(false);
const current = ref<Record<string, any>>({});

const operationVisible = ref<boolean>(false);
const api = ref<string>('');
const type = ref<string>('');

const departmentId = ref<string>("");

//const instanceStore = useInstanceStore();
const dataSource = ref<PropertyData[]>([]);
const loading = ref<boolean>(false);
// store property values per device: { [deviceId]: { [propertyId]: valueObj } }
const propertyValue = ref<Record<string, Record<string, any>>>({});

// store status values per device: { [deviceId]: valueObj }
const statusValue = ref<Record<string, any>>({});

const statusMap = new Map();

statusMap.set('online', 'success');
statusMap.set('offline', 'error');
statusMap.set('notActive', 'warning');

import { groupBy, throttle, toArray } from 'lodash-es';
import { wsClient } from '@jetlinks-web/core';
import { map } from 'rxjs/operators';
import { defineComponent } from 'vue';

const statusRef = ref<Record<string, any>>({});
const subRef = ref<Record<string, any>>({});

const onChange = (n: string[] = []) => {
    departmentId.value = n[0] || "";
};

const isCheck = ref<boolean>(false);
const routerParams = useRouterParams();
const menuStory = useMenuStore();
const modalVisible = ref(false);
const deleteDeviceId = ref('');
const deleteState = ref(false);
const deleteTip = ref($t('Instance.index.133466-3'));
const transformData = (arr: any[]): any[] => {
    if (Array.isArray(arr) && arr.length) {
        return (arr || []).map((item: any) => {
            return {
                ...item,
                id: `classifiedId is ${item.id}`,
                children: transformData(item.children),
            };
        });
    } else {
        return [];
    }
};

const properties = [
    {
        id: 'CHARGE_STATE',
        name: '充电状态',
        valueType: {
            type: 'object',
            elements: [
                { text: '未充电', value: 0 },
                { text: '已充满', value: 1 },
                { text: '充电中', value: 2 },
            ],
        },
    },
    {
        id: 'LOCK_STATE',
        name: '锁状态',
        valueType: {
            type: 'object',
            elements: [
                { text: '关锁', value: 0 },
                { text: '开锁', value: 1 },
            ],
        },
    },
    {
        id: 'USED_STATE',
        name: '使用状态',
        valueType: {
            type: 'object',
            elements: [
                { text: '未使用', value: 0 },
                { text: '使用中', value: 1 },
            ],
        },
    }
]

// lightweight component: when a card mounts, request dashboard for that device
const LoadDeviceValues = defineComponent({
    props: {
        data: Object,
    },
    setup(props) {
        onMounted(() => {
            if (!props.data?.id || !props.data?.productId) return;
            statusValue.value[props.data.id] = props.data.state || {};
            if (propertyValue.value[props.data.id] && Object.keys(propertyValue.value[props.data.id]).length) return;
            if (props.data.productId) getDashboard(props.data.productId, props.data.id);
        });
        return () => null;
    },
});

const columns = ref([
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        ellipsis: true,
        search: {
            type: 'string',
            defaultTermType: 'eq',
        },
    },
    {
        title: $t('Instance.index.133466-4'),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        search: {
            type: 'string',
            first: true,
        },
    },
    {
        title: $t('Instance.index.133466-2'),
        dataIndex: 'productName',
        key: 'productName',
        ellipsis: true,
        search: {
            type: 'select',
            rename: 'productId',
            options: () =>
                new Promise((resolve) => {
                    queryNoPagingPost({ paging: false }).then((resp: any) => {
                        resolve(
                            resp.result.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            })),
                        );
                    });
                }),
        },
    },
    {
        title: $t('Instance.index.133466-5'),
        dataIndex: 'createTime',
        key: 'createTime',
        scopedSlots: true,
        width: 200,
        search: {
            type: 'date',
        },
    },
    {
        title: $t('Instance.index.133466-6'),
        dataIndex: 'state',
        key: 'state',
        scopedSlots: true,
        search: {
            type: 'select',
            options: [
                { label: $t('Instance.index.133466-7'), value: 'notActive' },
                { label: $t('Instance.index.133466-8'), value: 'offline' },
                { label: $t('Instance.index.133466-9'), value: 'online' },
            ],
        },
    },
    {
        key: 'classifiedId',
        dataIndex: 'classifiedId',
        title: $t('Instance.index.133466-10'),
        hideInTable: true,
        search: {
            type: 'treeSelect',
            // rename: 'productId$product-info',
            options: () =>
                new Promise((resolve) => {
                    queryTree({ paging: false }).then((resp: any) => {
                        resolve(transformData(resp.result));
                    });
                }),
        },
    },

    // {
    //     key: 'accessProvider',
    //     title: '网关类型',
    //     dataIndex: 'accessProvider',
    //     valueType: 'select',
    //     hideInTable: true,
    //     search: {
    //         type: 'select',
    //         // rename: 'productId$product-info',
    //         options: () =>
    //             new Promise((resolve) => {
    //                 getProviders().then((resp: any) => {
    //                     const data = resp.result || [];
    //                     resolve(
    //                         accessConfigTypeFilter(data).map((item) => ({
    //                             ...item,
    //                             value: `accessProvider is ${item.id}`,
    //                         })),
    //                     );
    //                 });
    //             }),
    //     },
    // },
    {
        key: 'accessId',
        dataIndex: 'accessId',
        title: $t('Instance.index.133466-11'),
        hideInTable: true,
        search: {
            type: 'select',
            options: () =>
                new Promise((resolve) => {
                    queryGatewayList({
                        paging: false,
                        sorts: [
                            {
                                name: 'createTime',
                                order: 'desc',
                            },
                        ],
                    }).then((resp: any) => {
                        resolve(
                            resp.result.map((item: any) => ({
                                label: item.name,
                                value: `accessId is ${item.id}`,
                            })),
                        );
                    });
                }),
        },
    },
    {
        dataIndex: 'deviceType',
        title: $t('Instance.index.133466-1'),
        valueType: 'select',
        hideInTable: true,
        search: {
            type: 'select',
            options: [
                { label: $t('Instance.index.133466-12'), value: 'device' },
                { label: $t('Instance.index.133466-13'), value: 'childrenDevice' },
                { label: $t('Instance.index.133466-14'), value: 'gateway' },
            ],
        },
    },
    // {
    //     key: 'id$tag',
    //     dataIndex: 'id$tag',
    //     title: $t('Instance.index.133466-17'),
    //     hideInTable: true,
    //     search: {
    //         type: 'component',
    //         components: TagSearch,
    //         termOptions: ['eq', 'not'],
    //     },
    // },
    // {
    //     key: 'id$dev-tag',
    //     dataIndex: 'id$dev-tag',
    //     title: $t('Instance.index.133466-15'),
    //     hideInTable: true,
    //     search: {
    //         type: 'component',
    //         components: TagSearch,
    //         componentProps: {
    //             data: params.value,
    //         },
    //         termOptions: ['eq'],
    //     },
    // },
    {
        title: $t('Instance.index.133466-18'),
        dataIndex: 'describe',
        key: 'describe',
        ellipsis: true,
        search: {
            type: 'string',
        },
    },
    {
        title: $t('Instance.index.133466-19'),
        key: 'action',
        fixed: 'right',
        width: 200,
        scopedSlots: true,
    },
]);

const valueChange = (arr: Record<string, any>[], deviceId: string) => {
    if (!deviceId) return;
    if (!propertyValue.value[deviceId]) propertyValue.value[deviceId] = {};
    (arr || [])
        .sort((a: any, b: any) => a.timestamp - b.timestamp)
        .forEach((item: any) => {
            const { value } = item;
            propertyValue.value[deviceId][value?.property] = { ...item, ...value };
        });
};

// 订阅设备状态
const subscribeStatus = (deviceId: string) => {
    statusRef.value[deviceId] = wsClient.getWebSocket(
        `instance-editor-info-status-${deviceId}`,
        `/dashboard/device/status/change/realTime`,
        {
            deviceId: deviceId,
        },
    )
    ?.pipe(map((res: any) => res.payload))
    .subscribe((payload) => {
        //console.log('>>>>>subscribe state update:', statusValue.value[deviceId], payload?.value);
        if (payload?.value?.type !== statusValue.value[deviceId]?.type) {
            if (!statusValue.value[deviceId]) {
                statusValue.value[deviceId] = {};
            }
            statusValue.value[deviceId].value = payload?.value.type;
            statusValue.value[deviceId].text = payload?.value.type == 'online' ? $t('Instance.index.133466-9') : payload?.value.type == 'offline' ? $t('Instance.index.133466-8') : $t('Instance.index.133466-7');
        }
    });
};

// 订阅设备属性更新（每个设备使用独立缓存和节流）
const subscribeProperty = (deviceId: string, productId: string) => {
    // if (subRef.value[deviceId]) {
    //     try { subRef.value[deviceId].unsubscribe(); } catch (e) {}
    // }
    const id = `instance-info-property-${deviceId}-${productId}-${(properties || []).map((p: any) => p.id).join('-')}`;
    const topic = `/dashboard/device/${productId}/properties/realTime`;
    const localCache = new Map();
    const localThrottle = throttle(() => {
        const _list = [...localCache.values()];
        valueChange(_list, deviceId);
    }, 500);

    const subscription = wsClient.getWebSocket(id, topic, {
        deviceId: deviceId,
        properties: (properties || []).map((p: any) => p.id),
        history: 1,
    })
        ?.pipe(map((res: any) => res.payload))
        .subscribe((payload) => {
            if (payload && payload.value && payload.value.property) {
                localCache.set(payload.value.property, payload);
                localThrottle();
            }
        });
    subRef.value[deviceId] = subscription;
};

const getDashboard = async (productId: string, deviceId: string) => {
    //console.log('>>>>>getDashboard', productId, deviceId);
    //if(!dataSource.value?.length) return

    const param = [
        {
            dashboard: 'device',
            object: productId, //productId
            measurement: 'properties',
            dimension: 'history',
                params: {
                deviceId: deviceId, //instanceId
                history: 1,
                properties: (properties || []).map((p: any) => p.id), // call for every item in `properties`
            },
        },
    ];

    loading.value = true;
    const resp: Record<string, any> = await dashboard(param);
    if (resp.status === 200) {
        const t1 = (resp.result || []).map((item: any) => {
            return {
                timeString: item.data?.timeString,
                timestamp: item.data?.timestamp,
                ...item?.data?.value,
            };
        });
        const obj = {};
        toArray(groupBy(t1, 'property'))
            .map((item) => {
                return {
                    list: item.sort((a, b) => b.timestamp - a.timestamp),
                    property: item[0].property,
                };
            })
            .forEach((i) => {
                    obj[i.property] = i.list[0];
                });
            if (!propertyValue.value[deviceId]) propertyValue.value[deviceId] = {};
            propertyValue.value[deviceId] = { ...propertyValue.value[deviceId], ...obj };
    }

    subscribeStatus(deviceId);
    subscribeProperty(deviceId, productId);
    loading.value = false;
};

const paramsFormat = (
    config: Record<string, any>,
    _terms: Record<string, any>,
    name?: string,
) => {
    if (
        config?.terms &&
        Array.isArray(config.terms) &&
        config?.terms.length > 0
    ) {
        (config?.terms || []).map(
            (item: Record<string, any>, index: number) => {
                if (item?.type) {
                    _terms[`${name ? `${name}.` : ''}terms[${index}].type`] =
                        item.type;
                }
                paramsFormat(
                    item,
                    _terms,
                    `${name ? `${name}.` : ''}terms[${index}]`,
                );
            },
        );
    } else if (!config?.terms && Object.keys(config).length > 0) {
        Object.keys(config).forEach((key) => {
            if (config[key]) {
                _terms[`${name ? `${name}.` : ''}${key}`] = config[key];
            }
        });
    }
};

const handleParams = (config: Record<string, any>) => {
    const _terms: Record<string, any> = {};
    paramsFormat(config, _terms);
    if (Object.keys(_terms).length) {
        const url = new URLSearchParams();
        Object.keys(_terms).forEach((key) => {
            //console.log(_terms[key]);
            url.append(key, _terms[key]);
        });
        return url.toString();
    } else {
        return '';
    }
};

/**
 * 新增
 */
const handleAdd = () => {
    title.value = $t('Save.index.902471-1');
    isAdd.value = 1;
    visible.value = true;
    current.value = {};
};

/**
 * 查看
 */
const handleView = (id: string) => {
    menuStory.jumpPage('product/Maintain/Detail', { params: { id } });
};

const getActions = (
    data: Partial<Record<string, any>>,
    type: 'card' | 'table',
): ActionsType[] => {
    if (!data) return [];
    const actions = [
        {
            key: 'view',
            text: $t('Instance.index.133466-20'),
            tooltip: {
                title: $t('Instance.index.133466-20'),
            },
            icon: 'EyeOutlined',
            onClick: () => {
                handleView(data.id);
            },
        },
        {
            key: 'update',
            text: $t('Instance.index.133466-21'),
            tooltip: {
                title: $t('Instance.index.133466-21'),
            },
            icon: 'EditOutlined',
            onClick: () => {
                title.value = $t('Save.index.902471-0');
                isAdd.value = 2;
                visible.value = true;
                current.value = data;
            },
        },
        {
            key: 'action',
            text: data.state?.value !== 'notActive' ? $t('Instance.index.133466-7') : $t('Instance.index.133466-22'),
            tooltip: {
                title: data.state?.value !== 'notActive' ? $t('Instance.index.133466-7') : $t('Instance.index.133466-22'),
            },
            icon:
                data.state.value !== 'notActive'
                    ? 'StopOutlined'
                    : 'CheckCircleOutlined',

            popConfirm: {
                title: `${$t('Instance.index.133466-23', [data.state.value !== 'notActive' ? $t('Instance.index.133466-7') : $t('Instance.index.133466-22')])}`,
                onConfirm: async () => {
                    let response;
                    if (data.state.value !== 'notActive') {
                        response = await _undeploy(data.id);
                    } else {
                        response = await _deploy(data.id);
                    }
                    if (response && response.status === 200) {
                        onlyMessage($t('Instance.index.133466-24'));
                        instanceRef.value?.reload();
                    } else {
                        onlyMessage($t('Instance.index.133466-25'), 'error');
                    }
                },
            },
        },
        {
            key: 'delete',
            text: $t('Instance.index.133466-26'),
            disabled: data.state?.value !== 'notActive',
            tooltip: {
                title:
                    data.state.value !== 'notActive'
                        ? $t('Instance.index.133466-27')
                        : $t('Instance.index.133466-26'),
            },
            onClick: async () => {
                if (deleteState.value) {
                    return;
                }
                deleteState.value = true;
                deleteDeviceId.value = data.id;
                const res = await detail(data.id).finally(() => {
                    modalVisible.value = true;
                });
                if (res.success) {
                    deleteTip.value =
                        res.result?.accessProvider === 'Ctwing'
                            ? $t('Instance.index.133466-28')
                            : $t('Instance.index.133466-3');
                }
                Modal.confirm({
                    title: deleteTip.value,
                    onOk() {
                        return deleteDevice();
                    },
                    onCancel() {
                        deleteState.value = false;
                    },
                });
            },
            icon: 'DeleteOutlined',
        },
    ];
    if (type === 'card')
        return actions.filter((i: ActionsType) => i.key !== 'view');
    return actions;
};

const onSelectChange = (item: any, state: boolean) => {
    const arr = new Set(_selectedRowKeys.value);
    // console.log(item, state);
    if (state) {
        arr.add(item.id);
    } else {
        arr.delete(item.id);
    }
    _selectedRowKeys.value = [...arr.values()];
};

const selectAll = (selected: Boolean, selectedRows: any, changeRows: any) => {
    if (selected) {
        changeRows.map((i: any) => {
            if (!_selectedRowKeys.value.includes(i.id)) {
                _selectedRowKeys.value.push(i.id);
            }
        });
    } else {
        const arr = changeRows.map((item: any) => item.id);
        const _ids: string[] = [];
        _selectedRowKeys.value.map((i: any) => {
            if (!arr.includes(i)) {
                _ids.push(i);
            }
        });
        _selectedRowKeys.value = _ids;
    }
};

const handleClick = (dt: any) => {
    if (isCheck.value) {
        if (_selectedRowKeys.value.includes(dt.id)) {
            const _index = _selectedRowKeys.value.findIndex((i) => i === dt.id);
            _selectedRowKeys.value.splice(_index, 1);
        } else {
            _selectedRowKeys.value = [..._selectedRowKeys.value, dt.id];
        }
    } else {
        handleView(dt.id);
    }
};

const handleGetParams = (p: any) => {
    p?.terms.map((a: any) => {
        return a.terms.map((b: any) => {
            if (b.column.includes('$product-info')) {
                b.column = 'productId';
                b.termType = 'product-info';
            }
            return b;
        });
    });
    return p;
};

const activeAllDevice = () => {
    type.value = 'active';
    const activeAPI = `${BASE_API}/device-instance/deploy?${TOKEN_KEY_URL}=${getToken()}&${handleParams(handleGetParams(params.value))}`;
    api.value = activeAPI;
    operationVisible.value = true;
};

const syncDeviceStatus = () => {
    type.value = 'sync';
    const syncAPI = `${BASE_API}/device-instance/state/_sync?${TOKEN_KEY_URL}=${getToken()}&${handleParams(params.value)}`;
    api.value = syncAPI;
    operationVisible.value = true;
};

const delSelectedDevice = () => {
    if (!_selectedRowKeys.value.length) {
        onlyMessage($t('Instance.index.133466-29'), 'error');
        return;
    }
    const response = batchDeleteDevice(_selectedRowKeys.value);
    response.then((resp) => {
        if (resp.status === 200) {
            onlyMessage($t('Instance.index.133466-24'));
            _selectedRowKeys.value = [];
            instanceRef.value?.reload();
        }
    });
    return response;
};

// const activeSelectedDevice = async () => {
//     if(!_selectedRowKeys.value.length){
//         onlyMessage($t('Instance.index.133466-29'), 'error')
//         return
//     }
//     const resp = await batchDeployDevice(_selectedRowKeys.value);
//     if (resp.status === 200) {
//         onlyMessage($t('Instance.index.133466-24'));
//         _selectedRowKeys.value = [];
//         instanceRef.value?.reload();
//     }
// };

const disabledSelectedDevice = () => {
    if (!_selectedRowKeys.value.length) {
        onlyMessage($t('Instance.index.133466-29'), 'error');
        return;
    }
    const response = batchUndeployDevice(_selectedRowKeys.value);
    response.then((resp) => {
        if (resp.status === 200) {
            onlyMessage($t('Instance.index.133466-24'));
            _selectedRowKeys.value = [];
            instanceRef.value?.reload();
        }
    });
    return response;
};

const batchActions: BatchActionsType[] = [
    {
        key: 'export',
        text: $t('Instance.index.133466-30'),
        permission: 'device/Instance:export',
        icon: 'ExportOutlined',
        onClick: () => {
            exportVisible.value = true;
        },
    },
    {
        key: 'import',
        text: $t('Instance.index.133466-31'),
        permission: 'device/Instance:import',
        icon: 'ImportOutlined',
        onClick: () => {
            importVisible.value = true;
        },
    },
    {
        key: 'activeAll',
        text: $t('Instance.index.133466-32'),
        ghost: true,
        type: 'primary',
        permission: 'device/Instance:action',
        icon: 'CheckCircleOutlined',
        popConfirm: {
            title: $t('Instance.index.133466-33'),
            onConfirm: activeAllDevice,
        },
    },
    {
        key: 'sync',
        text: $t('Instance.index.133466-34'),
        type: 'primary',
        ghost: true,
        icon: 'SyncOutlined',
        onClick: syncDeviceStatus,
    },
    {
        key: 'delete',
        text: $t('Instance.index.133466-35'),
        danger: true,
        permission: 'device/Instance:delete',
        icon: 'DeleteOutlined',
        selected: {
            popConfirm: {
                title: $t('Instance.index.133466-36'),
                onConfirm: delSelectedDevice,
            },
        },
    },
    // {
    //     key: 'active',
    //     text: '激活选中设备',
    //     ghost: true,
    //     type: 'primary',
    //     icon: 'CheckOutlined',
    //     permission: 'device/Instance:action',
    //     selected: {
    //         popConfirm: {
    //             title: '确认激活选中设备',
    //             onConfirm: activeSelectedDevice,
    //         },
    //     },
    // },
    {
        key: 'disable',
        text: $t('Instance.index.133466-37'),
        danger: true,
        icon: 'StopOutlined',
        permission: 'device/Instance:action',
        selected: {
            popConfirm: {
                title: $t('Instance.index.133466-38'),
                onConfirm: disabledSelectedDevice,
            },
        },
    },
];

const saveBtn = () => {
    visible.value = false;
    instanceRef.value?.reload();
};

const dealSearchValue = (item: any) => {
    let value: any = '';
    item.value.forEach((i: any, index: number) => {

        if (index > 0) {
            value += ',' + i.slice((item.column + ' is ').length);
        } else {
            value +=
                item.column + ' in ' + i.slice((item.column + ' is ').length);
        }
    });
    return value;
};

const handleSearch = (_params: any) => {
    // params.value = _params;
    const newParams = (_params?.terms as any[])?.map((item1) => {
        item1.terms = item1.terms.map((item2: any) => {
            if (item2.column === 'id$dim-assets') {
                if (item2.termType === 'not') {
                    const oldValue = JSON.parse(item2.value);
                    oldValue.not = true;
                    item2.value = JSON.stringify(oldValue);
                }
                delete item2.termType;
            }

            if (
                item2.column &&
                ['classifiedId', 'accessId', 'accessProvider'].includes(
                    item2.column,
                )
            ) {
                const oldTermType = item2.termType;
                delete item2.termType;
                return {
                    ...item2,
                    column: `productId$product-info$${oldTermType}`,
                    value: Array.isArray(item2.value)
                        ? dealSearchValue(item2)
                        : item2.value,
                };
            }
            if (item2.column === 'id$dev-tag') {
                item2 = {
                    terms: [
                        ...item2.value.map(i => i)
                    ]
                }
            }
            return item2;
        });
        return item1;
    });
    params.value = { terms: newParams || [] };
};

const onRefresh = () => {
    instanceRef.value?.reload();
};

// 批量操作时，选中状态变化
const onCheckChange = () => {
    _selectedRowKeys.value = [];
};

const deleteDevice = async () => {
    const resp = await _delete(deleteDeviceId.value);
    if (resp.status === 200) {
        onlyMessage($t('Instance.index.133466-24'));
        const index = _selectedRowKeys.value.findIndex(
            (id: any) => id === deleteDeviceId.value,
        );
        if (index !== -1) {
            _selectedRowKeys.value.splice(index, 1);
        }
        instanceRef.value?.reload();
    } else {
        onlyMessage($t('Instance.index.133466-25'), 'error');
    }
    deleteState.value = false;
};

onMounted(() => {

    watch(
        () => selectedProduct.value, 
        (v) => {
            // clear multi selection when single product clicked
            //selectedProducts.value = [];
            //applyProductFilter();
            const sep = '::';
            if (!v) {   
                params.value = {};
                instanceRef.value?.reload();
                return;
            }
            const [prodId, orgId] = v.split(sep);
            params.value = { 
                terms: [
                    {
                        column: 'productId',
                        termType: 'eq',
                        value: prodId,
                    },
                    { 
                        column: 'id$in-dim-asset$org$device',
                        //column: 'dimensionId',
                        //termType: 'eq', 
                        value: [orgId],
                    }],
                sorts: [{ name: 'id', order: 'desc' }]
            };
            instanceRef.value?.reload();

            // call getDashboard to fetch property values by productId and deviceId
            // deviceId is current page items is id
            // after reload the table's `dataSource` should be populated — request dashboard for each item on current page
            setTimeout(() => {
                if (dataSource.value && dataSource.value.length) {
                    dataSource.value.forEach((d: any) => {
                        if (d && d.id) getDashboard(prodId, d.id);
                    });
                }
            }, 300);
            
        }
    );

    // react to product selection or multiple product selection
    // const applyProductFilter = () => {
    //     if (selectedProducts.value && selectedProducts.value.length) {
    //         params.value = { terms: [{ terms: [{ column: 'productId', termType: 'in', value: selectedProducts.value }] }] };
    //     } else if (selectedProduct.value) {
    //         params.value = { terms: [{ terms: [{ column: 'productId', termType: 'eq', value: selectedProduct.value }] }] };
    //     } else {
    //         params.value = {};
    //     }
    //     instanceRef.value?.reload();
    // };

    // watch(
    //     () => selectedProduct.value, 
    //     () => {
    //     // clear multi selection when single product clicked
    //     selectedProducts.value = [];
    //     applyProductFilter();
    //     }
    // );

    // watch(
    //     () => departmentId.value,
    //     () => {
    //         params.value = { 
    //             terms: [
    //                 { 
    //                     column: 'id$in-dim-asset$org$device', 
    //                     //termType: 'eq', 
    //                     value: [departmentId.value],
    //                 }]
    //             };
    //         instanceRef.value?.reload();
    //     }
    // );

    watch(
        () => departmentId.value,
        () => {
            productNav({ terms: [{ column: 'dimensionId', termType: 'eq', value: departmentId.value }], sorts: [{ name: 'createTime', order: 'desc' }] })
            .then((resp: any) => {
                if (resp.status === 200) {
                    productList.value = resp.result as Record<string, any>[];
                }
            });

            params.value = { 
                terms: [
                    { 
                        column: 'id$in-dim-asset$org$device',
                        //column: 'dimensionId',
                        //termType: 'eq', 
                        value: [departmentId.value],
                    }],
                sorts: [{ name: 'id', order: 'desc' }]
            };
            instanceRef.value?.reload();
        }
        
    );

    if (routerParams.params.value?.type === 'add') {
        handleAdd();
    }

    if (routerParams.params.value?.type === 'import') {
        importVisible.value = true;
    }

    // if (isNoCommunity) {
    //     columns.value.splice(columns.value.length - 3, 0, {
    //         dataIndex: 'id$dim-assets',
    //         title: $t('Instance.index.133466-16'),
    //         hideInTable: true,
    //         search: {
    //             type: 'treeSelect',
    //             termOptions: ['eq'],
    //             options: () =>
    //                 new Promise((resolve) => {
    //                     queryOrgThree({}).then((resp: any) => {
    //                         const formatValue = (list: any[]) => {
    //                             const _list: any[] = [];
    //                             list.forEach((item) => {
    //                                 if (item.children) {
    //                                     item.children = formatValue(
    //                                         item.children,
    //                                     );
    //                                 }
    //                                 _list.push({
    //                                     ...item,
    //                                     id: JSON.stringify({
    //                                         assetType: 'device',
    //                                         targets: [
    //                                             {
    //                                                 type: 'org',
    //                                                 id: item.id,
    //                                             },
    //                                         ],
    //                                     }),
    //                                 });
    //                             });
    //                             return _list;
    //                         };
    //                         resolve(formatValue(resp.result));
    //                     });
    //                 }),
    //         },
    //     });
    // }
});

onUnmounted(() => {
    Object.values(subRef.value || {}).forEach((s: any) => {
        try { s && s.unsubscribe(); } catch (e) {}
    });
    Object.values(statusRef.value || {}).forEach((s: any) => {
        try { s && s.unsubscribe(); } catch (e) {}
    });
});
</script>

<style scoped>
.property-box {
    display: flex;

    .property-box-left {
        display: flex;
        flex-direction: column;

        max-height: calc(100vh - 140px);
    }

    .property-box-right {
        flex: 1;
    }
}

.product-nav {
    margin: 12px 8px 0 8px;
    padding-left: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.product-list {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: nowrap;
}

.product-card {
    cursor: pointer;
    flex: 0 0 auto;
    margin: 4px 0 4px 0;
}

.product-card.active {
    background: #f0f7ff;
    border-color: #1890ff;
}

.product-card-inner {
    display: flex;
    gap: 10px;
    align-items: center;
}

.product-pic {
    width: 40px;
    height: 40px;
    object-fit: cover;
}

.product-meta {
    display: flex;
    flex-direction: column;
}

/* .product-name {
    font-size: 14px;
    font-weight: 600;
} */

.product-id {
    font-size: 12px;
    color: #888;
}

.list-render-sticky {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #fff;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.product-list-header {
    font-weight: 600;
    margin-bottom: 8px;
}

.instance-split {
    display: flex;
    align-items: stretch;
}

.instance-left {
    display: flex;
    flex-direction: column;
}

.instance-right {
    min-width: 0;
    flex: 1 1 auto;
    overflow: auto;
    max-height: calc(100vh - 140px);
}

.organization-nav {
    margin: 12px 8px 0 8px;
}
</style>
