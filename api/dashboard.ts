// 仪表盘数据
import { request } from '@jetlinks-web/core'
/**
 * 产品数量
 */
//export const productCount = (data?:any) => request.post(`/device-product/_count`,data);
export const productCount = (data?:any) => request.post(`/device/product/count`,data);

/**
 * 设备数量
 */
//export const deviceCount = (data?:any) => request.get('/device/instance/_count',data);
export const deviceCount = (data?:any) => request.post('/device/instance/count',data);

/**
 * 当前在线
 */
export const dashboard = (data?:any) => request.post('/dashboard/_multi', data);

/**
 * 地图数据
 */
export const getGo = (data?:any) => request.post('/geo/object/device/_search/geo.json',data)

export const getDeviceGeoJson = (data?:any) => request.post('/geo/object/device/_search/_page',data)
