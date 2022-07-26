import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"

/**
 * Vue 构造函数
 * @param {object} options 用户选项
 */
function Vue (options) {
  this._init(options)  // 开始初始化
}

Vue.prototype.$nextTick = nextTick  // 暂时在这里赋值，方便 vm 拿到，后面会调整到别的地方

initMixin(Vue)  // 传递 Vue 的同时扩展了 _init 等方法
initLifeCycle(Vue)  // 扩展 _update、_render 等方法
initGlobalAPI(Vue)  // 扩展全局 api，如 mixin

/**
 * 创建一个 Watcher，观察 exprOrFn，如果其中的值变化了就执行 cb 函数
 * @param {any} exprOrFn 可以是字符串表示 watch 中的属性名，也可以是函数返回要 watch 的属性如 () => vm.firstname
 * @param {function} cb 值变化后要执行的回调函数
 */
Vue.prototype.$watch = function (exprOrFn, cb) {
  new Watcher(this, exprOrFn, { user: true }, cb)
}

export default Vue
