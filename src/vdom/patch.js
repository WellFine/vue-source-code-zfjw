import { isSameVnode } from "."

function createComponent (vnode) {
  let i = vnode.data
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)  // 执行组件的初始化钩子
  }
  if (vnode.componentInstance) {
    return true  // 执行 init 钩子后，vnode.componentInstance 有值则返回 true 说明是组件
  }
}

/**
 * 根据 vnode 创建真实 DOM 节点
 * @param {object} vnode 要创建 DOM 节点的 vnode
 * @returns 创建好的 DOM 节点
 */
export function createElm (vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {  // vnode 是元素类型
    if (createComponent(vnode)) {  // 元素是自定义组件
      /**
       * createComponent 方法中会执行组件的 init 钩子
       * init 钩子及后续操作会将组件 vnode 转化为真实节点并存在 vnode.componentInstance.$el 中
       */
      return vnode.componentInstance.$el
    }
    
    // 将真实节点与虚拟节点对应起来，方便后续 diff 算法通过虚拟节点找到真实节点并修改
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, {}, data)  // 处理节点属性
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))  // 创建子节点并添加
    })
  } else {  // vnode 是文本类型，文本类型 tag 为 undefined
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

/**
 * 处理 el 元素的 props 属性，对比 oldProps 与 props，更新差异部分
 * @param {object} el 元素
 * @param {object} props 属性
 */
function patchProps (el, oldProps = {}, props = {}) {
  // 旧属性有，新属性没有，需要删除
  const oldStyles = oldProps.style || {}
  const newStyles = props.style || {}
  for (const key in oldStyles) {
    if (!newStyles[key]) {  // 旧样式有，新样式没有，删除
      el.style[key] = ''
    }
  }
  for (const key in oldProps) {
    if (!props[key]) {  // 旧属性有，新属性没有，删除
      el.removeAttribute(key)
    }
  }

  // 旧属性没有，新属性有，需要添加
  // 旧属性有，新属性也有，则覆盖
  for (let key in props) {
    if (key === 'style') {
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

/**
 * 负责渲染，将 vnode 转化为真实 DOM 后替换掉 oldVNode
 * patch 既有初始化渲染的功能，也有更新渲染的功能
 * @param {object} oldVNode 初次渲染为 el 元素，更新时则为旧节点，如果为空是组件的挂载
 * @param {object} vnode 要渲染的 vnode
 * @returns 返回新 vnode 转化的真实 DOM
 */
export function patch (oldVNode, vnode) {
  if (!oldVNode) {  // oldVNode 为空，视为组件的挂载，具体原因可以看 https://male_eagle.gitee.io/blog/vue/source-code/v2_write/18_component_render.html#创建真实节点
    // 直接将 vnode 变为真实节点并返回，这个真实节点在 vm._update 中会被赋值给 vm.$el
    return createElm(vnode)
  }
  
  const isRealElement = oldVNode.nodeType
  if (isRealElement) {  // 初次渲染
    const elm = oldVNode  // 获取初次渲染的 el 元素
    const parentElm = elm.parentNode  // 拿到父元素
    const newElm = createElm(vnode)  // vnode => DOM
    parentElm.insertBefore(newElm, elm.nextSibling)  // 将新节点插入到旧节点后面
    parentElm.removeChild(elm)  // 删除旧节点
    return newElm
  } else {  // 更新渲染，diff 算法
    return patchVnode(oldVNode, vnode)
  }
}

/**
 * 根据 diff 算法将新 vnode 与旧 vnode 的差异部分进行更新
 * @returns 新 vnode 生成的 dom
 */
function patchVnode (oldVnode, vnode) {
  if (!isSameVnode(oldVnode, vnode)) {  // 两个虚拟节点类型不同
    const el = createElm(vnode)
    // 直接用新 vnode 生成的 dom 替换旧 vnode 的 dom
    oldVnode.el.parentNode.replaceChild(el, oldVnode.el)
    return el
  }

  // 两个虚拟节点类型相同且 key 相同
  const el = vnode.el = oldVnode.el  // 节点类型相同，直接复用老节点的 dom 结构

  if (!oldVnode.tag) {  // tag 为 undefined 表示节点是文本类型
    if (oldVnode.text !== vnode.text) {
      el.textContent = vnode.text  // 覆盖旧文本
    }
  }

  // 虚拟节点是元素类型，则比对属性并更新
  patchProps(el, oldVnode.data, vnode.data)

  // 开始比较子节点
  const oldChildren = oldVnode.children || []
  const newChildren = vnode.children || []
  if (oldChildren.length > 0 && newChildren.length > 0) {  // 双方都有子节点，比对子节点并更新
    updateChildren(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) {  // 新节点有子节点，旧节点没有，插入
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) {  // 新节点没有子节点，旧节点有，删除
    el.innerHTML = ''  // 简单点直接设为空
  }

  return el
}

/**
 * 往 el 中添加新的子节点
 * @param {dom} el 要添加子节点的 dom 元素
 * @param {Array} newChildren 子节点数组，注意是虚拟节点
 */
function mountChildren (el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i]
    el.appendChild(createElm(child))
  }
}

/**
 * 比对新旧子节点数组并更新
 * @param {dom} el 要更新子节点的 dom 元素
 * @param {Array} oldChildren 旧子节点数组
 * @param {Array} newChildren 新子节点数组
 */
function updateChildren (el, oldChildren, newChildren) {
  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]
  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = newChildren[newEndIndex]

  function makeIndexByKey (children) {
    const map = {}
    children.forEach((child, index) => {
      map[child.key] = index
    })
    return map
  }
  const map = makeIndexByKey(oldChildren)  // 乱序比对的映射表

  /**
   * 新旧子数组只要有一方的头指针大于尾指针就停止循环
   * 可以配合 https://male_eagle.gitee.io/blog/vue/source-code/v2_write/16_diff.html#比较子节点 图解来理解比较方式
   */
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {  // 乱序比对中旧数组节点可能为空
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {  // 乱序比对中旧数组节点可能为空
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {  // 头头比对，对应 abc -> abcd 情况
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {  // 尾尾比对，对应 abc -> dabc 情况
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {  // 尾头比对，对应 abcd -> dabc 情况，也可以对应 reverse 倒序和 sort 排序情况
      patchVnode(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)  // 将旧数组的尾巴移动到最前面
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {  // 头尾比对，对应 abcd -> bcda 情况，也可以对应 reverse 倒序和 sort 排序情况
      patchVnode(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)  // 将旧数组的头移动到最后面
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else {  // 乱序比对：根据旧数组做一个映射关系，用新数组节点去找，找到则复用移动，找不到则添加，最后旧数组多余的节点就删除
      const moveIndex = map[newStartVnode.key]
      if (moveIndex !== undefined) {  // 新数组节点存在于映射关系中，复用
        const moveVnode = oldChildren[moveIndex]
        el.insertBefore(moveVnode.el, oldStartVnode.el)  // 移动到旧数组头指针前面
        oldChildren[moveIndex] = undefined  // 移动后设为空
        patchVnode(moveVnode, newStartVnode)
      } else {  // 不存在于映射关系中，新增
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  if (newStartIndex <= newEndIndex) {  // 插入新数组头尾指针间的节点，例如 push 以及 unshift 情况
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const childEl = createElm(newChildren[i])
      // 如果新数组的尾指针下一个有值，证明是从后向前比，例如 unshift 情况
      // 如果新数组的尾指针下一个没有值，证明是从前向后比，例如 push 情况
      const anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null
      el.insertBefore(childEl, anchor)
    }
  }

  if (oldStartIndex <= oldEndIndex) {  // 删除旧数组头尾指针间的节点，例如 pop 以及 shift 情况
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {  // 乱序比对中可能会将旧数组节点设为空
        const childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }
}
