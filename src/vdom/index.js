const isReservedTag = tag => {
  // Vue 内部就是通过打表的方式来看一个标签是否为原始标签
  return ['a', 'div', 'p', 'button', 'ul', 'li', 'span', /* ... */].includes(tag)
}

/**
 * 创建虚拟元素 vnode，也是 new Vue 时 render 函数的 h 参数
 * @param {object} vm 表明该元素 vnode 属于哪个 Vue 实例
 * @param {string} tag 元素名
 * @param {object} data 元素属性对象
 * @param  {...any} children 子元素，后面参数都是
 * @returns 一个虚拟元素 vnode
 */
export function createElementVNode (vm, tag, data, ...children) {
  if (data == null) data = {}  // data 为空则初始化为空对象
  const key = data.key  // diff 算法需要用到的 key
  if (key) delete data.key  // 取出 key 后从 data 中删除
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children)  // 创建原始标签虚拟节点
  } else {
    const Ctor = vm.$options.components[tag]
    return createComponentVNode(vm, tag, key, data, children, Ctor)  // 创建组件虚拟节点
  }
}

/**
 * 
 * @param {object} vm 表明该虚拟节点属于哪个 Vue 实例
 * @param {string} tag 元素名
 * @param {string} key diff 算法用到的 key
 * @param {object} data 元素属性
 * @param {array} children 子元素列表
 * @param {any} Ctor 组件的定义，可能是对象也可能是构造函数
 * @returns 一个虚拟组件 vnode
 */
function createComponentVNode (vm, tag, key, data, children, Ctor) {
  // Ctor 可能是组件的声明对象，也可能是用 Vue.extend 包装后的构造函数
  if (typeof Ctor === 'object') {
    // 这里不直接调用 Vue.extend 是为了让继承 Vue 的 Sub 类也能访问到 extend 静态方法
    Ctor = vm.$options._base.extend(Ctor)  // 转成构造函数
  }
  return vnode(vm, tag, key, data, children, null, { Ctor })
}

/**
 * 创建虚拟文本 vnode
 * @param {object} vm 表明该文本 vnode 属于哪个 Vue 实例
 * @param {string} text 文本内容
 * @returns 一个虚拟文本 vnode
 */
export function createTextVNode (vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

/**
 * 用于创建虚拟节点
 * @param {object} vm 表明该虚拟节点属于哪个 Vue 实例
 * @param {string} tag 元素名
 * @param {string} key diff 算法用到的 key
 * @param {object} data 元素属性
 * @param {array} children 子元素列表
 * @param {string} text 元素文本内容
 * @param {object} componentOptions 组件虚拟节点的构造函数
 * @returns 返回一个 vnode
 */
function vnode (vm, tag, key, data, children, text, componentOptions) {
  /**
   * 这里看着 vnode 和 ast 语法树的节点很像，其实有一定区别
   * ast 是一种语法层面的转义，用于描述 html、css、js 等语法，语法什么样转义后 ast 就张什么样，不能自作主张加东西
   * vnode 用于描述 DOM 元素，可以给其增加自定义属性，如 vm 表明虚拟节点属于哪个 Vue 实例
   */
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions  // 自定义组件的构造函数
    // 以后还会添加事件、插槽、指令等
  }
}

/**
 * 判断两个虚拟节点类型是否相同
 * @returns 布尔值
 */
export function isSameVnode (vnode1, vnode2) {
  // 除了 tag 还要判断 key
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}
