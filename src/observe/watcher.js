import Dep from "./dep"

let id = 0  // watcher 标识，0 表示为根组件的 watcher

class Watcher {
  /**
   * 观察者，用于观察组件视图中用到的数据，一个 watcher 观察一个组件
   * 数据发生变化，watcher 就更新视图
   * @param {Vue} vm watcher 对应的组件实例
   * @param {function} fn 渲染逻辑，核心是 vm._update(vm._render())
   * @param {boolean} options true 表明是一个渲染 Watcher
   */
  constructor (vm, fn, options) {
    this.id = id++  // 每个 watcher 的标识
    this.renderWatcher = options  // true 为渲染 Watcher
    this.getter = fn  // 取名 getter 是因为 fn 中有在 vm 上取值的操作，调用 getter 就会取值并渲染
    this.deps = []  // 记录 watcher 下有多少个数据 dep，记录的目的是后续实现计算属性以及进行一些清理工作
    this.depsId = new Set()  // 利用 Set 和 dep 的 id 来去重
    this.get()
  }

  /**
   * 执行渲染逻辑
   */
  get () {
    Dep.target = this  // 将当前 watcher 存放到 Dep.target 中
    this.getter()  // getter 中 _render() 会去 vm 上取值，触发数据的 get 拦截逻辑，在 get 中让 dep 收集 watcher
    Dep.target = null  // 渲染后重置
  }

  /**
   * 让 watcher 记录下 dep，且相同的 dep 只记录一次
   * @param {Dep} dep 要记录的 dep
   */
  addDep (dep) {
    const id = dep.id
    if (!this.depsId.has(id)) {  // 当前 dep 没有记录
      this.deps.push(dep)  // 记录 dep
      this.depsId.add(id)
      dep.addSub(this)  // 让 dep 记住当前 watcher
    }
  }

  /**
   * 数据改变时，dep 就会通知 watcher 更新视图
   * watcher 收到通知后不会立即更新，而是存入异步队列中，等待同一轮事件循环中的同步代码执行完成，在异步阶段再进行更新
   * react 是整棵树更新，vue 是组件级更新
   */
  update () {
    queueWatcher(this)
  }

  /**
   * 进行更新渲染
   */
  run () {
    this.get()
  }
}

let queue = []  // 用于存放 watcher 的队列
let has = {}  // 用于去重
let pending = false  // 防抖的控制变量

/**
 * 刷新并调度队列，从队列中取出目前要更新渲染的 watcher 进行更新，然后清空队列
 */
function flushSchedulerQueue () {
  const flushQueue = queue.slice(0)  // 拷贝一份
  queue = []  // 清空当前队列，后面进来的 watcher 就等下一次调度
  has = {}
  pending = false  // 此时再有数据改变，其 watcher 入队列后开启下一次调度
  flushQueue.forEach(watcher => watcher.run())  // 让队列中的 watcher 进行更新渲染
}

/**
 * 将要更新渲染的 watcher 缓存起来，在执行完一轮事件循环的同步代码后，开始执行异步代码时再统一更新渲染
 * @param {Watcher} watcher 要缓存的 watcher
 */
function queueWatcher (watcher) {
  const id = watcher.id
  if (!has[id]) {  // 当前渲染的 watcher 没有缓存
    queue.push(watcher)  // 缓存 watcher
    has[id] = true  // 用于去重
    if (!pending) {
      // 本轮事件循环中同步代码执行完成，数据全部改变后再刷新并调度队列 flushSchedulerQueue
      nextTick(flushSchedulerQueue)
      pending = true
    }
  }
}

let callbacks = []  // 存放 nextTick 异步的回调函数
let waiting = false  // 是否批处理回调函数的标识，也是防抖的标识

/**
 * 对 nextTick 传入的回调函数队列进行批处理
 */
function flushCallbacks () {
  const cbs = callbacks.slice(0)  // 拷贝一份
  callbacks = []  // 清空
  waiting = false  // 重置防抖标识
  cbs.forEach(cb => cb())  // 依次调用队列中的回调函数
}

/**
 * 对 nextTick 做降级处理，用于兼容 ie
 */
// let timerFunc
// if (Promise) {  // 支持 promise
//   timerFunc = () => {
//     Promise.resolve().then(flushCallbacks)
//   }
// } else if (MutationObserver) {
//   let observer = new MutationObserver(flushCallbacks)  // 传入的回调函数是异步执行的
//   let textNode = document.createTextNode(1)
//   observer.observe(textNode, {
//     characterData: true  // observer 监控 textNode 内容，内容发生改变就执行 flushCallbacks()
//   })
//   timerFunc = () => {
//     textNode.textContent = 2
//   }
// } else if (setImmediate) {
//   timerFunc = () => {
//     setImmediate(flushCallbacks)
//   }
// } else {
//   timerFunc = () => {
//     setTimeout(flushCallbacks)
//   }
// }

/**
 * 将传入的回调函数 cb 放入队列中维护，先传入的 cb 后面批处理时会先调用
 * 当同一轮事件循环中的同步代码执行完成后，就会从队列中依次调用回调函数
 * 用于统一用户使用的异步方式和底层源码使用的异步方式
 * @param {function} cb 要异步调用的回调函数
 */
export function nextTick (cb) {
  callbacks.push(cb)
  if (!waiting) {
    // timerFunc()  // 不兼容 ie，不需要降级处理，直接使用 promise 就行
    Promise.resolve().then(flushCallbacks)  // 等本轮事件循环中的同步代码执行完后，再对回调队列进行批处理
    waiting = true
  }
}

export default Watcher
