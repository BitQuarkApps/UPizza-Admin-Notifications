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
                <td>{{ props.item.pizza }}</td>
                <td>{{ props.item.cantidad_pizzas }}</td>
                <td>{{ props.item.direccion }}</td>
                <td>{{ props.item.nombre }}</td>
                <td>{{ props.item.telefono }}</td>
                <td>{{ props.item.total }}</td>
                <td>
                  <v-select
                    :items="pedido_options"
                    label="Estado de la compra"
                    solo
                    @change="updateStatus($event, props.item.token, props.item.stripe)"
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
          text: 'Especialidad',
          sortable: true,
          value: 'pizza'
        },
        {
          text: 'Cantidad',
          sortable: true,
          value: 'cantidad_pizzas'
        },
        {
          text: 'Dirección de envío',
          sortable: true,
          value: 'direccion'
        },
        {
          text: 'Cliente',
          sortable: false,
          value: 'nombre'
        },
        {
          text: 'Telefono',
          sortable: false,
          value: 'telefono'
        },
        {
          text: 'Total',
          sortable: true,
          value: 'total'
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
      firestore.collection('pedidos').get()
      .then((querySnapshot) => {
        querySnapshot.forEach(element => {
          if(element.data().cliente != null)
          {
            this.pedidos.push({
              id: element.id,
              pizza: element.data().pizza,
              cantidad_pizzas: element.data().cantidad_pizzas,
              direccion: element.data().direccion,
              nombre: element.data().nombre,
              telefono: element.data().telefono,
              total: element.data().total,
              stripe: element.data().stripe_token,
              token: element.data().cliente// yeah, this is the goog one
            })
          }
        })
      })

    },
    updateStatus(e, token, stripe_token)
    {
      console.log('Cambiando status de la orden')
      console.log(e)// Valor actual del select
      console.log(token)// Token de stripe del cliente
      console.log(stripe_token)// Token de stripe del cliente
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
          //Actualizar el estado de la compra
          const firestore = this.$Firebase.firestore()
          firestore.collection('pedidos').where('stripe_token', '==', stripe_token)
          .get()
          .then(
            (result) => {
              result.forEach(pedido => {
                const ref = firestore.collection('pedidos').doc(pedido.id).update({
                  estado: e
                })
              });
            }
          )
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
