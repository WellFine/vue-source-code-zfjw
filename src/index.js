import { initMixin } from "./init"

/**
 * Vue 构造函数
 * @param {object} options 用户选项
 */
function Vue (options) {
  this._init(options)   // 开始初始化
}

initMixin(Vue)    // 传递 Vue 的同时扩展了 _init 等方法

export default Vue
