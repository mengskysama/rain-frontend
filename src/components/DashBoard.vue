<template>
  <div class="colmain">
    <!-- task table -->
    <el-table
      :data="taskList"
      v-loading.body="isLoading"
      element-loading-text="Loading ..."
      stripe
      empty-text="Nothing"
      highlight-current-row
      style="width: 100%;">
      <el-table-column
        label="Name"
        align="left"
        :context="_self"
        inline-template
        min-width="200">
        <div>
          <a v-on:click="handleFolderDetail(row)">{{row.name}}</a>
        </div>
      </el-table-column>
      <el-table-column
        label="Progress"
        align="center"
        :context="_self"
        inline-template
        width="140"
        min-width="140">
        <el-button
          <el-progress 
          :stroke-width="14" 
          :text-inside="true" 
          :percentage="Number(row.progress.toFixed(1))">
          </el-progress>
        </el-button>
      </el-table-column>
      <el-table-column
        align="left"
        :context="_self"
        width="120"
        min-width="120"
        inline-template
        label="Size">
        <div>
          {{(row.total_size/1024/1024).toFixed(1)}} MB
        </div>
      </el-table-column>
      <el-table-column
        align="center"
        label="Created Time"
        :context="_self"
        inline-template
        width="150"
        min-width="150">
        <div>
          {{formatTime(row.create_time)}}
        </div>
      </el-table-column>
    </el-table>

    <div class="block">
      <el-pagination
        layout="prev, pager, next"
        :page-size="pageSize"
        :current-page.sync="currentPage"
        @current-change="pageChange"
        :total="total">
      </el-pagination>
    </div>

    <!-- file table -->
    <el-dialog title="Files" v-model="dialogDetail" size="large">
      <el-input type="textarea" v-show="fileUrl!==''" v-model="fileUrl"></el-input>
      <el-table
        :data="fileList"
        empty-text="loading..."
        @selection-change="">
        <el-table-column
          type="selection"
          align="center"
          width="80">
        </el-table-column>
        <el-table-column
          property="name"
          label="File"
          align="center"
          min-width="120">
        </el-table-column>
        <el-table-column
          align="center"
          :context="_self"
          width="120"
          inline-template
          label="size">
          <div>
              {{(row.size/1024/1024).toFixed(1)}} MB
          </div>
        </el-table-column>
        <el-table-column label="操作"
        align="center"
        width="180"
        >
          <template scope="scope">
            <el-button v-for="link in scope.row.links"
              size="small"
              @click="open(link.url)">{{link.location}}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handlePlay(scope.row.links[0].url)">Play</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Task upload -->
    <el-row style="margin-top: 50px">
      <el-col :span="24">
        <el-upload
          class="upload"
          drag
          :on-success="handleTorrentUploaded"
          :before-upload="handleTorrentUploade"
          ref="upload"
          action="/capi/torrent/upload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">上传torrent文件，且不超过1024kb</div>
        </el-upload>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="14" :offset="5">
      <el-input v-show="displayMagnetUrl" v-model="magnetUrl" placeholder="magnet://"></el-input>
      </el-col>
    </el-row>
    <el-row v-show="displayMagnetCaptchaImg" style="margin-top: 10px">
      <img :src="magnetCaptchaImg" style="margin-bottom: -14px;"></img>
      <el-input v-model="magnetCaptcha" placeholder="" style="width: 80px"></el-input>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="14" :offset="5">
      <el-button type="info" @click="onSubmit" > 提交任务 - 任务提交后无法主动删除 </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from 'src/service/api'
var moment = require('moment')

export default {
  props: [],
  components: {
  },
  data () {
    return {
      articles: [],
      currentPage: 1,
      pageSize: 12,
      total: 0,
      isLoading: false,
      taskList: [],
      dialogDetail: false,
      dialogDplay: false,
      fileList: [],
      dialogTableVisible: false,
      multipleSelection: [],
      fileUrl: '',
      magnetUrl: '',
      displayMagnetUrl: true,
      infoHash: '',
      timerFetch: null,
      magnetPerFetchUUID: '',
      magnetCaptchaImg: '',
      magnetCaptcha: '',
      displayMagnetCaptchaImg: false
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.fetchTask()
      this.timerFetch = setInterval(this.fetchTask, 5000)
    })
  },
  beforeDestroy () {
    clearInterval(this.timerFetch)
  },
  methods: {
    onSubmit () {
      if (this.magnetCaptcha) {
        // fetch magnet
        api.fetchMagnet(this.magnetPerFetchUUID, this.magnetCaptcha).then(response => {
          this.displayMagnetUrl = true
          this.displayMagnetCaptchaImg = false
          this.magnetCaptchaImg = ''
          this.magnetCaptcha = ''
          if (response.errCode !== 0) {
            this.$message.warning(response.errMsg)
          } else {
            this.magnetUrl = ''
            this.infoHash = response.data
            this.onSubmit()
          }
        })
      } else if (this.magnetUrl) {
        // use magnet
        api.perFetchMagnet(this.magnetUrl).then(response => {
          if (response.errCode !== 0) {
            this.$message.warning(response.errMsg)
            this.displayMagnetUrl = true
          } else {
            this.magnetCaptcha = ''
            this.displayMagnetCaptchaImg = true
            this.magnetPerFetchUUID = response.data
            this.magnetCaptchaImg = `/capi/magnet/torrent/prefetch/captcha?uuid=${response.data}`
          }
        })
      } else {
        // use uploaded torrent
        this.$refs.upload.clearFiles()
        api.addTask(this.infoHash).then(response => {
          this.displayMagnetUrl = true
          this.infoHash = ''
          if (response.errCode !== 0) {
            this.$message.warning(response.errMsg)
          } else {
            this.$message.success(response.errMsg)
            this.currentPage = 1
          }
        })
      }
    },
    handleTorrentUploade () {
      this.displayMagnetUrl = false
      this.magnetUrl = ''
    },
    handleTorrentUploaded (response, file, fileList) {
      this.infoHash = response.data
    },
    formatTime (timeStr) {
      return moment(timeStr).local().format('YYYY-MM-DD HH:mm')
    },
    handleFolderDetail (row) {
      this.dialogDetail = true
      this.fileUrl = ''
      this.fetchFile(row.info_hash)
    },
    pageChange (page) {
      this.fetchTask()
    },
    fetchTask () {
      api.listTask(this.currentPage).then(response => {
        if (response.errCode === 0) {
          this.taskList = response.data
          this.total = response.total
        } else {
          this.$message.warning(response.errMsg)
        }
      })
    },
    fetchFile (infoHash) {
      this.fileList = []
      api.listFile(infoHash).then(response => {
        if (response.errCode === 0) {
          this.fileList = response.data
        } else {
          this.$message.warning(response.errMsg)
        }
      })
    },
    open (url) {
      window.open(url)
    },
    handlePlay (url) {
      this.$router.push({name: 'player', query: {url}})
      // this.dialogDplay = true
      // this.play(url)
    }
  }
}
</script>

<style scoped>
.block {
    margin: 10px;
}
a:link {color: black; text-decoration: none}
a:visited {color: black; text-decoration: none}
a:hover {color: black; text-decoration: none; cursor:pointer}
a:active {color: black; text-decoration: none}

</style>