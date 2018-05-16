import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'
Vue.use(Router)

const routerOptions = [
  {path: '/signup' , component: 'SignUp'},
  {path: '/' , component: 'SignIn'},
  {path: '/conversation/:id' , component: 'Conversation', meta: {requiresAuth : true}},
]
const routes = routerOptions.map(route => {
  return { 
    ...route,
    component: () => import (`@/components/${route.component}.vue`)
  }
})

const router = new Router({
  routes,
  mode: 'history'
})

router.beforeEach((to,from,next) => {
 const isAuthenticated = firebase.auth().currentUser
 const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
 if(requiresAuth && !isAuthenticated){
   next('/')
 } else {
   next()
 }
})
export default router