import { initState } from "./state"

/**
 * 通过方法将 Vue 传递进来，并扩展了 _init 等原型方法
 * @param {object} Vue Vue 构造函数，用于扩展原型方法
 */
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {    // 用于初始化操作
    const vm = this
    vm.$options = options   // 将用户的选项挂载到实例上

    initState(vm)   // 初始化状态
  }
}
