let id = 0  // dep 的标识

class Dep {
  /**
   * 一个数据对应一个 dep，dep 会收集数据依赖的 watcher
   */
  constructor () {
    this.id = id++  // 一个数据对应一个 dep，多个 dep 用 id 区分
    this.subs = []  // 存放数据对应的 watcher，也可以理解为数据被哪些组件使用了
  }

  /**
   * 收集数据对应的 watcher，会在数据被访问且 Dep.target 有值时调用
   * 收集前会先让 watcher 记住 dep，同时进行去重操作
   */
  depend () {
    Dep.target.addDep(this)  // 让 watcher 记住 dep，同时去重
  }

  /**
   * 让 dep 收集 watcher，该方法由 watcher 记录 dep 时调用
   * 且因为 watcher 记录 dep 时已经去重过了，所以 dep 不会收集重复的 watcher
   * @param {Watcher} watcher 要收集的 watcher
   */
  addSub (watcher) {
    this.subs.push(watcher)  // 收集 watcher
  }

  /**
   * 通知收集的所有 watcher 更新视图，也就是让所有用到本数据的组件重新渲染
   */
  notify () {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null  // Dep.target 用于存放当前的渲染 watcher

export default Dep
