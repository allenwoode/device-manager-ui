import { request } from '@jetlinks-web/core'

/**
 * 产品资产查询
 * @param data 
 * @returns 
 */
export const productAsset = (data?: Record<string, any>) => request.post('/assets/product/_query', data)

/**
 * 设备资产查询
 * @param data 
 * @returns 
 */
export const deviceAsset = (data?: Record<string, any>) => request.post('/assets/device/_query', data)