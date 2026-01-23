<template>
    <j-page-container>
        <pro-search :columns="columns" target="device-instance" @search="handleSearch" />
        <FullPage>

            <div class="property-box">
                <div class="property-box-left">
                    <div class="product-nav">
                        <div class="list-render-sticky">
                            <div class="product-list-header">{{ $t('Instance.index.133466-39') }}<span
                                    class="product-count">({{ filteredProducts.length }})</span></div>
                        </div>
                        <a-input-search v-model:value="value" :placeholder="$t('Instance.index.133466-40')"
                            style="width: 260px; margin-bottom: 10px" @search="onSearch" :allowClear="true" />
                        <div class="product-list">

                            <a-card v-for="item in filteredProducts" :key="item.id"
                                :class="['product-card', { active: selectedProduct === item.id || selectedProducts.includes(item.id) }]"
                                hoverable>
                                <div class="product-card-inner" @click="selectedProduct = item.id">
                                    <img class="product-pic" :src="item.photoUrl || device.deviceCard" alt="" />
                                    <div class="product-meta">
                                        <div class="product-name">{{ item.name }}</div>
                                    </div>
                                </div>
                            </a-card>
                            
                        </div>
                    </div>
                </div>

                <div class="property-box-right">
                    <JProTable ref="instanceRef" :columns="columns" :request="query" :defaultParams="{
                        sorts: [{ name: 'createTime', order: 'desc' }, { name: 'name', order: 'desc' }],
                    }" :rowSelection="isCheck
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
                                <BatchDropdown v-model:isCheck="isCheck" :actions="batchActions"
                                    @change="onCheckChange" />
                            </a-space>
                        </template>

                        <template #card="slotProps">
                            <CardBox :value="slotProps" @click="handleClick" :actions="getActions(slotProps, 'card')"
                                :active="_selectedRowKeys.includes(slotProps.id)" :status="slotProps.state?.value"
                                :statusText="slotProps.state?.text" :statusNames="{
                                    online: 'processing',
                                    offline: 'error',
                                    notActive: 'warning',
                                }">
                                <template #img>
                                    <img :width="80" :height="80" :src="slotProps?.photoUrl ||
                                        device.deviceCard
                                        " />
                                </template>
                                <template #content>
                                    <j-ellipsis style="width: calc(100% - 100px); margin-bottom: 5px">
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
                                </template>
                                <template #actions="item">
                                    <j-permission-button :disabled="item.disabled" :popConfirm="item.popConfirm"
                                        :tooltip="{
                                            ...item.tooltip,
                                        }" @click="item.onClick" :hasPermission="'device/Instance:' + item.key">
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
                            <j-badge-status :status="slotProps.state?.value" :text="slotProps.state?.text" :statusNames="{
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

                        <template #action="slotProps">
                            <a-space :size="16">
                                <template v-for="i in getActions(slotProps, 'table')" :key="i.key">
                                    <j-permission-button :disabled="i.disabled" :popConfirm="i.popConfirm" :tooltip="{
                                        ...i.tooltip,
                                    }" @click="i.onClick" type="link" style="padding: 0 5px" :danger="i.key === 'delete'"
                                        :hasPermission="i.key === 'view'
                                                ? true
                                                : 'device/Instance:' + i.key
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
    <Import v-if="importVisible" @cancel="importVisible = false" @save="onRefresh" />
    <Export v-if="exportVisible" @close="exportVisible = false" :data="params" @save="onRefresh" />
    <Process v-if="operationVisible" @close="operationVisible = false" :api="api" :type="type" :data="params"
        @save="onRefresh" />
    <Save v-if="visible" :title="title" :isAdd="isAdd" :data="current" @close="visible = false" @save="saveBtn" />
</template>

<script setup lang="ts">
import {
    query,
    _delete,
    _deploy,
    _undeploy,
    batchUndeployDevice,
    batchDeleteDevice,
    detail,
} from '../../../api/instance';
import { getToken, onlyMessage } from '@jetlinks-web/utils'
import Import from './Import/modal.vue';
import Export from './Export/index.vue';
import Process from './Process/index.vue';
import Save from './Save/index.vue';
import { BASE_API, TOKEN_KEY_URL } from '@jetlinks-web/constants'
import {
    queryGatewayList,
    queryNoPagingPost,
    queryOrgThree,
} from '../../../api/product';
import { queryTree } from '../../../api/category';
import { useMenuStore } from '@/store/menu';
import type { ActionsType } from './typings';
import dayjs from 'dayjs';
import BatchDropdown from '@/components/BatchDropdown/index.vue';
import type { BatchActionsType } from '@/components/BatchDropdown/types';
import { useRouterParams } from '@jetlinks-web/hooks';
import TagSearch from './components/TagSearch.vue';
import { Modal } from 'ant-design-vue';
import { device } from '../../../assets';
import { isNoCommunity } from '@/utils/utils';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const instanceRef = ref<Record<string, any>>({});
const productList = ref<Record<string, any>[]>([]);
const value = ref<string>('');
const filteredProducts = ref<Record<string, any>[]>([]);
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

const onSearch = (v?: string) => {
    const q = (v ?? value.value ?? '').toString().trim().toLowerCase();
    if (!q) {
        filteredProducts.value = productList.value.slice();
        return;
    }
    filteredProducts.value = (productList.value || []).filter((p: any) => {
        const name = (p.name || '').toString().toLowerCase();
        const id = (p.id || '').toString().toLowerCase();
        return name.includes(q) || id.includes(q);
    });
};

// const toggleProductSelection = (id: string, checked: boolean) => {
//     const idx = selectedProducts.value.indexOf(id);
//     if (checked) {
//         if (idx === -1) selectedProducts.value.push(id);
//     } else {
//         if (idx !== -1) selectedProducts.value.splice(idx, 1);
//     }
// };

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
    {
        key: 'id$dev-tag',
        dataIndex: 'id$dev-tag',
        title: $t('Instance.index.133466-15'),
        hideInTable: true,
        search: {
            type: 'component',
            components: TagSearch,
            componentProps: {
                data: params.value,
            },
            termOptions: ['eq'],
        },
    },
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
            console.log(_terms[key]);
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
    menuStory.jumpPage('device/Instance/Detail', { params: { id } });
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

const onCheckChange = () => {
    _selectedRowKeys.value = [];
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
    // load products for left filter
    queryNoPagingPost({ paging: false, sorts: [{ name: 'createTime', order: 'desc' }] }).then((resp: any) => {
        if (resp.status === 200) {
            productList.value = resp.result as Record<string, any>[];
            filteredProducts.value = productList.value.slice();
        }
    });

    // react to product selection or multiple product selection
    const applyProductFilter = () => {
        if (selectedProducts.value && selectedProducts.value.length) {
            params.value = { terms: [{ terms: [{ column: 'productId', termType: 'in', value: selectedProducts.value }] }] };
        } else if (selectedProduct.value) {
            params.value = { terms: [{ terms: [{ column: 'productId', termType: 'eq', value: selectedProduct.value }] }] };
        } else {
            params.value = {};
        }
        instanceRef.value?.reload();
    };

    watch(() => selectedProduct.value, () => {
        // clear multi selection when single product clicked
        selectedProducts.value = [];
        applyProductFilter();
    });

    // live filter when search value changes
    watch(value, (v) => {
        onSearch(v as unknown as string);
    });

    watch(() => selectedProducts.value.slice(), () => {
        // clear single selection when multi selected
        if (selectedProducts.value && selectedProducts.value.length) {
            selectedProduct.value = undefined;
        }
        applyProductFilter();
    });
    if (routerParams.params.value?.type === 'add') {
        handleAdd();
    }
    if (routerParams.params.value?.type === 'import') {
        importVisible.value = true;
    }
    if (isNoCommunity) {
        columns.value.splice(columns.value.length - 3, 0, {
            dataIndex: 'id$dim-assets',
            title: $t('Instance.index.133466-16'),
            hideInTable: true,
            search: {
                type: 'treeSelect',
                termOptions: ['eq'],
                options: () =>
                    new Promise((resolve) => {
                        queryOrgThree({}).then((resp: any) => {
                            const formatValue = (list: any[]) => {
                                const _list: any[] = [];
                                list.forEach((item) => {
                                    if (item.children) {
                                        item.children = formatValue(
                                            item.children,
                                        );
                                    }
                                    _list.push({
                                        ...item,
                                        id: JSON.stringify({
                                            assetType: 'device',
                                            targets: [
                                                {
                                                    type: 'org',
                                                    id: item.id,
                                                },
                                            ],
                                        }),
                                    });
                                });
                                return _list;
                            };
                            resolve(formatValue(resp.result));
                        });
                    }),
            },
        });
    }
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

.product-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.product-card {
    cursor: pointer;
}

.product-card.active {
    background: #f0f7ff;
    border-color: #1890ff;
}

.product-card-inner {
    display: flex;
    gap: 8px;
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
    font-weight: 600;
} */

.product-id {
    font-size: 12px;
    color: #888;
}

/* .list-render-sticky {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #fff;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
} */

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

.product-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    max-height: calc(100vh - 180px);
}

.product-nav {
    margin: 12px 8px 0 8px;
}
</style>
