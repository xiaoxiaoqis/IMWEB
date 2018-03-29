import WebIM from '../WebIM/WebIM'
import network from '../network/network'

let config = require('../../config.json')
let storage = window.sessionStorage
export default {
  isNotificationOpened: true,// 是否开启消息提醒,默认开启
  getBaseURL: function (param) {
    network.getBaseURL(param)
  },
  // 登录
  login: function (params) {
    network.loginAccount(params,
      function (res) {
        if (res.ret === 1) {
          console.log('成功获取token！！')
          storage.setItem("token", res.token)
          network.loginIMAccount({
            appkey: config.appkey,
            token: storage.token
          }, function (res) {
            if (res.ret === 1) {
              console.log('获取环信账号成功！！')
              storage.account_id = res.data.account_id
              storage.chat_id = res.data.chat_id
              storage.easemob_pwd = res.data.easemob_pwd
              // HuanxinRegister.register(storage.chat_id, storage.easemob_pwd)
              var options = {
                apiUrl: WebIM.config.apiURL,
                user: storage.chat_id,
                pwd: storage.easemob_pwd,
                appKey: WebIM.config.appkey
              };
              WebIM.conn.open(options)
            } else {
              var error = res
              console.log('获取环信账号失败！！')
              console.log(error.msg)
            }
          })
        } else {
          var error = res
          console.log('未能正确获取中台token！！')
          console.log(error.msg)
        }
      }
    )
  },
  // 登录状态的监听接口
  loginDetect: function (callback) {
    WebIM.conn.listen({
      onOpened: function (message) {          // 连接成功回调
        callback(message, 'open')
      },
      onClosed: function (message) {
        callback(message, 'closed')
      }
    })
  },
  // 接收消息提醒的接口
  openNotification: function () {
    this.isNotificationOpened = true
    console.log('消息提醒已经开启')
  },
  // 关闭消息提醒的接口
  closeNotification: function () {
    this.isNotificationOpened = false
    console.log('消息提醒已经关闭')
  },
  // 获取会话列表的接口
  getConversationList: function (params, callback) {
    network.getConversationList(params, callback)
  },
  // 环信发送消息的接口
  sendMessage: function (params) {
    WebIM.conn.send(params)
  },

  /*  // 发送消息，走环信并加到聊天服务器中
    sendOneMessage: function (param) {
      let a =1
      WebIM.conn.send(param)
      // callback1()
      // setTimeout(function () {
        // network.sendOneMessage(formdata, callback2)
      // }, 2000)
    }, */

  // 聊天服务器添加消息后走环信发送
  saveAndSendMessage: function (param1, param2, callback) {
    network.saveAndSendMessage(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 接收到文本消息的监听接口
  getMsg: function (callback) {
    console.log('接收消息的监听已打开')
    WebIM.conn.listen({
      onTextMessage: function (message) {
        callback(message, 'text')
      },
      onPictureMessage: function (message) {
        callback(message, 'img')
      },
      onFileMessage: function (message) {
        callback(message, 'file')
      },
      onVideoMessage: function (message) {
        callback(message, 'video')
      },
      onAudioMessage: function (message) {
        callback(message, 'audio')
      },
      onLocationMessage: function (message) {
        callback(message, 'loc')
      },//收到位置消息
      onCmdMessage: function (message) {
        callback(message, 'cmd')
      },     // 收到指令/透传消息
    })
  },
  // 获取/检索消息记录
  getMsgRecord: function (params, callback) {
    network.getMsgRecord(params, callback)
  },
  // 搜索全局消息记录
  searchRecordAll: function (params, callback) {
    network.searchRecordAll(params, callback)
  },
  // 添加好友(不验证）
  addFriend: function (param1, param2, callback) {
    network.addFriend(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 获取好友列表
  getFriendList: function (params, callback) {
    network.getFriendList(params, callback)
  },
  // 删除好友
  deleteFriend: function (params, callback) {
    network.deleteFriend(params, callback)
  },
  // 添加好友(需要验证)
  addFriendNeedAccept: function (param1, param2, callback) {
    network.addFriendNeedAccept(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 获取好友通知
  getFriendNotify: function (params, callback) {
    network.getFriendNotify(params, callback)
  },
  // 接收/拒绝好友请求
  acceptFriends: function (param1, param2, callback) {
    network.acceptFriends(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 撤回消息
  withdrawMsg: function (params, callback) {
    network.withdrawMsg(params, callback)
  },
  // 创建群组
  createGroup: function (params, callback) {
    network.createGroup(params, callback)
  },
  // 获取群组详情
  getGroupInfo: function (params, callback) {
    network.getGroupInfo(params, callback)
  },
  // 更新群组信息
  updateGroupInfo: function (params, callback) {
    network.updateGroupInfo(params, callback)
  },
  // 获取群成员列表
  getMemberList: function (params, callback) {
    network.getMemberList(params, callback)
  },
  // 添加群成员
  addMember: function (param1, param2, callback) {
    network.addMember(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 删除群成员
  deleteMember: function (param1, param2, callback) {
    network.deleteMember(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 获取加入的群组列表
  getJoinGroupList: function (params, callback) {
    network.getJoinGroupList(params, callback)
  },
  // 转让群主
  changeGroupOwner: function (param1, param2, callback) {
    network.changeGroupOwner(param2, callback, function () {
      WebIM.conn.send(param1);
    })
  },
  // 添加管理员
  addAdministrator: function (param1, param2, callback) {
    network.addAdministrator(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 移除群管理员
  deleteAdministrator: function (param1, param2, callback) {
    network.deleteAdministrator(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 获取群管理员列表
  getAdminList: function (params, callback) {
    network.getAdminList(params, callback)
  },
  // 解散群组
  disbandGroup: function (param1, param2, callback) {
    network.disbandGroup(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 开启禁言
  addMute: function (param1, param2, callback) {
    network.addMute(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 解除禁言
  deleteMute: function (param1, param2, callback) {
    network.deleteMute(param2, callback, function () {
      WebIM.conn.send(param1)
    })
  },
  // 获取禁言列表
  getMuteList: function (params, callback) {
    network.getMuteList(params, callback)
  },
  // 删除会话
  deleteSession: function (params, callback) {
    network.deleteSession(params, callback)
  },
  // 标记消息已读
  readAllMsg: function (params, callback) {
    network.readAllMsg(params, callback)
  },
  // 删除聊天记录
  deleteMsgRecord: function (params, callback) {
    network.deleteMsgRecord(params, callback)
  }
}
//
// module.exports = {
//   Session: Session
// }
