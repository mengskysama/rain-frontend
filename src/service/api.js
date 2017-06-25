import axios from 'axios'
import router from './../router.js'

let api = {}
export default api

function request (config) {
  return axios(config).then(response => {
    return response.data
  }).catch(err => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          router.replace({path: 'login'})
          break
        case 429:
          return {'errCode': -1, 'errMsg': err.response.data}
      }
      if (err.response.data) return err.response.data
      return {'errCode': -1, 'errMsg': 'exceptin error'}
    } else {
      return {'errCode': -1, 'errMsg': 'connected failed'}
    }
  })
}

function get (url, params) {
  return request({url, params})
}

function post (url, data) {
  return request({
    method: 'post',
    url,
    data,
    requestHeader: {
      'Content-Type': 'application/json'
    }
  })
}

api.login = function (email, password) {
  return post('/capi/user/login', {email, password})
}

api.logout = () => {
  return post('/capi/user/logout')
}

api.register = function (email, password, answered) {
  return post('/capi/user/register', {email, password, answered})
}

api.listTask = function (page) {
  return get('/capi/tasks', {cur_page: page})
}

api.addTask = function (infoHash) {
  return post('/capi/tasks/add', {infoHash})
}

api.listFile = (infoHash) => {
  return get(`/capi/tasks/${infoHash}/files`)
}

api.perFetchMagnet = (magnet) => {
  return get(`/capi/magnet/torrent/prefetch?magnet=${magnet}`)
}

api.fetchMagnet = (uuid, captcha) => {
  return get(`/capi/magnet/torrent/fetch?uuid=${uuid}&captcha=${captcha}`)
}

api.fetchSystemInfo = () => {
  return get(`/capi/system/info`)
}
