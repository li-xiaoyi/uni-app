import {
  hasOwn
} from 'uni-shared'

import {
  promisify
} from 'uni-core/helpers/promise'

import {
  initSubNVue
} from '../sub-nvue'

import {
  initPostMessage
} from '../post-message'

import {
  initTitleNView
} from '../title-nview'

import * as apis from './api'

export default function initUni (uni, nvue, plus, BroadcastChannel) {
  const {
    getSubNVueById,
    getCurrentSubNVue
  } = initSubNVue(nvue, plus, BroadcastChannel)

  const scopedApis = Object.assign({
    getSubNVueById,
    getCurrentSubNVue,
    requireNativePlugin: nvue.requireModule
  }, initTitleNView(nvue), initPostMessage(plus))

  if (typeof Proxy !== 'undefined') {
    return new Proxy({}, {
      get (target, name) {
        if (apis[name]) {
          return apis[name]
        }
        if (scopedApis[name]) {
          return scopedApis[name]
        }
        if (!hasOwn(uni, name)) {
          return
        }
        return promisify(name, uni[name])
      }
    })
  }
  const ret = {
    requireNativePlugin: nvue.requireModule
  }
  Object.keys(apis).forEach(name => {
    ret[name] = apis[name]
  })
  Object.keys(scopedApis).forEach(name => {
    ret[name] = scopedApis[name]
  })
  Object.keys(uni).forEach(name => {
    ret[name] = promisify(name, uni[name])
  })
  return ret
}
