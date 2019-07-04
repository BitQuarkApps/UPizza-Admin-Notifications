<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Upizza - Admin</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-data-table
              :headers="headers"
              :items="pedidos"
              class="elevation-4"
            >
              <template v-slot:items="props">
                <td>{{ props.item.id }}</td>
                <td>
                  <v-select
                    :items="pedido_options"
                    label="Estado de la compra"
                    solo
                    @change="updateStatus($event, props.item.token)"
                  ></v-select>
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      headers: [
        {
          text: 'ID',
          sortable: true,
          value: 'id'
        },
        {
          text: 'Acciones',
          sortable: false,
          value: 'token'
        }
      ],
      pedidos: [
      ],
      pedido_options: [
        'Tu pizza ya está en el horno',
        'Le estamos agregando los últimos detalles a tu pizza',
        'Tu pizza ya va en camino'
      ]
    }
  },
  created (){
    this.fetchFirestore()
  },
  methods: {
    fetchFirestore(){
      const firestore = this.$Firebase.firestore()
      firestore.collection('clientes').get()
      .then((querySnapshot) => {
        querySnapshot.forEach(element => {
          if(element.data().token != null)
          {
            this.pedidos.push({
            id: element.id,
            token: element.data().token// yeah, this is the goog one
            })
          }
        })
      })

    },
    updateStatus(e, token)
    {
      console.log('Cambiando status de la orden')
      console.log(e)// Valor actual del select
      console.log(token)// FCM token del cliente
      // this.$axios.post(`https://fcm.googleapis.com/fcm/send`, {
      //   to: token,
      //   notification: {
      //     title: "UPizza",
      //     body: e
      //   },
      //   data: {
      //     body: e,
      //     title: "UPizza"
      //   }
      // })
      const request = this.buildFCMRequest({
        notification: {
          title: "UPizza",
          body: e
        },
        to: token,
        sound: "default",
        priority: "high"
      })

      console.log(request)

      this.$axios(request)
      .then(
        (result) => {
          console.log(result)
        }
      )
      .catch(
        (error) => {
          console.log(error)
        }
      )
    },
    buildFCMRequest(notificationContent){
      return {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "key=AAAAB10pRiw:APA91bHtF1uuPRCKCdLJEDYscATFttsfZig3ywx1Y8qpXeB_20ezL-WBNp7bY-bz2uqP5Zr_IxBTDFt-oeSE_ImGN6R5lXCwoVFUebjqW3Hlm4aga0gX9DPzK279-g077zGzAkAxwuug"
        },
        data: notificationContent
      }
    }
  }
}
</script>
