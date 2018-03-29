import axios from 'axios'
import qs from 'qs'

var config = require('../../config.json')
axios.defaults.timeout = config.timeout
axios.defaults.baseURL = ''

export default {
  getBaseURL: function (url) {
    axios.defaults.baseURL = url
  },
  getRequest: function (url, data, callback) {
    return this.request('GET', url, data, callback)
  },
  postRequest: function (url, data, callback) {
    return this.request('POST', url, data, callback)
  },
  postRequest2: function (url, data, callback, callback2) {
    return this.request2('POST', url, data, callback, callback2)
  },
  equeue: function (method, url, data, callback) {
    url = url + '?' + config.dev

    var self = this
    window.axios = axios
    if (method === 'POST') {
      let fn = function (n) {
        axios.post(url, qs.stringify(data))
          .then(function (response) {
            callback(response)
          })
          .catch(function (error) {
            if (n < 2) {
              error.ret = error.ret ? error.ret : -1
              error.msg = error.msg || '网络请求失败'

              callback(error)
              // self.showError(error)
            } else {
              fn(n - 1)
            }
          })
      }
      return fn(2)
    } else {
      if (data) {
        Object.keys(data).map(function (key) {
          url = url + '&' + key + '=' + data[key]
        })
      }

      let fn = function (n) {
        axios.get(url)
          .then(function (response) {
            callback(response)
          })
          .catch(function (error) {
            if (n < 2) {
              error.ret = error.ret ? error.ret : -1
              error.msg = error.msg || '网络请求失败'

              callback(error)
              // self.showError(error)
            } else {
              console.log(' ----------> 请求失败，重新请求,url=', url)
              fn(n - 1)
            }
          })
      }

      return fn(2)
    }
  },
  request: function (method, url, data, callback) {
    console.log('------->method=' + method + ',url=' + url + ',data=', data)

    var self = this

    function networkResponse(response) {
      console.log('请求结束', response)

      let error = {}

      console.log('----------->   method=' + method + ',url=' + url + ',data=', data, 'response=', response)
      if (response.status === 200) {
        var res = response.data
        if (!res.ret) {
          res = JSON.parse(res)
        }
        if (res.ret === 1) {
          // 请求成功
          if (callback) {
            callback(res)
          }
        } else {
          error.ret = res.ret ? res.ret : -1
          error.msg = res.msg ? res.msg : '获取数据失败'
          // self.showError(error)
          if (callback) {
            callback(error)
          }
        }
      } else {
        error.ret = response.status ? response.status : -1
        error.msg = response.msg || '网络请求失败'
        // self.showError(error)
        if (callback) {
          callback(error)
        }
      }
    }

    this.equeue(method, url, data, networkResponse)
  },

  request2: function (method, url, data, callback, callback2) {
    console.log('------->method=' + method + ',url=' + url + ',data=', data)

    var self = this

    function networkResponse(response) {
      console.log('请求结束', response)

      let error = {}

      console.log('----------->   method=' + method + ',url=' + url + ',data=', data, 'response=', response)
      if (response.status === 200) {
        var res = response.data
        if (!res.ret) {
          res = JSON.parse(res)
        }
        if (res.ret === 1) {
          // 请求成功
          if (callback) {
            callback(res)
            callback2()
          }
        } else {
          error.ret = res.ret ? res.ret : -1
          error.msg = res.msg ? res.msg : '获取数据失败'
          // self.showError(error)
          if (callback) {
            callback(error)
          }
        }
      } else {
        error.ret = response.status ? response.status : -1
        error.msg = response.msg || '网络请求失败'
        // self.showError(error)
        if (callback) {
          callback(error)
        }
      }
    }

    this.equeue(method, url, data, networkResponse)
  },


  registerAccount: function (params, callback) {
    this.postRequest(config.api.registerAccount, params, callback)
  },
  getConversationList: function (params, callback) {
    this.postRequest(config.api.getConversationList, params, callback)
  },
  loginAccount: function (params, callback) {
    this.postRequest(config.api.loginAccount, params, callback)
  },
  loginIMAccount: function (params, callback) {
    this.postRequest(config.api.loginIMAccount, params, callback)
  },
  sendOneMessage: function (params, callback) {
    this.postRequest(config.api.sendOneMessage, params, callback)
  },
  saveAndSendMessage: function (params, callback, callback2) {
    this.postRequest2(config.api.sendOneMessage, params, callback, callback2)
  },
  getMsgRecord: function (params, callback) {
    this.postRequest(config.api.getMsgRecord, params, callback)
  },
  searchRecordAll: function (params, callback) {
    this.postRequest(config.api.searchRecordAll, params, callback)
  },
  addFriend: function (params, callback, callback2) {
    this.postRequest2(config.api.addFriend, params, callback, callback2)
  },
  getFriendList: function (params, callback) {
    this.postRequest(config.api.getFriendList, params, callback)
  },
  deleteFriend: function (params, callback) {
    this.postRequest(config.api.deleteFriend, params, callback)
  },
  addFriendNeedAccept: function (params, callback, callback2) {
    this.postRequest2(config.api.addFriendNeedAccept, params, callback, callback2)
  },
  getFriendNotify: function (params, callback) {
    this.postRequest(config.api.getFriendNotify, params, callback)
  },
  acceptFriends: function (params, callback, callback2) {
    this.postRequest2(config.api.acceptFriends, params, callback, callback2)
  },
  withdrawMsg: function (params, callback) {
    this.postRequest(config.api.withdrawMsg, params, callback)
  },
  createGroup: function (params, callback) {
    this.postRequest(config.api.createGroup, params, callback)
  },
  getGroupInfo: function (params, callback) {
    this.postRequest(config.api.getGroupInfo, params, callback)
  },
  updateGroupInfo: function (params, callback) {
    this.postRequest(config.api.updateGroupInfo, params, callback)
  },
  getMemberList: function (params, callback) {
    this.postRequest(config.api.getMemberList, params, callback)
  },
  addMember: function (params, callback, callback2) {
    this.postRequest2(config.api.addMember, params, callback, callback2)
  },
  deleteMember: function (params, callback, callback2) {
    this.postRequest2(config.api.deleteMember, params, callback, callback2)
  },
  getJoinGroupList: function (params, callback) {
    this.postRequest(config.api.getJoinList, params, callback)
  },
  changeGroupOwner: function (params, callback, callback2) {
    this.postRequest2(config.api.changeGroupOwner, params, callback, callback2)
  },
  addAdministrator: function (params, callback, callback2) {
    this.postRequest2(config.api.addAdministrator, params, callback, callback2)
  },
  deleteAdministrator: function (params, callback, callback2) {
    this.postRequest2(config.api.deleteAdministrator, params, callback, callback2)
  },
  getAdminList: function (params, callback) {
    this.postRequest(config.api.getAdminList, params, callback)
  },
  disbandGroup: function (params, callback, callback2) {
    this.postRequest2(config.api.disbandGroup, params, callback, callback2)
  },
  addMute: function (params, callback, callback2) {
    this.postRequest2(config.api.addMute, params, callback, callback2)
  },
  deleteMute: function (params, callback, callback2) {
    this.postRequest2(config.api.deleteMute, params, callback, callback2)
  },
  getMuteList: function (params, callback) {
    this.postRequest(config.api.getMuteList, params, callback)
  },
  deleteSession: function (params, callback) {
    this.postRequest(config.api.deleteSession, params, callback)
  },
  readAllMsg: function (params, callback) {
    this.postRequest(config.api.readAllMsg, params, callback)
  },
  deleteMsgRecord: function (params, callback) {
    this.postRequest(config.api.deleteMsgRecord, params, callback)
  }
}

// module.exports = network
