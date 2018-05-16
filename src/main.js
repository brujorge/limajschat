// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import firebase from 'firebase'
import 'vuetify/dist/vuetify.min.css'
import 'mdi/css/materialdesignicons.min.css'
Vue.config.productionTip = false
Vue.use(Vuetify)
/* eslint-disable no-new */
const unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    mounted(){
      if(firebaseUser) {
        store.dispatch('userAutoSignIn', firebaseUser)
      }
    }
  })
  unsubscribe()
})
