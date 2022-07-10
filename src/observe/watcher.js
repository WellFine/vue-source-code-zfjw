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
   * react 是整棵树更新，vue 是组件级更新
   */
  update () {
    this.get()  // 重新渲染
  }
}

export default Watcher
