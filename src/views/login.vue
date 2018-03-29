<template>
  <div>
    <div class="row">
      <input type="file" ref="file" style="width: 165px;"/>
      <p @click="sendPrivateloc()" style="margin-left: 30px;">确定</p>
    </div>

    <div class="row" style="margin-left: 10px;">
      <p @click="openNotify()">开启消息提醒</p>
      <p @click="closeNotify()" style="margin-left: 30px;">关闭消息提醒</p>
    </div>

    <!--<div>-->
      <!--<p @click="giveDomain()">modify domain name</p>-->
    <!--</div>-->
  </div>
</template>

<style>
  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 270px;
  }

  p {
    font-size: 13px;
  }
</style>

<script>
  import global_ from './global.vue'
  const config = global_.config
  const Session = global_.Session
  const network = global_.network
  import Push from 'push.js'

  export default window.login = {
    methods: {
      giveDomain() {
        Session.getBaseURL('http://idg-xujin.tunnel.nibaguai.com')
      },
      openNotify() {
        Session.openNotification()
      },
      closeNotify() {
        Session.closeNotification()
      },
      // 登录环信
      logina() {
        let params = {
          appkey: config.appkey,
          phone: '13123456782', // 485账户
          password: '123456'
        }
        Session.login(params)
      },
      loginb() {
        let params = {
          appkey: config.appkey,
          phone: '13123456781', // 484账户
          password: '123456'
        }
        Session.login(params)
      },
      // 打开登录成功的监听
      loginDetect() {
        Session.loginDetect(function (message, status) {
          status === 'open' ? console.log('检测到登录成功') : console.log('检测到登录失败')
        })
      },

      // 发送文本消息接口
      sendText(to) {
        var id = WebIM.conn.getUniqueId()       // 生成本地消息id
        var msg = new WebIM.message('txt', id)
        var item_txt = 'hello 你好你好'
        msg.set({
          msg: item_txt,
          to: to ? to : 484,           // 接收消息对象 单聊(chat_id) 群聊(group_id)
          roomType: false,
          chatType: 'singleChat',
          // chatType: 'chatRoom', // 群组
          fail: function (e) {
            console.log('发送消息失败')
          }
        })
        // msg.setGroup('groupchat'); 群组
        var formdata = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          from: window.sessionStorage.chat_id,
          to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
          msgid: id,
          chat_type: 'chat',  // chat/chat_group
          type: 'txt',
          msg: item_txt,
        }
        Session.saveAndSendMessage(msg.body, formdata, function (res) {
          if (res.ret === 1) {
            console.log('消息已添加至服务器')
          }
        })
      },
      // 发送位置消息
      sendPrivateloc(to) {
        var geolocation = new BMap.Geolocation(); // 调用百度mapAPI获取当前位置
        let loc = {}
        geolocation.getCurrentPosition(function (r) {
          loc.lat = r.point.lat
          loc.lng = r.point.lng
          if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            var point = new BMap.Point(r.point.lng, r.point.lat) // 用所定位的经纬度查找所在地省市街道等信息
            var gc = new BMap.Geocoder()
            gc.getLocation(point, function (rs) {
              loc.address = rs.address
              console.log(loc)
              sendLoc(loc)
            })
          } else {
            alert('failed' + this.getStatus());
          }
        }, {
          enableHighAccuracy: true
        })
        function sendLoc(loc) {
          var id = WebIM.conn.getUniqueId();            //生成本地消息id
          var msg = new WebIM.message('location', id); //创建命令消息
          var option = {
            apiUrl: WebIM.config.apiURL,
            to: to ? to : 484,                       // 接收消息对象
            roomType: false,
            chatType: 'singleChat', // 群组 chatType: 'chatRoom'
            addr: loc.address,
            lat: loc.lat,
            lng: loc.lng,
          }
          msg.set(option)
          var formdata = {
            appkey: config.appkey,
            token: window.sessionStorage.token,
            from: window.sessionStorage.chat_id,
            to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
            msgid: id,
            chat_type: 'chat',  // chat/chat_group
            type: 'loc',
            addr: loc.address,
            lat: loc.lat,
            lng: loc.lng
          }
          Session.saveAndSendMessage(msg.body, formdata, function (res) {
            if (res.ret === 1) {
              console.log('位置消息已添加至服务器')
            }
          })
        }
        /* 如果是发送到群组  msg.setGroup('groupchat');*/
//        Session.sendMessage(msg.body)
      },

      // 发送文件消息
      sendFile(to) {
        var id = WebIM.conn.getUniqueId()                   // 生成本地消息id
        var msg = new WebIM.message('file', id)       // 创建文件消息
        var input = this.$refs.file  // 选择文件的input
        var file = WebIM.utils.getFileUrl(input)      // 将文件转化为二进制文件
        var allowType = {
          'jpg': true,
          'gif': true,
          'png': true,
          'bmp': true,
          'zip': true,
          'txt': true,
          'doc': true,
          'pdf': true
        }
        if (file.filetype.toLowerCase() in allowType) {
          console.log(file)
          var option = {
            apiUrl: WebIM.config.apiURL,
            file: file,
            to: to ? to : 484,                       // 接收消息对象
            roomType: false,
            chatType: 'singleChat', // 群组 chatType: 'chatRoom'
            onFileUploadError: function () {      // 消息上传失败
              console.log('onFileUploadError')
            },
            onFileUploadComplete: function () {   // 消息上传成功
              console.log('onFileUploadComplete')
            },
            success: function () {                // 消息发送成功
              var formdata = {
                appkey: config.appkey,
                token: window.sessionStorage.token,
                from: window.sessionStorage.chat_id,
                to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
                msgid: id,
                chat_type: 'chat',  // chat/chat_group
                type: 'file',
                url: msg.body.body.url,
                secret: msg.body.body.secret,
                filename: file.filename
              }
              network.sendOneMessage(formdata, function (res) {
                if (res.ret === 1) {
                  console.log('文件已添加至服务器')
                }
              })
            },
            flashUpload: WebIM.flashUpload
          }
          msg.set(option)
          Session.sendMessage(msg.body)
        }
        else {
          console.log('文件类型不合适')
        }
      },

      // 发送图片消息
      sendPrivateImg(to) {
        var id = WebIM.conn.getUniqueId()                   // 生成本地消息id
        var msg = new WebIM.message('file', id)       // 创建文件消息
        var input = this.$refs.file // 选择文件的input
        var file = WebIM.utils.getFileUrl(input)      // 将文件转化为二进制文件
        var allowType = {
          'jpg': true,
          'gif': true,
          'png': true,
          'bmp': true,
        }
        if (file.filetype.toLowerCase() in allowType) {
          console.log(file)
          var option = {
            apiUrl: WebIM.config.apiURL,
            file: file,
            to: to ? to : 484,                       // 接收消息对象
            roomType: false,
            chatType: 'singleChat', // 群组 chatType: 'chatRoom'
            onFileUploadError: function () {      // 消息上传失败
              console.log('onFileUploadError')
            },
            onFileUploadComplete: function () {   // 消息上传成功
              console.log('onFileUploadComplete')
            },
            success: function () {                // 消息发送成功
              var formdata = {
                appkey: config.appkey,
                token: window.sessionStorage.token,
                from: window.sessionStorage.chat_id,
                to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
                msgid: id,
                chat_type: 'chat',  // chat/chat_group
                type: 'img',
                url: msg.body.body.url,
                secret: msg.body.body.secret,
                filename: file.filename
              }
              network.sendOneMessage(formdata, function (res) {
                if (res.ret === 1) {
                  console.log('图片已添加至服务器')
                }
              })
            },
            flashUpload: WebIM.flashUpload
          }
          msg.set(option)
          Session.sendMessage(msg.body)
        }
        else {
          console.log('图片类型不合适')
        }
      },
      // 发送音频消息
      sendPrivateAudio(to) {
        var id = WebIM.conn.getUniqueId()
        var msg = new WebIM.message('audio', id)
        var input = this.$refs.file
        var audio = WebIM.utils.getFileUrl(input)
        var allowType = {
          'mp3': true,
          'amr': true,
          'wmv': true
        };
        if (audio.filetype.toLowerCase() in allowType) {
          var option = {
            apiUrl: WebIM.config.apiURL,
            file: audio,
            to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
            roomType: false,
            chatType: 'singleChat',
            onFileUploadError: function () {      // 消息上传失败
              console.log('onFileUploadError');
            },
            onFileUploadComplete: function () {   // 消息上传成功
              console.log('onFileUploadComplete');
            },
            success: function () {                // 消息发送成功
              console.log('success')
              var formdata = {
                appkey: config.appkey,
                token: window.sessionStorage.token,
                from: window.sessionStorage.chat_id,
                to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
                msgid: id,
                chat_type: 'chat',  // chat/chat_group
                type: 'audio',
                url: msg.body.body.url,
                secret: msg.body.body.secret,
                filename: audio.filename
              }
              network.sendOneMessage(formdata, function (res) {
                if (res.ret === 1) {
                  console.log('音频文件已添加至服务器')
                }
              })
            },
            flashUpload: WebIM.flashUpload
          }
          msg.set(option)
          Session.sendMessage(msg.body)
        }
        else {
          console.log('音频类型不合适')
        }
      },

      // 发送视频消息
      sendPrivateVideo(to) {
        var id = WebIM.conn.getUniqueId()                   // 生成本地消息id
        var msg = new WebIM.message('file', id)       // 创建文件消息
        var input = this.$refs.file  // 选择文件的input
        var file = WebIM.utils.getFileUrl(input)      // 将文件转化为二进制文件
        var allowType = {
          'mp4': true,
          'wmv': true,
          'avi': true,
          'rmvb': true,
          'mkv': true
        }
        if (file.filetype.toLowerCase() in allowType) {
          console.log(file)
          var option = {
            apiUrl: WebIM.config.apiURL,
            file: file,
            to: to ? to : 484,                       // 接收消息对象
            roomType: false,
            chatType: 'singleChat', // 群组 chatType: 'chatRoom'
            onFileUploadError: function () {      // 消息上传失败
              console.log('onFileUploadError')
            },
            onFileUploadComplete: function () {   // 消息上传成功
              console.log('onFileUploadComplete')
            },
            success: function () {                // 消息发送成功
              var formdata = {
                appkey: config.appkey,
                token: window.sessionStorage.token,
                from: window.sessionStorage.chat_id,
                to: to ? to : 484,  // 单聊(chat_id) 群聊(group_id)
                msgid: id,
                chat_type: 'chat',  // chat/chat_group
                type: 'video',
                url: msg.body.body.url,
                secret: msg.body.body.secret,
                filename: file.filename
              }
              network.sendOneMessage(formdata, function (res) {
                if (res.ret === 1) {
                  console.log('视频已添加至服务器')
                }
              })
            },
            flashUpload: WebIM.flashUpload
          }
          msg.set(option)
          Session.sendMessage(msg.body)
        }
        else {
          console.log('视频类型不合适')
        }
      },
      // 发送透传消息
      sendTransMsg(to) {
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: 'msg',
          to: to ? to : 484,                      //接收消息对象
          action: 'action',                    //用户自定义，cmd消息必填
          ext: {'extmsg': 'extends messages'},    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('成功发送透传消息')
          },
          fail: function (e) {
            console.log('透传消息发送失败')
          }
        })
        /* 如果是发送到群组  msg.setGroup('groupchat');*/
        Session.sendMessage(msg.body);
      },

      // 获取文本/文件/图片/视频消息的监听
      getMsg() {
        Session.getMsg(function (message, type) {
          switch (type) {
            case 'text':
              console.log('收到' + message.from + '发送的文本消息：', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: message.data,
                  timeout: 2500
                })
              }
              break
            case 'file':
              console.log('收到' + message.from + '发送的文件：', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[文件消息]',
                  timeout: 2500
                })
              }
              break
            case 'img':
              console.log('收到' + message.from + '发送的图片：', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[图片消息]',
                  timeout: 2500
                })
              }
              break
            case 'video':
              console.log('收到' + message.from + '发送的视频：', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[视频消息]',
                  timeout: 2500
                })
              }
              break
            case 'cmd':
              console.log('收到' + message.from + '发送的指令消息：', message, type)
              break
            case 'audio':
              console.log('收到' + message.from + '发送的音频消息：', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[音频消息]',
                  timeout: 2500
                })
              }
              break
            case 'loc':
              console.log('收到' + message.from + '发送的位置消息', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[位置消息]',
                  timeout: 2500
                })
              }
              break
            default:
              console.log('收到' + message.from + '发送的消息', message, type)
              if (Session.isNotificationOpened) {
                Push.create(message.from, {
                  body: '[未知类型消息]',
                  timeout: 2500
                })
              }
          }
        })
      },

      // 获取会话列表
      getConverList() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token
        }
        Session.getConversationList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取/检索跟特定对象的消息记录
      getMsgRecord(to, key) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          to: to ? to : 484, // chat_id/group_id
          chat_type: 'chat', // 'chat'/'chat_group'
          search: key ? key : ''
        }
        Session.getMsgRecord(formData, function (res) {
          if (res.ret === 1) {
            var arr = []
            for (var i = 0; i < res.data.length; i++) {
              if (res.data[i].delete !== '4') {
                arr.push(res.data[i])
              }
            }
            console.log(arr)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 搜索全局消息记录
      searchRecordAll(key) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          key: key ? key : 'xx'
        }
        Session.searchRecordAll(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 添加好友,不需要验证
      addFriend(aid, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          account_id: aid ? aid : '220448ae695d413bbbef21c3f6ee08fa',
          channel: 0
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '添加好友',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'add friend',                    //用户自定义，cmd消息必填
          ext: {'sender': window.sessionStorage.chat_id},    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('成功发送透传消息')
          },
          fail: function (e) {
            console.log('透传消息发送失败')
          }
        })
        /* 如果是发送到群组  msg.setGroup('groupchat');*/

        Session.addFriend(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
            console.log('好友已添加')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取好友列表
      getFriendList() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token
        }
        Session.getFriendList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 删除好友
      deleteFriend(aid) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          account_id: aid ? aid : '220448ae695d413bbbef21c3f6ee08fa'
        }
        Session.deleteFriend(formData, function (res) {
          if (res.ret === 1) {
            console.log('好友已删除')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 添加好友，需要验证
      addFriendNeedAccept(aid, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          account_id: aid ? aid : '220448ae695d413bbbef21c3f6ee08fa', // 默认添加484账户
          message: '我是渣渣灰'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '添加好友',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'add friend request',                    //用户自定义，cmd消息必填
          ext: {'sender': window.sessionStorage.chat_id},    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('成功发送好友添加请求')
          },
          fail: function (e) {
            console.log('好友添加请求发送失败')
          }
        })
        /* 如果是发送到群组  msg.setGroup('groupchat');*/

        Session.addFriendNeedAccept(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
            console.log('好友请求已发送')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取好友验证通知
      getFriendNotify() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token
        }
        Session.getFriendNotify(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 同意/拒绝添加好友
      acceptFriends(aid, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          account_id: aid ? aid : '8438061d4b4e4c738e7286b11cccd2d9', // 默认添加484账户
          status: 'ACCEPT' // 'ACCEPT'/'REJECT'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '添加申请结果',
          to: chat_id ? chat_id : 485,                    //接收消息对象
          action: 'add friend result',                    //用户自定义，cmd消息必填
          ext: {
            'sender': window.sessionStorage.chat_id,
            'status': 'ACCEPT'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('发送成功')
          },
          fail: function (e) {
            console.log('发送失败')
          }
        })

        Session.acceptFriends(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 撤回消息(消息撤回以后该消息打标记'delete'= '4')
      withdrawMsg(msgid) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          msgid: msgid
        }
        Session.withdrawMsg(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 创建群组
      createGroup(name) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          name: name ? name : 'test'
          // channel avatar desc为可选字段
        }
        Session.createGroup(formData, function (res) {
          if (res.ret === 1) {
            console.log('创建群组成功')
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 查看群组详情
      getGroupInfo(gid) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: gid ? gid : '43449228263426'
        }
        Session.getGroupInfo(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 编辑群组信息
      updateGroupInfo(gid) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: gid ? gid : '43449228263426',
          name: 'name1',
          desc: 'desc1'
          // avatar为可选字段
        }
        Session.updateGroupInfo(formData, function (res) {
          if (res.ret === 1) {
            console.log('群组信息已更新')
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取群成员列表
      getMemberList(gid) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: gid ? gid : '43449928712194'
        }
        Session.getMemberList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 添加群成员
      addMember(gid, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: gid ? gid : '43449563807746',
          account_id: JSON.stringify(['ca6a754139df48e1b6cbc45bd3b98037', '220448ae695d413bbbef21c3f6ee08fa'])
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '被添加进群',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'add to group',                    //用户自定义，cmd消息必填
          ext: {
            'sender': window.sessionStorage.chat_id,
            'group_id': gid ? gid : '43449928712194'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('加群通知发送成功')
          },
          fail: function (e) {
            console.log('加群通知发送失败')
          }
        })
        Session.addMember(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('成功添加成员')
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 删除群成员
      deleteMember(gid, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: gid ? gid : '43449563807746',
          account_id: JSON.stringify(['ca6a754139df48e1b6cbc45bd3b98037', '220448ae695d413bbbef21c3f6ee08fa'])
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '被移除出群',
//          to: chat_id ? chat_id : 484,                    //接收消息对象
          to: chat_id ? chat_id : 484,
          action: 'remove from group',                    //用户自定义，cmd消息必填
          ext: {
            'sender': window.sessionStorage.chat_id,
            'group_id': gid ? gid : '43449928712194'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('移除出群通知发送成功')
          },
          fail: function (e) {
            console.log('移除出群通知发送失败')
          }
        })
        Session.deleteMember(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('成功删除成员')
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取加入的群组列表
      getGroupList() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token
        }
        Session.getJoinGroupList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 转让群主
      changeGroupOwner(group_id, account_id, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449228263426',
          account_id: account_id ? account_id : '220448ae695d413bbbef21c3f6ee08fa'
        }

        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '被任命为新群主',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'set up as group owner',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'group_id': group_id ? group_id : '43449228263426'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
          },
          fail: function (e) {
          }
        })

        Session.changeGroupOwner(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('群主已转让')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 添加群管理员
      addAdmin(group_id, chat_id, account_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449292226561',
          account_id: account_id ? account_id : '220448ae695d413bbbef21c3f6ee08fa'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '被群主设为管理员',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'set up as an administrator',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'group_id': group_id ? group_id : '43449292226561'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
          },
          fail: function (e) {
          }
        })
        Session.addAdministrator(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('已添加群管理员')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 移除群管理员
      deleteAdmin(group_id, account_id, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449292226561',
          account_id: account_id ? account_id : '220448ae695d413bbbef21c3f6ee08fa'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '被群主移除管理员',
          to: chat_id ? chat_id : 484,                    //接收消息对象
          action: 'canceled as an administrator',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'group_id': group_id ? group_id : '43449292226561'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
          },
          fail: function (e) {
          }
        })
        Session.deleteAdministrator(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('已移除群管理员')
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 获取群管理员列表
      getAdminList(group_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449228263426'
        }
        Session.getAdminList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 解散群组
      disbandGroup(group_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449228263426'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '群已解散',
          to: group_id ? group_id : '43449228263426',                    //接收消息对象
          action: 'group disbanded',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'group_id': group_id ? group_id : '43449228263426'
          },    //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
          },
          fail: function (e) {
          }
        })
        Session.disbandGroup(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 开启禁言
      addMute(group_id, account_id, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449292226561',
          account_id: account_id ? account_id : '220448ae695d413bbbef21c3f6ee08fa'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '禁言',
          to: group_id ? group_id : '43449292226561',                    //接收消息对象
          chatType: 'chatRoom',
          action: 'group mute',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'aimer': chat_id ? chat_id : 484,
            'group_id': group_id ? group_id : '43449292226561'
          },
          success: function (id, serverMsgId) {
          },
          fail: function (e) {
          }
        })
        msg.setGroup('groupchat')
        Session.addMute(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('成功禁言')
          } else {
            let error = res
            console.log(error)
            console.log('禁言失败') // error.res  error.data
          }
        })
      },

      // 解除禁言
      deleteMute(group_id, account_id, chat_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449292226561',
          account_id: account_id ? account_id : '220448ae695d413bbbef21c3f6ee08fa'
        }
        // msg为透传消息体
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
          msg: '解除禁言',
          to: group_id ? group_id : '43449292226561',                    //接收消息对象
          chatType: 'chatRoom',
          action: 'release group mute',                    //用户自定义，cmd消息必填
          ext: {
            'setter': window.sessionStorage.chat_id,
            'aimer': chat_id ? chat_id : 484,
            'group_id': group_id ? group_id : '43449292226561'
          },
          success: function (id, serverMsgId) {
            console.log('成功发送透传消息')
          },
          fail: function (e) {
          }
        })
        msg.setGroup('groupchat')
        Session.deleteMute(msg.body, formData, function (res) {
          if (res.ret === 1) {
            console.log('成功解除禁言')
          } else {
            let error = res
            console.log(error)
            console.log('解除禁言失败') // error.res  error.data
          }
        })
      },

      // 获取禁言列表
      getMuteList(group_id) {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          group_id: group_id ? group_id : '43449292226561',
        }

        Session.getMuteList(formData, function (res) {
          if (res.ret === 1) {
            console.log(res.data)
          } else {
            let error = res
            console.log(error) // error.res  error.data
          }
        })
      },

      // 删除会话
      deleteSession() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          chat_type: 'chat', // chat chat_group
          to: 484 // chat_id group_id
        }
        Session.deleteSession(formData, function (res) {
          if (res.ret === 1) {
            console.log('会话删除成功')
          } else {
            console.log('会话删除失败') // error.res  error.data
          }
        })
      },

      // 标记会话消息已读
      readAllMsg() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          from: 484, // chat_id group_id
          chat_type: 'chat' // chat chat_group
        }
        Session.readAllMsg(formData, function (res) {
          if (res.ret === 1) {
            console.log('会话标记已读成功')
          } else {
            console.log('会话标记已读失败') // error.res  error.data
          }
        })
      },

      // 删除聊天记录
      deleteMsgRecord() {
        let formData = {
          appkey: config.appkey,
          token: window.sessionStorage.token,
          to: 505, // chat_id group_id
          chat_type: 'chat' // chat chat_group
        }
        Session.deleteMsgRecord(formData, function (res) {
          if (res.ret === 1) {
            console.log('聊天记录已删除')
          } else {
            console.log('聊天记录删除失败') // error.res  error.data
          }
        })
      }
    }
  }
</script>



