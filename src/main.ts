import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import Firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyCtMaIOquerNgeGVbnFse5FX7b6jt7w5-E",
  authDomain: "upizza-soa.firebaseapp.com",
  databaseURL: "https://upizza-soa.firebaseio.com",
  projectId: "upizza-soa",
  storageBucket: "",
  messagingSenderId: "31627757100",
  appId: "1:31627757100:web:f190ee736f633ce1"
}

Firebase.initializeApp(firebaseConfig)

const messaging = Firebase.messaging()
messaging.usePublicVapidKey('BJgy5-tORwT7FS_Xuk4OqZRwHkqERO8pdD8Y8lWZPWzXFG62xRbvEw5n-4LW3497gh4ZGGbVWJR_4E2hv6hBhhM')
messaging.requestPermission().then(() => {
  //get token
  messaging.getToken().then(token => {
    console.log(token)
    localStorage.setItem('client_token', JSON.stringify(token))
  })
  .catch(err => {
    console.log(err)
  })
})
.catch(err => {
  console.log(err)
})

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
