/**
 * 根据 vnode 创建真实 DOM 节点
 * @param {object} vnode 要创建 DOM 节点的 vnode
 * @returns 创建好的 DOM 节点
 */
function createElm (vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {  // vnode 是元素类型
    // 将真实节点与虚拟节点对应起来，方便后续 diff 算法通过虚拟节点找到真实节点并修改
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, data)  // 处理节点属性
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))  // 创建子节点并添加
    })
  } else {  // vnode 是文本类型，文本类型 tag 为 undefined
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

/**
 * 处理 el 元素的 props 属性
 * @param {object} el 元素
 * @param {object} props 属性
 */
function patchProps (el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
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
 * @param {object} oldVNode 初次渲染为 el 元素，更新时则为旧节点
 * @param {object} vnode 要渲染的 vnode
 * @returns 返回新 vnode 转化的真实 DOM
 */
export function patch (oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType
  /**
   * todo：弄明白为什么根据 nodeType 区分初次渲染以及更新渲染
   * 因为 oldVNode 始终都是 dom 元素，nodeType 始终有值
   */
  if (isRealElement) {  // 初次渲染
    const elm = oldVNode  // 获取初次渲染的 el 元素
    const parentElm = elm.parentNode  // 拿到父元素
    const newElm = createElm(vnode)  // vnode => DOM
    parentElm.insertBefore(newElm, elm.nextSibling)  // 将新节点插入到旧节点后面
    parentElm.removeChild(elm)  // 删除旧节点
    return newElm
  } else {  // 更新渲染
    // diff 算法
  }
}
