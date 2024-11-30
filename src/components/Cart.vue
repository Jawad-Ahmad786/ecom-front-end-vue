<template>
  <div>
    <BTableSimple striped>
      <BThead head-variant="dark">
        <BTr>
          <BTh>Product Name</BTh>
          <BTh>Unit Price</BTh>
          <BTh>Qty</BTh>
          <BTh>Sub Total</BTh>
          <BTh>Action</BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr v-if="order && order.items" v-for="item in order.items" :key="item.id">
          <BTd>{{ item.product.name }}</BTd>
          <BTd>{{ item.unit_price }}</BTd>
          <BTd>{{ item.quantity }}</BTd>
          <BTd>{{ item.sub_total }}</BTd>
          <BTd>
            <BButton @click="addItem(item)" size="sm" variant="success">+</BButton>
            <BButton @click="removeItem(item.product_id)" size="sm" variant="danger">-</BButton>
          </BTd>
        </BTr>
        <BTr v-else>
          <BTd>No items in the cart</BTd>
        </BTr>
      </BTbody>
    </BTableSimple>

    <div>

      <BButton size="sm" v-if="order && order.items" @click="showOrderForm" variant="primary">Place Order</BButton>
      <BButton size="sm" v-if="order && order.items" @click="cancelOrder" variant="danger">Cancel Order</BButton>

    </div>

    <!-- Conditionally render the form when the button is clicked -->
    <div v-if="showForm" class="mt-4">
      <h3>Order Details</h3>
      <BForm @submit.prevent="placeOrder">
        <BFormGroup label="Name" label-for="name">
          <BFormInput id="name" v-model="orderForm.name" placeholder="Enter your name" required />
        </BFormGroup>

        <BFormGroup label="Email" label-for="email">
          <BFormInput id="email" v-model="orderForm.email" type="email" placeholder="Enter your email" required />
        </BFormGroup>

        <BFormGroup label="City" label-for="city">
          <BFormSelect id="city" v-model="orderForm.city_id" required>
            <option v-for="city in cities" :value="city.id">{{ city.name }}</option>
          </BFormSelect>
        </BFormGroup>

        <BFormGroup label="Courier" label-for="courier">
          <BFormSelect id="courier" v-model="orderForm.courier_id" required>
            <option v-for="courier in couriers" :value="courier.id">{{ courier.name }}</option>
          </BFormSelect>
        </BFormGroup>

        <BButton class="mt-3" type="submit" variant="success">Submit Order</BButton>
      </BForm>
    </div>
    <!-- Payment Form Component -->
    <PaymentForm v-if="showPaymentForm" :stripePublicKey="stripePublicKey" :orderId="orderId" />
  </div>
</template>

<script>
import {
  BTableSimple,
  BThead,
  BTh,
  BTr,
  BTbody,
  BTd,
  BButton,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect
} from 'bootstrap-vue-next';

import PaymentForm from '@/components/PaymentForm.vue'

export default {
  components: {
    BTableSimple,
    BThead,
    BTh,
    BTr,
    BTbody,
    BTd,
    BButton,
    BForm,
    BFormGroup,
    BFormInput,
    BFormSelect,
    PaymentForm
  },
  data() {
    return {
      orderId: null,
      order: {},
      cart_product: [],
      quantity: [],
      showPaymentForm: false,
      stripePublicKey: null,
      showForm: false, // Controls the display of the form
      cities: [], // Populate with cities from the cities table
      couriers: [], // Populate with couriers from the couriers table
      orderForm: {
        name: '',
        email: '',
        city_id: null,
        courier_id: null
      }
    };
  },
  methods: {
    async cartProducts() {
      await this.$axios.get('cart/cart-items')
        .then(response => {
          this.order = response.data.orders[0];
          this.orderId = this.order.id;
        })
        .catch(error => {
        if(error.status === 404){
           this.order = {};
        }
          console.log(error);
        });
    },
    async addItem(item) {
      if (item.product.stock === 0) {
        alert('Out of stock');
        return;
      }
      this.cart_product.push(item.product_id);
      this.quantity.push(1);
      let data = {
        'product_ids': this.cart_product,
        'quantity': this.quantity
      };
      await this.$axios.post('cart/add-to-cart', data)
        .then(response => {
          alert(response.data.message);
          this.cart_product = [];
          this.quantity = [];
          this.cartProducts();
        })
        .catch(error => {
          console.log(error);
          this.cart_product = [];
          this.quantity = [];
        });
    },
    async removeItem(productId) {
      this.cart_product.push(productId);
      this.quantity.push(1);
      let data = {
        'product_ids': this.cart_product,
        'quantity': this.quantity
      };
      this.$axios.post('cart/delete-cart-items', data)
        .then(response => {
          alert(response.data.message);
          this.cart_product = [];
          this.quantity = [];
          this.cartProducts();
        })
        .catch(error => {
          console.log(error);
        });
    },
    showOrderForm() {
      this.showForm = true;
      this.loadCitiesAndCouriers(); // Load cities and couriers when form is shown
    },
    async loadCitiesAndCouriers() {
      try {
        const citiesResponse = await this.$axios.get('/cities');
        this.cities = citiesResponse.data.data;
        const couriersResponse = await this.$axios.get('/couriers');
        this.couriers = couriersResponse.data.data;
      } catch (error) {
        console.log(error);
      }
    },
    async placeOrder() {
      try {
        const data = {
          name: this.orderForm.name,
          email: this.orderForm.email,
          city_id: this.orderForm.city_id,
          courier_id: this.orderForm.courier_id,
        };
        await this.$axios.post(`orders/place-order/${this.orderId}`, data);
        alert('Order placed successfully!');
        this.resetForm(); // Reset form after submission
        this.cartProducts();
        this.showPaymentForm = true;
      } catch (error) {
        console.log(error);
        alert('Error placing order');
      }
    },
    resetForm() {
      this.orderForm = {
        name: '',
        email: '',
        city_id: null,
        courier_id: null
      };
      this.showForm = false;
    },
    async fetchStripeKey() {
      try {
        const response = await this.$axios.get('/stripe-key');
        this.stripePublicKey = response.data.publicKey;
      } catch (error) {
        console.error(error);
      }
    },
    async cancelOrder(){
      if(confirm('Are yuu sure to delete the order?')){
        await this.$axios.post(`orders/cancel/${this.orderId}`)
          .then(response => {
            alert(response.data);
            this.$router.push({ name: 'Home' });
          })
          .catch(error => {
            console.log(error)
          })
      }
       return
      }
    },
  mounted() {
    this.cartProducts();
    this.fetchStripeKey();
  }
};
</script>

<style scoped>
.mt-4 {
  margin-top: 1.5rem;
}
</style>
