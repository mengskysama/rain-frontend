/**
 * @param {String} options.method
 * @param {String} options.url
 * @param {Boolean} options.async, optional, default true
 * @param {String} options.contentType, optional, default
 *   'application/x-www-form-urlencoded charset=UTF-8'
 * @param {Object} options.headers
 * @param {FormData|ArrayBufferView|Blob|Document} options.data, default null
 * @param {Function} options.beforeSend, optional
 */

function Ajax (options) {
  const xhr = new window.XMLHttpRequest()
  Object.assign(xhr, {
    _callbacks: [],
    _error: null,
    _errorHandler: null,
    _state: 'pending',
    _value: null,
    catch: xhrCatch,
    data: options.data || null,
    resolve: xhrResolve,
    then: xhrThen
  })
  xhr.open(
    (options.method || 'get').toUpperCase(),
    options.url,
    options.async !== false
  )
  if (typeof options.headers === 'object') {
    Object.keys(options.headers).forEach(header => {
      xhr.setRequestHeader(header, options.headers[header])
    })
  }
  if (options.contentType) {
    xhr.setRequestHeader(
      'Content-Type',
      options.contentType || 'application/x-www-form-urlencoded charset=UTF-8'
    )
    if (options.contentType === 'application/json') {
      xhr.data = JSON.stringify(xhr.data)
    }
  }
  if (typeof options.withCredentials !== 'undefined') {
    xhr.withCredentials = options.withCredentials
  }
  xhr.onload = () => {
    if (!(xhr.status >= 200 && xhr.status < 400)) {
      xhr.onerror(xhr)
      return
    }
    xhr._value = xhr.responseText
    xhr._state = 'fulfilled'
    xhr.resolve()
  }
  xhr.onerror = e => {
    xhr._value = xhr.responseText
    xhr._state = 'rejected'
    xhr._error = e
    xhr.catch()
  }
  if (typeof options.beforeSend === 'function') options.beforeSend(xhr)
  setTimeout(() => xhr.send(xhr.data))
  return xhr
}

function xhrThen (onResolve) {
  this._callbacks.push(onResolve)
  return this
}

function xhrCatch (onCatch) {
  if (typeof onCatch === 'function') {
    this._errorHandler = onCatch
  } else if (typeof arg === 'object') {
    this._error = onCatch
  }
  if (this._error && typeof this._errorHandler === 'function') {
    this._errorHandler(this._error)
  }
  return this
}

function xhrResolve () {
  if (typeof this._value === 'object' && typeof this._value.then === 'function') {
    this._value._callbacks = this._value._callbacks.concat(this._callbacks)
    this._value._errorHandler = this._errorHandler
    this._callbacks.length = 0
  } else {
    const handler = this._callbacks.shift()
    if (handler) this._value = handler(this._value)
    if (this._callbacks.length) this.resolve()
  }
}

const ajax = Ajax
export default ajax
