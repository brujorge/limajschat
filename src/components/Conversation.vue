<template>
  <v-container fluid grid-list-xs >
    <v-toolbar dark color="primary">
      <v-toolbar-title>{{conversation.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- INICIO FULLSCREEN DIALOG  -->
      <v-dialog
        v-model="settingsDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar color="blue-grey" dark>
            <v-btn @click="settingsDialog = false" icon>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Settings</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click="saveSettings">save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-layout row wrap>
            <v-flex xs8 offset-xs1>
              <v-select
            :items="skills"
            v-model="myUser.skills"
            label="Skills"
            item-text="name"
            return-object
            multiple
            chips
            max-height="auto"
            autocomplete
          >
          <template slot="selection" slot-scope="data">
            <v-chip
            :selected="data.selected"
            :key="JSON.stringify(data.item)"
            close
            class="chip--select-multi"
            @input="data.parent.selectItem(data.item)">
              <v-icon :color="data.item.color" >{{data.item.icon}}</v-icon>
              {{data.item.name}}
            </v-chip>
          </template>
          <template slot="item" slot-scope="data">
            <template>
              <v-list-tile avatar>
                <v-list-tile-action>
                  <v-icon :color="data.item.color">{{data.item.icon}}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>
                  {{data.item.name}}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </template>
          </v-select>
            </v-flex>
          </v-layout>
        </v-card>
      </v-dialog>
      <!-- FIN DIALOG FULLSCREEN -->
      <v-btn @click="drawer = !drawer" icon >
        <v-icon large>mdi-information-outline</v-icon>
      </v-btn>
      <v-menu offset-y>
        <v-btn slot="activator" icon>
          <v-icon large>mdi-dots-vertical</v-icon>
        </v-btn>
        <v-list class="pb-0 pt-0">
          <v-list-tile @click="settingsDialog = true">
            <v-list-tile-content>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>mdi-settings</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="userSignOut">
            <v-list-tile-content>
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-navigation-drawer v-model="drawer" temporary fixed right>
      <v-list two-line="">
        <v-subheader>Conectados</v-subheader>
        <v-list-tile v-for="(user, i) in users" :key="i"  avatar>
          <v-list-tile-avatar>
            <img :src="user.photoURL? user.photoURL: 'https://i.imgur.com/us8ZKZJ.jpg'">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{user.username}}</v-list-tile-title>
            <v-list-tile-sub-title>
              <v-icon :color="skill.color" small v-for="(skill, i) in user.skills" :key="i">{{skill.icon}}</v-icon>
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon :color="user.active? 'green': 'grey'">mdi-circle</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-flex xs12>
      <v-list two-line >
        <v-list-tile :class="myMessage(msg.uid)" avatar v-for="(msg, i) in conversation.messages" :key="i">
          <v-list-tile-avatar v-if="msg.uid!==currentUser.uid">
            <img :src="msg.photoURL? msg.photoURL : 'https://i.imgur.com/us8ZKZJ.jpg'">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title>{{msg.username}}</v-list-tile-sub-title>
            <v-list-tile-title>{{msg.message}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-avatar v-if="msg.uid==currentUser.uid">
            <img :src="msg.photoURL? msg.photoURL : 'https://i.imgur.com/us8ZKZJ.jpg'">
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-flex>
    <v-flex xs12 id="message-input">
    <v-text-field
      prepend-icon="mdi-send"
      label="Escribe algo"
      v-model="message"
      @keyup.enter="sendMessage"
    ></v-text-field>
    </v-flex>
  </v-container>
</template>
<script>
import firebase from 'firebase'
export default {
  data: () => ({
    conversation: {},
    message: '',
    drawer: false,
    settingsDialog : false,
    users: [],
    skills: [
      {name: 'Vue.js', icon: 'mdi-vuejs', color: 'green lighten-1'},
      {name: 'React', icon: 'mdi-react', color: 'cyan'},
      {name: 'AngularJS', icon: 'mdi-angular', color: 'red darken-3'},
      {name: 'Node.js', icon: 'mdi-nodejs', color: 'light-green darken-1'},
      {name: 'CSS3', icon: 'mdi-language-css3', color: 'blue'},
      {name: 'HTML5', icon: 'mdi-language-html5', color: 'orange darken-1'},
    ],
    myUser: {},
  }),
  computed: {
    db(){
      return this.$store.state.db
    },
    currentUser(){
      return this.$store.state.currentUser
    },
    storage(){
      return this.$store.state.storage
    }
  },
  methods: {
    getConversation(){
      const convRef = this.db.doc(`conversations/${this.$route.params.id}`)
      convRef.get()
      .then(doc => {
        this.conversation = doc.data()
      })
     convRef.onSnapshot(doc => {
       this.conversation = doc.data()
     })
    },
    getUsers(){
      this.db.collection('users').onSnapshot(snapshot => {
        const users = []
        snapshot.forEach(doc => {
          users.push(doc.data())
        })
        this.users = users
      })
    },
    sendMessage(){
      let messages = []
      const convRef = this.db.doc(`conversations/${this.$route.params.id}`)
      this.db.runTransaction(transaction=> {
        return transaction.get(convRef).then(doc => {
          messages = doc.data().messages
          messages.push({
            message: this.message,
            username: this.currentUser.displayName,
            uid: this.currentUser.uid,
            photoURL: this.currentUser.photoURL
          })
          transaction.update(convRef, {messages: messages})
          this.message = ''
        })
      })
    },
    myMessage(uid){
      if(uid == this.currentUser.uid) return 'my-message'
      return ''
    },
    userSignOut(){
      this.$store.dispatch('userSignOut')
    },
    getSettings(){
      this.db.doc(`users/${this.currentUser.uid}`).onSnapshot(doc => {
        this.myUser = doc.data()
      })
    },
    saveSettings(){
      this.db.doc(`users/${this.currentUser.uid}`).set({
        skills: this.myUser.skills
      },{merge:true}).then(()=> {
        this.settingsDialog = false
      })
    },
    uploadFile(e){
      const file = e.target.files[0]
      const storageRef = this.storage.ref(`user_photos/${this.currentUser.uid}`)
      const task = storageRef.put(file)
      task.on('state_changed', 
        (snapshot) => {
          let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(percentage);
        },
        () => {},
        () => {
          storageRef.getDownloadURL().then(url => {
            this.db.doc(`users/${this.currentUser.uid}`).set({
              photoURL: url
            },{merge:true})
            firebase.auth().currentUser.updateProfile({
              photoURL: url
            })
          })
        }
      )
    }
  },
  mounted(){
    this.getConversation()
    this.getUsers()
    this.getSettings()
  }
}
</script>
<style>
#message-input{
  position:fixed;
  width: 100%;
  bottom: 0;
}

.my-message .list__tile__sub-title,  .my-message .list__tile__title {
  text-align: right;
}
.container.grid-list-xs {
  padding: 0;
}

</style>
