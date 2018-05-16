<template>
  <v-container grid-list-xs fluid text-xs-center mt-5>
    <v-layout row wrap>
      <v-flex xs12>
        <img src="https://i.imgur.com/HO6xDt5.png" width="180px;" alt="latinchat logo">
      </v-flex>
      <v-flex xs10 sm6 md4 offset-xs1 offset-sm3 offset-md4 mt-3>
        <v-alert type="error" v-model="alertVisible" dismissible>
          {{error}}
        </v-alert>
        <h1>Sign Up</h1>
        <v-form @submit.prevent="userSignUp">
          <v-text-field
            prepend-icon="mdi-email"
            label="Email"
            v-model="email"
          ></v-text-field>
          <v-text-field
            prepend-icon="mdi-account"
            label="Username"
            v-model="username"
          ></v-text-field>
          <v-text-field
            :prepend-icon="passwordIsVisible? 'mdi-eye':'mdi-eye-off'"
            :prepend-icon-cb="() => passwordIsVisible = !passwordIsVisible"
            :type="passwordIsVisible? 'text': 'password'"
            label="Password"
            v-model="password"
          ></v-text-field>
          <v-btn type="submit" :disabled="loading" block color="success">Sign Up</v-btn>
        </v-form>
        <p>Already have an account? <v-btn flat color="primary" to="/">sign in</v-btn></p>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  data: () => ({
    passwordIsVisible: false,
    email: '',
    username: '',
    password: '',
    alertVisible : ''
  }),
  computed: {
    loading(){
      return this.$store.state.loading
    },
    error(){
      return this.$store.state.error
    }
  },
  methods: {
    userSignUp(){
      this.$store.dispatch('userSignUp', {email: this.email, username: this.username, password: this.password})
    }
  },
  watch: {
    error(val) {
      if(val) {
        this.alertVisible = true
      }
    },
    alertVisible(val){
      if(!val){
        this.$store.commit('SET_ERROR', null)
      }
    }
    
  }
}
</script>