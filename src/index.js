import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state"

/**
 * Vue 构造函数
 * @param {object} options 用户选项
 */
function Vue (options) {
  this._init(options)  // 开始初始化
}

initMixin(Vue)  // 传递 Vue 的同时扩展了 _init 等方法
initLifeCycle(Vue)  // 扩展 _update、_render 等方法
initGlobalAPI(Vue)  // 扩展全局 api，如 mixin
initStateMixin(Vue)  // 扩展 $nextTick，$watch

export default Vue
