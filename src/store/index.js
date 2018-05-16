import Vuex from 'vuex'
import Vue from 'vue'
import router from '@/router'
import firebase from 'firebase'
import 'firebase/firestore'

Vue.use(Vuex)

firebase.initializeApp({
  apiKey: "AIzaSyCeJynRJ0QDQBxD7m8CIadKoUMwyY9Uwv4",
  authDomain: "latinchat-8fcfe.firebaseapp.com",
  databaseURL: "https://latinchat-8fcfe.firebaseio.com",
  projectId: "latinchat-8fcfe",
  storageBucket: "latinchat-8fcfe.appspot.com",
  messagingSenderId: "209519943605"
})

const state = {
  db: firebase.firestore(),
  storage: firebase.storage(),
  currentUser : null,
  loading: null,
  error: null,
}

const mutations = {
  SET_LOADING(state, payload){
    state.loading = payload
  },
  SET_ERROR(state, payload){
    state.error = payload
  },
  SET_CURRENT_USER(state, payload){
    state.currentUser = payload
  }
}

const actions = {
  userSignUp({commit, rootState}, payload){
    commit('SET_LOADING', true)
    firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
    .then(firebaseUser => {
      firebaseUser.user.updateProfile({
        displayName: payload.username,
      })
      rootState.db.doc(`users/${firebaseUser.user.uid}`).set({
        username: payload.username,
        email: payload.email,
        active:false,
      }).then(() => {
        commit('SET_LOADING', false)
        commit('SET_ERROR', null)
        router.push({path:'/'})
      }).catch(err => console.log(err))
    }).catch(err => {
      commit('SET_LOADING', false)
      commit('SET_ERROR', err.message)
    })
  },
  userSignIn({commit, rootState}, payload){
    commit('SET_LOADING', true)
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
    .then(firebaseUser => {
      console.log(firebaseUser.user)
      commit('SET_LOADING', false)
      commit('SET_CURRENT_USER', firebaseUser.user)
      commit('SET_ERROR', null)
      rootState.db.doc(`users/${firebaseUser.user.uid}`).set({
        active: true
      },{merge:true})
      router.push({path: '/conversation/limajs'})
    }).catch(err => {
      commit('SET_LOADING', false)
      commit('SET_ERROR', err.message)})
  },
  userAutoSignIn({commit, rootState}, payload){
    commit('SET_CURRENT_USER', payload)
    rootState.db.doc(`users/${payload.uid}`).set({
      active: true
    }, {merge: true})
  },
  userSignOut({commit, rootState}){
    rootState.db.doc(`users/${rootState.currentUser.uid}`).set({
      active:false
    }, {merge:true})
    .then(() => {
      firebase.auth().signOut()
      commit('SET_CURRENT_USER', null)
      router.push({path:'/'})
    }).catch(err => console.log(err))
  }
}

const getters = {
  isAuthenticated(state){
    return state.currentUser !== null && state.currentUser !== undefined
  }
}
export default new Vuex.Store({
  state,
  mutations,
  actions
})